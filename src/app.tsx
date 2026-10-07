import { homedir } from 'node:os';

import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useEffect, useState } from 'react';

import { WORDMARK } from './lib/logo';
import type { CliArgs } from './lib/parse-args';
import { nextTheme, resolveTheme, themes, type ThemeName } from './theme';
import { EngineError, type Engine, type FormatOption, type Progress } from './types';

export type Status = 'input' | 'probing' | 'picking' | 'downloading' | 'done' | 'error' | 'history';

// SPEC section 3 as data, so the test reads the table instead of restating it.
// A click on the wordmark is a wildcard back to input, applied in nextStatus.
export const transitions: Record<Status, Record<string, Status>> = {
  input: { submit: 'probing', history: 'history' },
  probing: { 'probe-ok': 'picking', 'probe-fail-fallback': 'probing', 'probe-fail': 'error' },
  picking: { confirm: 'downloading', back: 'input' },
  downloading: { success: 'done', failure: 'error' },
  done: { back: 'input' },
  error: { back: 'input' },
  history: { back: 'input' },
};

export const LOGO_EVENT = 'logo';
export const SUBMIT_EVENT = 'submit';
export const BACK_EVENT = 'back';
export const CONFIRM_EVENT = 'confirm';

export function nextStatus(status: Status, event: string, args: CliArgs): Status | undefined {
  if (event === LOGO_EVENT) {
    return 'input';
  }
  // --audio-only skips the picker, per SPEC section 3.
  if (status === 'probing' && event === 'probe-ok' && args.audioOnly === true) {
    return 'downloading';
  }
  return transitions[status][event];
}

const BAR_WIDTH = 24;

export function progressBar(percent: number): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

function isDarkTerminal(): boolean {
  const background = Number(process.env['COLORFGBG']?.split(';').pop());
  return Number.isFinite(background) ? background < 8 : true;
}

function failureMessage(cause: unknown, engine: Engine): string {
  if (cause instanceof EngineError) {
    return cause.userMessage;
  }
  return `${engine.id} could not finish that request.`;
}

