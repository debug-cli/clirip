import { describe, expect, it } from 'vitest';

import { NOT_INSTALLED, checkAll, findDep, type Runner } from '../src/lib/deps';

const FFMPEG_LINE = 'ffmpeg version 8.1.2 Copyright (c) 2000-2025 the FFmpeg developers';
const JAVA_LINE = 'openjdk version "21.0.1" 2024-10-15';

interface FakeOptions {
  output?: Record<string, string>;
  code?: string;
}

function runner(options: FakeOptions = {}): { run: Runner; calls: string[][] } {
  const calls: string[][] = [];
  const output = options.output ?? {};

  const run: Runner = (file, args) => {
    calls.push([file, ...args]);

    for (const [key, value] of Object.entries(output)) {
      if (file.includes(key)) {
        return Promise.resolve({ stdout: value, stderr: '' });
      }
    }

    const error = Object.assign(new Error(`spawn ${file} ENOENT`), { code: options.code ?? 'ENOENT' });
    return Promise.reject(error);
  };

  return { run, calls };
}

describe('findDep', () => {
  it('reports not installed when the binary is missing', async () => {
    const { run } = runner({ output: { 'yt-dlp': '2026.08.19' } });

    expect(await findDep('gallery-dl', run)).toEqual({
      name: 'gallery-dl',
      ok: false,
      reason: NOT_INSTALLED,
    });
  });

  it('reports the version when the binary answers', async () => {
    const { run } = runner({ output: { 'yt-dlp': '2026.08.19' } });

    expect(await findDep('yt-dlp', run)).toEqual({
      name: 'yt-dlp',
      path: 'yt-dlp',
      version: '2026.08.19',
      ok: true,
    });
  });

  it('reads an ffmpeg version out of its banner line', async () => {
    const { run } = runner({ output: { ffmpeg: FFMPEG_LINE } });

    const info = await findDep('ffmpeg', run);
    expect(info.ok).toBe(true);
    expect(info.version).toBe('8.1.2');
  });

  it('reads a java version from stderr, where java prints it', async () => {
    const run: Runner = (file) =>
      file.includes('java')
        ? Promise.resolve({ stdout: '', stderr: JAVA_LINE })
        : Promise.reject(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const info = await findDep('java', run);
    expect(info.ok).toBe(true);
    expect(info.version).toBe('21.0.1');
  });

  it('reports a binary that answers without a version', async () => {
    const { run } = runner({ output: { 'yt-dlp': '   \n  ' } });

    const info = await findDep('yt-dlp', run);
    expect(info.ok).toBe(false);
    expect(info.reason).toBe('could not read a version');
  });

  it('reports a binary that exists but cannot be executed', async () => {
    const { run } = runner({ code: 'EACCES' });

    const info = await findDep('java', run);
    expect(info.ok).toBe(false);
    expect(info.reason).toBe('not executable');
  });

  it('passes an argument array and never a shell string', async () => {
    const { run, calls } = runner({ output: { 'yt-dlp': '2026.08.19', ffmpeg: FFMPEG_LINE } });

    await findDep('yt-dlp', run);
    await findDep('ffmpeg', run);

    expect(calls[0]?.[0]).toBe('yt-dlp');
    expect(calls[0]?.slice(1)).toEqual(['--version']);
    expect(calls[1]?.slice(1)).toEqual(['-version']);
    for (const call of calls) {
      expect(Array.isArray(call)).toBe(true);
      expect(call.every((part) => typeof part === 'string')).toBe(true);
    }
  });
});

describe('checkAll', () => {
  it('answers for all four tools and reports which are missing', async () => {
    const { run } = runner({ output: { 'yt-dlp': '2026.08.19', ffmpeg: FFMPEG_LINE } });

    const all = await checkAll(run);

    expect(Object.keys(all).sort()).toEqual(['ffmpeg', 'gallery-dl', 'java', 'yt-dlp']);
    expect(all['yt-dlp']?.ok).toBe(true);
    expect(all['ffmpeg']?.ok).toBe(true);
    expect(all['gallery-dl']?.ok).toBe(false);
    expect(all['java']?.ok).toBe(false);
    expect(all['java']?.reason).toBe(NOT_INSTALLED);
  });
});
