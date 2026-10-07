export type EngineId = 'yt-dlp' | 'cobalt' | 'gallery-dl' | 'newpipe';

export interface FormatOption {
  id: string;
  label: string;
  kind: 'video' | 'audio' | 'images' | 'images+audio';
  height?: number;
  codec?: 'h264' | 'av1' | 'vp9' | string;
  approxBytes?: number;
}

export interface ProbeResult {
  engine: EngineId;
  title: string;
  summary?: string;
  formats: FormatOption[];
}

export interface Progress {
  percent: number;
  bytesPerSec?: number;
  etaSec?: number;
  filename?: string;
}

export interface DownloadResult {
  paths: string[];
}

export interface Engine {
  id: EngineId;
  available(): Promise<{ ok: true } | { ok: false; reason: string }>;
  probe(url: string, signal: AbortSignal): Promise<ProbeResult>;
  download(
    url: string,
    format: FormatOption,
    outDir: string,
    onProgress: (p: Progress) => void,
    signal: AbortSignal,
  ): Promise<DownloadResult>;
}

export class EngineError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public engine: EngineId,
  ) {
    super(message);
    this.name = 'EngineError';
  }
}