export function App({ engine, args }: { engine: Engine; args: CliArgs }) {
  const { exit } = useApp();

  const [status, setStatus] = useState<Status>(args.history === true ? 'history' : 'input');
  const [url, setUrl] = useState(args.url ?? '');
  const [themeName, setThemeName] = useState<ThemeName>(args.theme ?? 'auto');
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState<Progress>({ percent: 0 });
  const [paths, setPaths] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const tokens = themes[resolveTheme(themeName, isDarkTerminal())];
  const outDir = args.output ?? `${homedir()}/Downloads`;
  const chosen = formats[selected];

  // Probing lives in an effect, not in the event handler, so the probing frame is
  // committed before the result lands and every state is observable.
  useEffect(() => {
    if (status !== 'probing') {
      return;
    }

    const controller = new AbortController();
    engine.probe(url, controller.signal).then(
      (result) => {
        setFormats(result.formats);
        setSelected(0);
        setStatus(args.audioOnly === true ? 'downloading' : 'picking');
      },
      (cause: unknown) => {
        setMessage(failureMessage(cause, engine));
        setStatus('error');
      },
    );

    return () => controller.abort();
  }, [status, url, engine, args.audioOnly]);

  useEffect(() => {
    if (status !== 'downloading' || chosen === undefined) {
      return;
    }

    const controller = new AbortController();
    engine.download(url, chosen, outDir, setProgress, controller.signal).then(
      (result) => {
        setPaths(result.paths);
        setStatus('done');
      },
      (cause: unknown) => {
        setMessage(failureMessage(cause, engine));
        setStatus('error');
      },
    );

    return () => controller.abort();
  }, [status, url, outDir, engine, chosen]);

  const goBack = (): void => {
    setStatus('input');
  };

  useInput((input, key) => {
    if (key.ctrl === true && input === 'c') {
      exit();
      return;
    }

    if (key.ctrl === true && input === 't') {
      setThemeName((name) => nextTheme(name));
      return;
    }

    if (status === 'input') {
      // Uppercase H opens history, the binding from SPEC section 3. Lowercase stays
      // with the URL field so a URL may still start with h.
      if (input === 'H') {
        setStatus('history');
        return;
      }
      if (key.escape === true) {
        setUrl('');
      }
      return;
    }

    if (key.escape === true) {
      goBack();
      return;
    }

    if (status === 'picking') {
      if (key.upArrow === true || input === 'k') {
        setSelected((current) => Math.max(0, current - 1));
        return;
      }
      if (key.downArrow === true || input === 'j') {
        setSelected((current) => Math.min(formats.length - 1, current + 1));
        return;
      }
      if (/^[1-9]$/.test(input)) {
        const index = Number(input) - 1;
        if (index < formats.length) {
          setSelected(index);
        }
        return;
      }
      if (key.return === true) {
        setStatus('downloading');
      }
      return;
    }

    if (key.return === true) {
      goBack();
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      {status === 'input' && (
        <Box flexDirection="column">
          <Text color={tokens.bright}>{WORDMARK.join('\n')}</Text>
          <Box marginTop={1}>
            <Text color={tokens.text}>Paste a URL </Text>
            <TextInput value={url} onChange={setUrl} onSubmit={() => setStatus('probing')} />
          </Box>
          <Box marginTop={1}>
            <Text color={tokens.dim}>
              Enter to fetch. H for history. Ctrl+T for theme. Ctrl+C to quit.
            </Text>
          </Box>
        </Box>
      )}

      {status === 'probing' && (
        <Box flexDirection="column">
          <Text color={tokens.bright}>Probing</Text>
          <Text color={tokens.dim}>{`${engine.id} is reading ${url}`}</Text>
        </Box>
      )}

      {status === 'picking' && (
        <Box flexDirection="column">
          <Text color={tokens.bright}>Choose a format</Text>
          {formats.map((format, index) => (
            <Text key={format.id} color={index === selected ? tokens.accent : tokens.text}>
              {`${index === selected ? '>' : ' '} ${index + 1}. ${format.label}`}
            </Text>
          ))}
          <Box marginTop={1}>
            <Text color={tokens.dim}>Arrows or j/k to move. Enter to take it. Esc to go back.</Text>
          </Box>
        </Box>
      )}

      {status === 'downloading' && (
        <Box flexDirection="column">
          <Text color={tokens.bright}>Downloading</Text>
          <Text color={tokens.accent}>{progressBar(progress.percent)}</Text>
          <Text color={tokens.text}>
            {`${progress.percent}%${progress.filename === undefined ? '' : ` ${progress.filename}`}`}
          </Text>
          <Text color={tokens.dim}>Ctrl+C to quit.</Text>
        </Box>
      )}

      {status === 'done' && (
        <Box flexDirection="column">
          <Text color={tokens.ok}>Saved</Text>
          {paths.map((saved) => (
            <Text key={saved} color={tokens.text}>
              {saved}
            </Text>
          ))}
          <Box marginTop={1}>
            <Text color={tokens.dim}>Enter to go back. Ctrl+C to quit.</Text>
          </Box>
        </Box>
      )}

      {status === 'error' && (
        <Box flexDirection="column">
          <Text color={tokens.err}>{message}</Text>
          <Box marginTop={1}>
            <Text color={tokens.dim}>Enter to go back. Ctrl+C to quit.</Text>
          </Box>
        </Box>
      )}

      {status === 'history' && (
        <Box flexDirection="column">
          <Text color={tokens.bright}>History</Text>
          <Text color={tokens.dim}>No saved downloads yet.</Text>
          <Box marginTop={1}>
            <Text color={tokens.dim}>Enter to go back. Ctrl+C to quit.</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
