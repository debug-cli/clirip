import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { EngineError } from '../src/types';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { name: string; type: string; files: string[]; bin: Record<string, string> };

describe('package scaffold', () => {
  it('is published as an ESM package named clirip', () => {
    expect(pkg.name).toBe('clirip');
    expect(pkg.type).toBe('module');
  });

  it('ships only dist and README.md', () => {
    expect(pkg.files).toEqual(['dist', 'README.md']);
  });

  it('exposes the clirip binary at dist/cli.js', () => {
    expect(pkg.bin.clirip).toBe('dist/cli.js');
  });
});

describe('shared types', () => {
  it('exports a constructible EngineError that carries the user-facing message', () => {
    const error = new EngineError('yt-dlp exited 1', 'yt-dlp could not read that URL', 'yt-dlp');

    expect(error).toBeInstanceOf(Error);
    expect(error.userMessage).toBe('yt-dlp could not read that URL');
    expect(error.engine).toBe('yt-dlp');
    expect(error.name).toBe('EngineError');
  });
});
