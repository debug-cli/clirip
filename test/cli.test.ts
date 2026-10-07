import { afterEach, describe, expect, it, vi } from 'vitest';

import { ALTERNATE_SCREEN_ENTER, ALTERNATE_SCREEN_EXIT, main, setupTerminal } from '../src/cli';
import { parseArgs } from '../src/lib/parse-args';

afterEach(() => {
  vi.restoreAllMocks();
});

function captureStdout(): string[] {
  const writes: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
    writes.push(String(chunk));
    return true;
  });
  return writes;
}

describe('parseArgs', () => {
  it('takes a bare URL', () => {
    expect(parseArgs(['https://x.test']).url).toBe('https://x.test');
  });

  it('sets a boolean flag', () => {
    expect(parseArgs(['--audio-only']).audioOnly).toBe(true);
    expect(parseArgs([]).audioOnly).toBeUndefined();
  });

  it('reads the flags that take a value', () => {
    const args = parseArgs([
      'https://x.test',
      '--theme',
      'dark',
      '--engine',
      'cobalt',
      '--cobalt-api',
      'https://cobalt.test',
      '--output',
      '/tmp/out',
      '--no-watermark',
      '--history',
    ]);

    expect(args.theme).toBe('dark');
    expect(args.engine).toBe('cobalt');
    expect(args.cobaltApi).toBe('https://cobalt.test');
    expect(args.output).toBe('/tmp/out');
    expect(args.noWatermark).toBe(true);
    expect(args.history).toBe(true);
    expect(args.url).toBe('https://x.test');
  });

  it('rejects an unknown flag with the usage text', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/Unknown option: --nope/);
    expect(() => parseArgs(['--nope'])).toThrow(/Usage: clirip/);
  });

  it('rejects a bad enum value and a missing value', () => {
    expect(() => parseArgs(['--theme', 'blue'])).toThrow(/--theme must be one of/);
    expect(() => parseArgs(['--engine', 'wget'])).toThrow(/--engine must be one of/);
    expect(() => parseArgs(['--output'])).toThrow(/--output needs a value/);
  });

  it('rejects a second positional argument', () => {
    expect(() => parseArgs(['https://a.test', 'https://b.test'])).toThrow(/Unexpected argument/);
  });
});

describe('main exit codes', () => {
  it('returns 2 and prints usage for an unknown flag', async () => {
    const stderr: string[] = [];
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk: unknown) => {
      stderr.push(String(chunk));
      return true;
    });

    await expect(main(['--nope'])).resolves.toBe(2);
    expect(stderr.join('')).toContain('Usage: clirip');
  });

  it('returns 0 on a clean run', async () => {
    captureStdout();

    await expect(main([])).resolves.toBe(0);
  });
});

describe('terminal lifecycle (AC-5)', () => {
  it('writes the exit sequence exactly once however often teardown runs', () => {
    const writes = captureStdout();

    const teardown = setupTerminal();
    teardown();
    teardown();
    teardown();

    expect(writes).toEqual([ALTERNATE_SCREEN_ENTER, ALTERNATE_SCREEN_EXIT]);
    expect(writes.filter((chunk) => chunk === ALTERNATE_SCREEN_EXIT)).toHaveLength(1);
  });

  it('restores the cursor and leaves the alternate screen in that order', () => {
    expect(ALTERNATE_SCREEN_EXIT).toBe('\x1b[?1049l\x1b[?25h');
    expect(ALTERNATE_SCREEN_ENTER).toBe('\x1b[?1049h\x1b[?25l');
  });
});
