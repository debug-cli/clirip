# AGENTS.md

## Stack (pinned)
- Node 18+, TypeScript, `type: module`, tsup format `esm`, `#!/usr/bin/env node` banner on `dist/cli.js`.
- `ink@5.2.1` (peer `react >=18.0.0`), `react@18.3.1`, `@types/react@18.3.31`
- `ink-select-input@6.2.0`, `ink-text-input@6.0.0`, `ink-spinner@5.0.0`, `ink-testing-library@4.0.0`
- `tsup@8.5.1`, `vitest@5.0.3`, `ffmpeg-static@5.3.0`, `typescript@5`
- Global `fetch` only. No `node-fetch`. Never pin `latest`.
- Docs page: one HTML file, no framework, no build step.

## Commands
```
npm run build       # tsup -> dist/cli.js
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm start -- [URL]  # node dist/cli.js
```
Milestone gate: `npm run typecheck && npm test && npm run build`

## Folder map
`src/cli.tsx` entry · `src/app.tsx` state machine · `src/theme.ts` · `src/types.ts` · `src/engines/{index,ytdlp,cobalt,gallery-dl,newpipe,fake}.ts` · `src/lib/{click-map,clipboard,config,deps,format,history,logo,platforms,use-mouse-click}.ts` · `test/fixtures/` · `shim/` · `docs/index.html` · `plan/`

## Contracts
```ts
export type EngineId = 'yt-dlp' | 'cobalt' | 'gallery-dl' | 'newpipe';
export interface FormatOption { id: string; label: string; kind: 'video'|'audio'|'images'|'images+audio'; height?: number; codec?: 'h264'|'av1'|'vp9'|string; approxBytes?: number; }
export interface ProbeResult { engine: EngineId; title: string; summary?: string; formats: FormatOption[]; }
export interface Progress { percent: number; bytesPerSec?: number; etaSec?: number; filename?: string; }
export interface DownloadResult { paths: string[]; }
export interface Engine {
  id: EngineId;
  available(): Promise<{ ok: true } | { ok: false; reason: string }>;
  probe(url: string, signal: AbortSignal): Promise<ProbeResult>;
  download(url: string, format: FormatOption, outDir: string, onProgress: (p: Progress) => void, signal: AbortSignal): Promise<DownloadResult>;
}
export class EngineError extends Error {
  constructor(message: string, public userMessage: string, public engine: EngineId) { super(message); }
}
```
`userMessage` is the only text the error screen shows. Raw stderr goes to `~/.clirip/last-error.log`.

## Overriding rules
1. No completion claim without command output from the current turn.
2. No new dependency, file, or behavior outside the current task without a logged ruling.
3. Never guess a library API. Read installed types in node_modules or official docs first.
4. Keep each task small. One task, one context, one commit.
5. `.gitignore` exists before the first `git add`. It ignores `cli-rip_enhanced-prompt-v1.md` and `.freebuff`.

## Tools and skills for the builder
- Fetch, web search, and stealthy fetch are available through Scrapling.
- Use fetch for official docs and plain pages. Use web search to confirm current package versions and API names. Use stealthy fetch only to read public documentation when plain fetch is blocked. Never use it to get past logins or paywalls. Respect robots.txt and site terms.
- GitHub tree pages block automated access. Use git clone --depth 1 or raw.githubusercontent.com.
- Record the source URL of every external fact you rely on in plan/ledger.md.
- Load the design-taste-frontend skill before any task touching docs/index.html.

## Gotchas
- Ink 5 has no mouse API: SGR escape sequences on raw stdin plus a click map (T12).
- `route()` drops unavailable engines before Privacy Mode and manual override.
- cobalt needs `--cobalt-api`; no instance means routing skips it and the UI shows a hint.
- All `~/.clirip` writes are temp-file plus rename; config mode 0600. Spawn with an argument array, never a shell string. Only `http:` and `https:` URLs.
