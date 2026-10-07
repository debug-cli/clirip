// A deterministic engine for tests and for walking the UI without a network.
// Every value here is fixture data, not a claim about a real probe.

import type { DownloadResult, Engine, FormatOption, ProbeResult, Progress } from '../types';

const FORMATS: readonly FormatOption[] = [
  { id: '137', label: '1080p h264', kind: 'video', height: 1080, codec: 'h264', approxBytes: 48_200_000 },
  { id: '398', label: '1080p av1', kind: 'video', height: 1080, codec: 'av1', approxBytes: 31_700_000 },
  { id: 'mp3', label: 'MP3 audio', kind: 'audio', approxBytes: 4_100_000 },
];

export const FIXTURE_TITLE = 'Fixture talk at a meetup';
export const FIXTURE_FILENAME = 'fixture.mp4';

export const fake: Engine = {
  id: 'yt-dlp',

  available() {
    return Promise.resolve({ ok: true });
  },

  probe(_url: string, _signal: AbortSignal): Promise<ProbeResult> {
    return Promise.resolve({
      engine: 'yt-dlp',
      title: FIXTURE_TITLE,
      summary: '1080p video, 1 audio track',
      formats: FORMATS.map((format) => ({ ...format })),
    });
  },

  download(
    _url: string,
    _format: FormatOption,
    outDir: string,
    onProgress: (p: Progress) => void,
    signal: AbortSignal,
  ): Promise<DownloadResult> {
    if (signal.aborted) {
      return Promise.reject(new Error('aborted'));
    }

    for (const percent of [0, 50, 100]) {
      onProgress({ percent, filename: FIXTURE_FILENAME });
    }

    return Promise.resolve({ paths: [`${outDir}/${FIXTURE_FILENAME}`] });
  },
};
