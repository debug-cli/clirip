import { describe, expect, it } from 'vitest';

import { fake, FIXTURE_TITLE } from '../src/engines/fake';
import type { Progress } from '../src/types';

function signal(): AbortSignal {
  return new AbortController().signal;
}

describe('fake engine (AC-2 fixture)', () => {
  it('reports itself available', async () => {
    await expect(fake.available()).resolves.toEqual({ ok: true });
  });

  it('probes to one title and three formats', async () => {
    const result = await fake.probe('https://x.test', signal());

    expect(result.title).toBe(FIXTURE_TITLE);
    expect(result.formats).toHaveLength(3);
    expect(result.formats.map((format) => format.label)).toEqual([
      '1080p h264',
      '1080p av1',
      'MP3 audio',
    ]);
  });

  it('reports progress in ascending order and ends at 100', async () => {
    const seen: number[] = [];

    await fake.download('https://x.test', { id: '137', label: '1080p h264', kind: 'video' }, '/tmp/out', (p: Progress) => {
      seen.push(p.percent);
    }, signal());

    expect(seen).toEqual([0, 50, 100]);
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
  });

  it('resolves the path inside the output directory', async () => {
    const result = await fake.download(
      'https://x.test',
      { id: '137', label: '1080p h264', kind: 'video' },
      '/tmp/out',
      () => {},
      signal(),
    );

    expect(result.paths).toEqual(['/tmp/out/fixture.mp4']);
  });

  it('produces identical output on two runs', async () => {
    const firstProbe = await fake.probe('https://a.test', signal());
    const secondProbe = await fake.probe('https://b.test', signal());

    const firstProgress: number[] = [];
    const secondProgress: number[] = [];
    const format = { id: 'mp3', label: 'MP3 audio', kind: 'audio' as const };

    const firstDownload = await fake.download('https://a.test', format, '/tmp/out', (p) => {
      firstProgress.push(p.percent);
    }, signal());
    const secondDownload = await fake.download('https://b.test', format, '/tmp/out', (p) => {
      secondProgress.push(p.percent);
    }, signal());

    expect(secondProbe).toEqual(firstProbe);
    expect(secondDownload).toEqual(firstDownload);
    expect(secondProgress).toEqual(firstProgress);
  });

  it('refuses an already aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fake.download(
        'https://x.test',
        { id: '137', label: '1080p h264', kind: 'video' },
        '/tmp/out',
        () => {},
        controller.signal,
      ),
    ).rejects.toThrow(/aborted/);
  });
});
