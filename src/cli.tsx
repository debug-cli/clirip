import { realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { render } from 'ink';

import { App, formatExit } from './app';
import { fake } from './engines/fake';
import { recordError } from './lib/error-log';
import { parseArgs } from './lib/parse-args';

export type { CliArgs } from './lib/parse-args';

export const ALTERNATE_SCREEN_ENTER = '\x1b[?1049h\x1b[?25l';
export const ALTERNATE_SCREEN_EXIT = '\x1b[?1049l\x1b[?25h';

export const CLIRIP_DIR = `${homedir()}/.clirip`;

// Enters the alternate screen and hides the cursor, and returns the one teardown
// that undoes both. The guard makes the teardown idempotent so every exit path can
// call it without printing a second escape.
export function setupTerminal(): () => void {
  process.stdout.write(ALTERNATE_SCREEN_ENTER);

  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    process.stdout.write(ALTERNATE_SCREEN_EXIT);
  };
}

export async function main(argv: string[]): Promise<number> {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 2;
  }

  // Ink throws when it cannot put the terminal in raw mode, so a piped run is told
  // what is wrong instead of being handed a stack trace.
  if (process.stdin.isTTY !== true) {
    process.stderr.write('clirip needs an interactive terminal. Run it in a terminal, not through a pipe.\n');
    return 1;
  }

  const teardown = setupTerminal();

  const quit = (code: number): void => {
    teardown();
    process.exit(code);
  };

  process.on('SIGINT', () => quit(130));
  process.on('SIGTERM', () => quit(143));
  process.on('uncaughtException', () => quit(1));
  process.on('unhandledRejection', () => quit(1));

  let saved: string[] = [];

  const instance = render(
    <App
      engine={fake}
      args={args}
      onPaths={(paths) => {
        saved = paths;
      }}
      onError={(cause) => {
        try {
          recordError(cause, CLIRIP_DIR);
        } catch {
          // A failed log write must never replace the message the user already has.
        }
      }}
    />,
  );

  await instance.waitUntilExit();
  teardown();

  if (saved.length > 0) {
    process.stdout.write(`${formatExit(saved)}\n`);
  }

  return 0;
}

// Running the built binary must start the app; importing this module from a test
// must not. tsup bundles to dist/cli.js, where both paths resolve to the same file.
function isEntryPoint(): boolean {
  const script = process.argv[1];
  if (script === undefined) return false;
  try {
    return realpathSync(script) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  void main(process.argv.slice(2)).then((code) => {
    if (code !== 0) process.exit(code);
  });
}
