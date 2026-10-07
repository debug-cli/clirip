import { describe, expect, it } from 'vitest';

import { EngineError, type Engine, type FormatOption } from '../src/types';

// A compile-time conformance check: if the Engine surface drifts, tsc fails here.
const conforming: Engine = {
  id: 'yt-dlp',
  available: () => Promise.resolve({ ok: true }),
  probe: () =>
    Promise.resolve({
      engine: 'yt-dlp',
      title: 'Fixture talk at a meetup',
      formats: [{ id: '137', label: '1080p h264', kind: 'video', height: 1080, codec: 'h264' }],
    }),
  download: (_url, _format, outDir) =>
    Promise.resolve({ paths: [`${outDir}/fixture.mp4`] }),
};

describe('contract surface', () => {
  it('carries the raw message, the user message and the engine on EngineError', () => {
    const err = new EngineError('raw', 'friendly', 'yt-dlp');

    expect(err.userMessage).toBe('friendly');
    expect(err.engine).toBe('yt-dlp');
    expect(err.message).toBe('raw');
  });

  it('is an Error subclass so throw and catch work unchanged', () => {
    const err = new EngineError('raw', 'friendly', 'cobalt');

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('EngineError');
  });

  it('accepts a FormatOption with only the required fields', () => {
    const minimal: FormatOption = { id: 'a', label: 'audio', kind: 'audio' };

    expect(minimal.kind).toBe('audio');
  });

  it('lets an engine satisfy the Engine interface', async () => {
    const probed = await conforming.probe('https://x.test', new AbortController().signal);

    expect(probed.formats).toHaveLength(1);
    expect(probed.formats[0]?.codec).toBe('h264');
    await expect(conforming.available()).resolves.toEqual({ ok: true });
  });
});
