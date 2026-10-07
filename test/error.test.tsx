import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

import { App, formatExit } from '../src/app';
import { errorLogPath, recordError } from '../src/lib/error-log';
import { EngineError, type Engine } from '../src/types';

const URL = 'https://example.test/watch?v=abc123';
const RAW = 'boom at line 9 of engine';
const FRIENDLY = 'This video is private.';

type Instance = ReturnType<typeof render>;

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const failing: Engine = {
  id: 'yt-dlp',
  available: () => Promise.resolve({ ok: true }),
  probe: () => Promise.reject(new EngineError(RAW, FRIENDLY, 'yt-dlp')),
  download: () => Promise.reject(new EngineError(RAW, FRIENDLY, 'yt-dlp')),
};

async function renderErrorScreen(): Promise<Instance> {
  const instance = render(<App engine={failing} args={{}} />);
  await tick(30);
  instance.stdin.write(URL);
  await tick(30);
  instance.stdin.write('\r');
  await tick(60);
  return instance;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('formatExit', () => {
  it('prints one path per line', () => {
    expect(formatExit(['/a/x.mp4', '/a/y.mp3'])).toBe('/a/x.mp4\n/a/y.mp3');
  });

  it('prints nothing for no paths', () => {
    expect(formatExit([])).toBe('');
  });
});

describe('error screen (AC-4)', () => {
  it('shows the user message and none of the raw failure', async () => {
    const instance = await renderErrorScreen();
    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain(FRIENDLY);
    expect(frame).not.toContain(RAW);
    expect(frame).not.toContain('Error:');
    expect(frame).not.toContain('at ');

    instance.unmount();
  });

  it('reports the raw failure outward so it can be logged', async () => {
    const onError = vi.fn();
    const instance = render(<App engine={failing} args={{}} onError={onError} />);

    await wait(30);
    instance.stdin.write(URL);
    await wait(30);
    instance.stdin.write('\r');
    await wait(60);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(EngineError);

    instance.unmount();
  });
});

describe('error log', () => {
  it('writes the raw message and stack to last-error.log', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clirip-err-'));

    recordError(new EngineError(RAW, FRIENDLY, 'yt-dlp'), dir);

    const target = errorLogPath(dir);
    expect(existsSync(target)).toBe(true);

    const written = readFileSync(target, 'utf8');
    expect(written).toContain(RAW);
    expect(written).toContain('EngineError');
  });

  it('leaves no temp file behind', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clirip-err-'));

    recordError(new Error('plain failure'), dir);

    const target = errorLogPath(dir);
    expect(readFileSync(target, 'utf8')).toContain('plain failure');
    expect(existsSync(`${target}.${process.pid}.tmp`)).toBe(false);
  });

  it('handles a non-Error cause', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clirip-err-'));

    recordError('a string failure', dir);

    expect(readFileSync(errorLogPath(dir), 'utf8')).toContain('a string failure');
  });
});
