// T02 scaffold stub. T05 replaces this with the full contract from AGENTS.md:
// FormatOption, ProbeResult, Progress, DownloadResult and Engine.
// EngineId and EngineError are real here so dependants compile from the start.

export type EngineId = 'yt-dlp' | 'cobalt' | 'gallery-dl' | 'newpipe';

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
