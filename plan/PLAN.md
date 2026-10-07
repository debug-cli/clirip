# CLIrip PLAN

## How the builder receives this plan

Phase 1 produced exactly these files. Phase 2 starts from a fresh context with nothing but a paste.

| File | Role | Builder reads it when |
|---|---|---|
| `PROMPT-MISSION.md` | The paste. Mission, read order, per-task loop, stop rules. | Every context, first. |
| `AGENTS.md` | Stack, commands, folder map, contracts, overriding rules, gotchas. | Every context, second. |
| `plan/PLAN.md` | This file. Task inventory, one block per task, traceability. | To find the next task, then only that block. |
| `plan/SPEC.md` | Binding authority: hard facts, hygiene, state machine, routing, flags, ACs, docs contract. | Only the sections a task names. |
| `plan/DESIGN.md` | Design Read, dials, three themes with contrast ratios, type scale, components, wordmark, id map, status line. | D tasks only. |
| `plan/ledger.md` | Decisions (pre-filled with verified pins and sources), Rulings, Task log. | To append a ruling and a result line. |
| `docs/index.html` | D01 creates it, later D tasks append to it. | D tasks only. |

The builder never reads `cli-rip_enhanced-prompt-v1.md`. It is git-ignored and superseded by `plan/SPEC.md`.

Task ids: `T` for the CLI and repo, `D` for the docs page. Milestones: M0 to M10. Each milestone ends green on `npm run typecheck && npm test && npm run build`.

```
Tools and skills for the builder
- Fetch, web search, and stealthy fetch are available through Scrapling.
- Use fetch for official docs and plain pages. Use web search to confirm current package versions and API names. Use stealthy fetch only to read public documentation when plain fetch is blocked. Never use it to get past logins or paywalls. Respect robots.txt and site terms.
- GitHub tree pages block automated access. Use git clone --depth 1 or raw.githubusercontent.com.
- Record the source URL of every external fact you rely on in plan/ledger.md.
- Load the design-taste-frontend skill before any task touching docs/index.html.
```

---

## Milestone map

| M | Tasks | Gate |
|---|---|---|
| M0 Scaffold and repo | T01 T02 T03 T04 | `npm run typecheck && npm test && npm run build`, first push |
| M1 Shell and spike | T05 T06 T07 T08 T09 T10 T11 T12 | six states driven by `fake.ts`, terminal restored, mouse spike judged |
| M2 yt-dlp | T13 T14 T15 T16 T17 T18 | probe, score, download, MP3 against fixtures |
| M3 Routing and fallback | T19 T20 T21 | AC-1, AC-3 green |
| M4 Flags, config, clipboard, history | T22 T23 T24 T25 | all flags live, history capped |
| M5 cobalt | T26 T27 | typed client from current docs, hint shown with no instance |
| M6 gallery-dl | T28 T29 | TikTok photo fixture produces the folder |
| M7 Mouse everywhere | T30 | only if T12 passed |
| M8 NewPipe | T31 T32 | P2, unavailable path works |
| M9 Packaging and README | T33 T34 | `npm pack` + `npx` smoke, README commands all run |
| M10 Docs page | D01-D13 | all docs ACs green |

---

## M0 Scaffold and repo

### T01 Init repository hygiene   [P0]   Milestone: M0

Goal: git exists with an ignore rule for both protected paths before anything is staged.
Depends on: none.
Files: `.gitignore`, `README.md`, `plan/ledger.md`
Interfaces: exact `.gitignore` content is SPEC section 2.1. Copy it byte for byte.
Failing test first: `test/ignore.test.ts` runs `git check-ignore -v cli-rip_enhanced-prompt-v1.md .freebuff` via `execFileSync('git', [...])` and asserts both exit 0 with a rule printed, and asserts `git ls-files` does not list either path. Fails today because there is no repo.
Steps:
1. `git init -b main`.
2. Write `.gitignore` from SPEC 2.1.
3. Write a three-line `README.md` stub: title, one-line description, "Docs coming in M10."
4. Run the test. Both paths must match a rule.
5. `git add -A`, run `git status --short`, confirm neither protected path appears.
6. Commit `T01: init repository hygiene`.
Verify: `git check-ignore -v cli-rip_enhanced-prompt-v1.md .freebuff` prints a matching rule for each. `git status --short` shows no protected path.
Done when: AC-15 first half passes.
Do not: create `package.json`, push, or edit any other file.

### T02 Package, TypeScript, tsup, vitest scaffold   [P0]   Milestone: M0

Goal: the four commands exist and a smoke test passes.
Depends on: T01.
Files: `package.json`, `tsconfig.json`, `vitest.config.ts`
Interfaces:
```json
{ "name": "clirip", "type": "module", "bin": { "clirip": "dist/cli.js" },
  "files": ["dist", "README.md"],
  "scripts": { "build": "tsup", "typecheck": "tsc --noEmit", "test": "vitest run", "start": "node dist/cli.js" } }
```
tsup config: `entry: ['src/cli.tsx']`, `format: ['esm']`, `banner: { js: '#!/usr/bin/env node' }`, `sourcemap: false`, `clean: true`.
Failing test first: `test/smoke.test.ts` asserts `true === false` placeholder is wrong; instead assert `import { EngineError } from '../src/types'` throws nothing and the class exists. Fails because `src/types.ts` does not exist yet, which is why T05 is pulled forward as a dependency-free stub in the same commit if needed.
Steps:
1. Write `package.json` with the pinned versions from `AGENTS.md` in `dependencies` and `devDependencies`.
2. Write `tsconfig.json`: `strict: true`, `jsx: "react-jsx"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `target: "ES2022"`, `types: ["node"]`, `include: ["src", "test"]`.
3. Write `vitest.config.ts` with `environment: 'node'`.
4. Write the smoke test asserting the package `name`, `type`, and `files` fields.
5. Run the three commands.
Verify: `npm run typecheck && npm test && npm run build` exits 0.
Done when: commands exist and the gate passes on an empty source tree.
Do not: add ESLint, Prettier, or any CI config.

### T03 Install pinned dependencies and record them   [P0]   Milestone: M0

Goal: node_modules matches AGENTS.md and the ledger holds the evidence.
Depends on: T02.
Files: `package.json`, `plan/ledger.md`, `package-lock.json`
Interfaces: exact pins: `ink@5.2.1`, `react@18.3.1`, `@types/react@18.3.31`, `@types/node@22`, `ink-select-input@6.2.0`, `ink-text-input@6.0.0`, `ink-spinner@5.0.0`, `ink-testing-library@4.0.0`, `tsup@8.5.1`, `vitest@5.0.3`, `ffmpeg-static@5.3.0`, `typescript@5`.
Failing test first: a script check `npm ls ink react --depth=0` that fails while the packages are absent.
Steps:
1. Run `npm ls` to confirm absence (baseline).
2. `npm install` each pin with an exact version, never a range.
3. Run `npm view <pkg> version peerDependencies` for ink and react and paste the output into the ledger Decisions table if it differs from AGENTS.md.
4. Commit.
Verify: `npm ls ink react ink-select-input ink-text-input ink-spinner ink-testing-library` prints no `invalid` or `missing` lines. Output pasted to ledger.
Done when: peer warnings are zero and the lockfile is committed.
Do not: add any package not named above.

### T04 Create remote and push main   [P0]   Milestone: M0

Goal: `origin` points at `github.com/debug-cli/clirip`, or the fallback commands are logged.
Depends on: T01, T02, T03.
Files: `plan/ledger.md`, `.gitignore`, `README.md`
Interfaces: `gh repo create debug-cli/clirip --public --source . --remote origin --description "Multi-engine terminal media downloader"` then `git push -u origin main`.
Failing test first: `test/remote.test.ts` runs `git remote get-url origin` and asserts it ends with `debug-cli/clirip`. Skips with a recorded message when `gh` is unavailable, in which case the ledger must hold the exact commands instead.
Steps:
1. Check `gh --version` and `gh auth status`.
2. If signed in, run the create command and push.
3. If not, print the three commands for the owner and write them into the ledger.
4. Never write a token to any file.
Verify: `git remote -v` output, or the ledger fallback lines. Paste either into the ledger.
Done when: AC-16 passes one way or the other.
Do not: force push, publish to npm, or enable GitHub Pages.

---

## M1 Shell and spike

### T05 Shared types and EngineError   [P0]   Milestone: M1

Goal: the contracts in AGENTS.md exist as compiling TypeScript.
Depends on: T02.
Files: `src/types.ts`, `test/types.test.ts`, `AGENTS.md`
Interfaces: copy the `EngineId`, `FormatOption`, `ProbeResult`, `Progress`, `DownloadResult`, `Engine`, `EngineError` block from AGENTS.md verbatim.
Failing test first: `test/types.test.ts` imports `EngineError`, constructs `new EngineError('raw', 'friendly', 'yt-dlp')`, asserts `err.userMessage === 'friendly'` and `err.engine === 'yt-dlp'` and `err.message === 'raw'`. Fails because the module is missing.
Steps: write the module, run typecheck and test, commit `T05: shared types and EngineError`.
Verify: `npm run typecheck && npm test` exits 0.
Done when: AC-4's contract surface exists.
Do not: add helpers, constants, or runtime logic.

### T06 Theme tokens and cycle   [P0]   Milestone: M1

Goal: `auto | light | dark` resolve to Ink color sets, and the cycle order is fixed.
Depends on: T05.
Files: `src/theme.ts`, `test/theme.test.ts`, `src/types.ts`
Interfaces:
```ts
export type ThemeName = 'auto' | 'light' | 'dark';
export interface ThemeTokens { bg: string; surface: string; line: string; text: string; dim: string; bright: string; accent: string; ok: string; warn: string; err: string; }
export const themes: Record<'light' | 'dark', ThemeTokens>;
export function resolveTheme(name: ThemeName, isDarkTerminal: boolean): 'light' | 'dark';
export function nextTheme(name: ThemeName): ThemeName; // auto -> light -> dark -> auto
```
Failing test first: `test/theme.test.ts` asserts `nextTheme('auto') === 'light'`, `nextTheme('dark') === 'auto'`, `resolveTheme('auto', true)` returns the dark set, and every token is a 6-digit hex. Fails on missing module.
Steps: write tokens (light and dark sets only, the docs themes are unrelated), write the functions, test, commit.
Verify: `npm test` exits 0 with at least 4 assertions.
Done when: AC-13's cycle order is enforced by a test.
Do not: touch `--theme` flag parsing (T23) or render anything.

### T07 ASCII wordmark in code   [P0]   Milestone: M1

Goal: one wordmark source with a row-length guarantee.
Depends on: T02.
Files: `src/lib/logo.ts`, `test/logo.test.ts`, `plan/DESIGN.md`
Interfaces:
```ts
export const WORDMARK: readonly string[]; // 5 rows, each exactly 47 columns
export const WORDMARK_WIDTH = 47;
```
The five rows are the block in `plan/DESIGN.md`. Copy them exactly, trailing spaces included.
Failing test first: `test/logo.test.ts` asserts `WORDMARK.length === 5`, every row `.length === 47`, and all rows match `/^[█ ]+$/`. Fails because the module is missing.
Steps: write the constant, write the test, commit.
Verify: `npm test` prints the row lengths; paste them into the ledger.
Done when: AC-23's equal-length half is green for the TUI side.
Do not: add color spans, animation, or a second art variant.

### T08 Entry point, arg parsing, terminal lifecycle   [P0]   Milestone: M1

Goal: the CLI parses flags, enters the alternate screen, and always leaves it.
Depends on: T05, T06.
Files: `src/cli.tsx`, `test/cli.test.ts`, `src/lib/parse-args.ts`
Interfaces:
```ts
export interface CliArgs { url?: string; theme?: 'auto'|'light'|'dark'; engine?: 'yt-dlp'|'cobalt'|'gallery-dl'|'newpipe'; cobaltApi?: string; audioOnly?: boolean; output?: string; noWatermark?: boolean; history?: boolean; }
export function parseArgs(argv: string[]): CliArgs; // unknown flag -> throw with usage text
export function setupTerminal(): () => void;  // returns teardown
export const ALTERNATE_SCREEN_ENTER = '\x1b[?1049h\x1b[?25l';
export const ALTERNATE_SCREEN_EXIT  = '\x1b[?1049l\x1b[?25h';
```
Failing test first: `test/cli.test.ts` asserts `parseArgs(['--nope'])` throws with exit code 2 semantics, `parseArgs(['--audio-only'])` sets the flag, `parseArgs(['https://x.test'])` sets url. Plus a teardown test: `setupTerminal()` then teardown writes `ALTERNATE_SCREEN_EXIT` to a stubbed stdout. Fails because the module is missing.
Steps:
1. Write `parse-args.ts` with a hand-rolled flag loop (no dependency).
2. Write `cli.tsx` entry: parse, register `SIGINT`, `SIGTERM`, `uncaughtException`, `unhandledRejection` handlers that run teardown then `process.exit`.
3. Teardown writes `ALTERNATE_SCREEN_EXIT` exactly once (guard with a boolean).
4. Test with a fake `process.stdout`.
5. Commit.
Verify: `npm run typecheck && npm test` exits 0. `node dist/cli.js --nope` prints usage and exits 2 (run it, paste output).
Done when: AC-5's restore path is proven by test for both Ctrl+C and a thrown error.
Do not: render React yet, enable mouse, or handle any state machine logic.

### T09 Fake engine   [P0]   Milestone: M1

Goal: a deterministic engine that drives every state without the network.
Depends on: T05.
Files: `src/engines/fake.ts`, `test/fake.test.ts`, `src/types.ts`
Interfaces: implements `Engine` with `id: 'yt-dlp'`, a fixed `ProbeResult` (title `Fixture talk at a meetup`, 3 formats: `1080p h264`, `1080p av1`, `MP3 audio`), and a `download` that calls `onProgress` at 0, 50, 100 then resolves `paths: [outDir + '/fixture.mp4']`.
Failing test first: `test/fake.test.ts` asserts probe returns 3 formats, download reports progress in ascending order, and two runs produce identical output. Fails on missing module.
Steps: implement, test, commit.
Verify: `npm test` exits 0.
Done when: AC-2's fixture exists.
Do not: import from `app.tsx` or any UI file.

### T10 State machine and root component   [P0]   Milestone: M1

Goal: all six states render, driven by the fake engine, with the footer controls.
Depends on: T06, T09.
Files: `src/app.tsx`, `test/app.test.tsx`, `src/types.ts`
Interfaces:
```ts
export type Status = 'input'|'probing'|'picking'|'downloading'|'done'|'error'|'history';
export const transitions: Record<Status, Record<string, Status>>; // SPEC section 3 table
export function App(props: { engine: Engine; args: CliArgs; }): JSX.Element;
```
Failing test first: `test/app.test.tsx` uses `ink-testing-library` `render(<App engine={fake} args={{}} />)`, asserts the input screen text appears, simulates Enter on a valid URL, asserts `probing`, then `picking`, then Enter, then `downloading`, then `done`. One test walks the whole table from AC-2. Fails because `App` is missing.
Steps:
1. Export the transition table as data so the test reads it directly.
2. Render each state with a distinct frame; use the wordmark on the input screen.
3. Handle Enter, Esc, arrow keys, j/k, number keys, Ctrl+C, Ctrl+T through Ink's `useInput`.
4. Commit.
Verify: `npm run typecheck && npm test` exits 0 and the test prints each state name as it passes.
Done when: AC-2 passes except the exit-path print, which T11 covers.
Do not: call `child_process` or `fetch` from this file.

### T11 Done and error screens, exit output   [P0]   Milestone: M1

Goal: success prints paths on exit; failure shows only `userMessage`.
Depends on: T10.
Files: `src/app.tsx`, `test/error.test.tsx`, `src/lib/error-log.ts`
Interfaces:
```ts
export function formatExit(paths: string[]): string; // one path per line
export function recordError(e: unknown, dir: string): void; // raw stderr -> ~/.clirip/last-error.log
```
Failing test first: `test/error.test.tsx` renders the app in the error state with `new EngineError('boom at line 9 of engine', 'This video is private.', 'yt-dlp')` and asserts the frame contains `This video is private.` and does NOT contain `boom at line 9` or `Error:` or `at `. Second test asserts `formatExit(['/a/x.mp4','/a/y.mp3'])` equals `/a/x.mp4\n/a/y.mp3`. Fails on missing behavior.
Steps: implement both, wire `recordError` to write the raw message and stack to the log file with temp-plus-rename, test, commit.
Verify: `npm test` exits 0 with both assertions green.
Done when: AC-4 passes.
Do not: show any stack trace anywhere in the UI.

### T12 Mouse spike   [P1]   Milestone: M1

Goal: prove a click maps to a registered rectangle, or log the keyboard-only ruling.
Depends on: T08, T10.
Files: `src/lib/click-map.ts`, `src/lib/use-mouse-click.ts`, `test/click-map.test.ts`
Interfaces:
```ts
export interface Rect { x: number; y: number; w: number; h: number; id: string; }
export class ClickMap { add(id: string, r: Rect): void; hit(x: number, y: number): string | null; }
export function parseSGR(buf: string): { x: number; y: number; button: string; action: 'press'|'release' } | null;
export const MOUSE_ENABLE = '\x1b[?1002h\x1b[?1006h';
export const MOUSE_DISABLE = '\x1b[?1002l\x1b[?1006l';
```
Failing test first: `test/click-map.test.ts` asserts `parseSGR('\x1b[<0;10;5M')` returns `{x:9, y:4}` (0-based), `ClickMap.hit(10,5)` inside a rect returns its id, and `hit(200,90)` returns null. Fails on missing modules.
Steps:
1. Write the parser and map pure, test them.
2. Write the hook: on mount `setRawMode(true)` plus `MOUSE_ENABLE`, on unmount `MOUSE_DISABLE` plus `setRawMode(false)`, guard on `process.stdout.isTTY`.
3. Prove a logo click and one list-row click in a test by feeding SGR strings to the hook's handler.
4. If any step fails twice, stop, write `Ruling: keyboard only | spike failed | mouse stays P2` into the ledger, and mark T30 as cut.
Verify: `npm test` exits 0, or the ruling line exists in the ledger.
Done when: AC-12's parser and map half is green, or the ruling is logged.
Do not: enable mouse in `cli.tsx` yet (T30 does that).

---

## M2 yt-dlp

### T13 Dependency discovery   [P0]   Milestone: M2

Goal: locate or report yt-dlp, ffmpeg, gallery-dl, java without spawning a shell.
Depends on: T05.
Files: `src/lib/deps.ts`, `test/deps.test.ts`, `src/types.ts`
Interfaces:
```ts
export interface DepInfo { name: string; path?: string; version?: string; ok: boolean; reason?: string; }
export async function findDep(name: 'yt-dlp'|'ffmpeg'|'gallery-dl'|'java'): Promise<DepInfo>;
export async function checkAll(): Promise<Record<string, DepInfo>>;
```
Spawn with `execFile` and an argument array (`['--version']`). Never a shell string.
Failing test first: `test/deps.test.ts` mocks the process runner and asserts a missing binary yields `{ ok:false, reason: 'not installed' }` and a found one yields `{ ok:true, version }`. Fails on missing module.
Steps: implement with an injectable runner, test, commit.
Verify: `npm test` exits 0.
Done when: the UI can ask "is it available" for all four tools.
Do not: install anything yet.

### T14 yt-dlp installer with checksum   [P0]   Milestone: M2

Goal: install the right asset for this OS/arch and reject a bad hash.
Depends on: T13.
Files: `src/lib/install-ytdlp.ts`, `test/install-ytdlp.test.ts`, `plan/ledger.md`
Interfaces:
```ts
export function assetFor(platform: NodeJS.Platform, arch: string): string;
// win32+x64 -> yt-dlp_win.zip | win32+arm64 -> yt-dlp_win_arm64.zip
// linux+x64 -> yt-dlp_linux | linux+arm64 -> yt-dlp_linux_aarch64
// darwin+x64 -> yt-dlp_macos | darwin+arm64 -> yt-dlp
export async function verifySha256(buffer: Buffer, sumsText: string, assetName: string): Promise<boolean>;
export async function installYtdlp(destDir: string, fetchImpl?: typeof fetch): Promise<string>;
```
Checksums come from `https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS` (asset list confirmed against the releases API, see ledger).
Failing test first: `test/install-ytdlp.test.ts` asserts `assetFor('linux','x64') === 'yt-dlp_linux'`, `assetFor('darwin','arm64') === 'yt-dlp'`, and `verifySha250` returns false when the digest differs, true when it matches. Fails on missing module.
Steps: write the pure mapping and verifier first, test them, then the fetch path with an injected `fetchImpl` so tests never hit the network.
Verify: `npm test` exits 0. No test opens a socket.
Done when: AC-8 passes.
Do not: chmod the file in tests, or download during the test run.

### T15 Probe with --dump-json   [P0]   Milestone: M2

Goal: real yt-dlp JSON becomes a `ProbeResult`.
Depends on: T13, T15 fixtures.
Files: `src/engines/ytdlp.ts`, `test/ytdlp-probe.test.ts`, `test/fixtures/ytdlp-video.json`
Interfaces: `probe(url, signal)` spawns `['-J', '--no-playlist', url]`, parses JSON, maps `formats[]` into `FormatOption[]`.
Failing test first: `test/ytdlp-probe.test.ts` loads `test/fixtures/ytdlp-video.json` (captured from a real run: `yt-dlp -J https://www.youtube.com/watch?v=jNQXAC9IVRw`), feeds it to `parseProbe(json)`, and asserts the title is non-empty and at least 3 formats exist. Fails on missing module.
Steps: capture the fixture on a machine with network, commit it, write `parseProbe`, test.
Verify: `npm test` exits 0, fixture file exists and is under 400 KB.
Done when: the probe path has a real captured input.
Do not: call the network in the test; the fixture is the contract.

### T16 Format scoring   [P0]   Milestone: M2

Goal: h264 ranks above av1 and vp9 at equal height.
Depends on: T15.
Files: `src/lib/format.ts`, `test/format.test.ts`, `test/fixtures/ytdlp-video.json`
Interfaces:
```ts
export function scoreFormat(f: FormatOption, preferAudio: boolean): number;
export function rankFormats(list: FormatOption[], preferAudio?: boolean): FormatOption[];
```
Rules: at equal height, `h264` > `av1` > `vp9`; higher height wins first; audio-only formats rank together when `preferAudio`.
Failing test first: `test/format.test.ts` builds three options at height 1080 with codecs h264/av1/vp9, runs `rankFormats`, asserts index 0 is h264. Second test: given `height: [2160, 1080]`, 2160 sorts first regardless of codec. Fails on missing module.
Steps: implement, test, commit.
Verify: `npm test` exits 0.
Done when: AC-6 passes.
Do not: filter out formats, only rank them.

### T17 Download with progress   [P0]   Milestone: M2

Goal: progress lines from yt-dlp become `Progress` callbacks.
Depends on: T16.
Files: `src/engines/ytdlp.ts`, `test/ytdlp-progress.test.ts`, `src/types.ts`
Interfaces:
```ts
export function parseProgressLine(line: string): Progress | null;
// matches "[download]  42.3% of 10.50MiB at 2.10MiB/s ETA 00:07"
```
Failing test first: `test/ytdlp-progress.test.ts` feeds three real-shaped lines (50%, 100%, and an unparseable line) and asserts `percent` values `50`, `100`, then `null`. Fails on missing function.
Steps: implement, test, then wire the spawn loop to call `onProgress`.
Verify: `npm test` exits 0.
Done when: the `downloading` state has data.
Do not: render the bar here.

### T18 Audio-only MP3   [P0]   Milestone: M2

Goal: `--audio-only` skips picking and yields an `.mp3`.
Depends on: T17.
Files: `src/engines/ytdlp.ts`, `test/audio-only.test.ts`, `src/app.tsx`
Interfaces: download args gain `['-x', '--audio-format', 'mp3', '--ffmpeg-location', ffmpegPath]`.
Failing test first: `test/audio-only.test.ts` asserts the args builder for `kind:'audio'` contains `-x` and `--audio-format mp3`, and that `App` with `args.audioOnly` transitions `probing -> downloading` with no `picking` frame rendered.
Steps: build the arg function, test it, wire the skip in the state machine, test, commit.
Verify: `npm test` exits 0.
Done when: AC-7 passes.
Do not: hardcode an output path.

---

## M3 Routing and fallback

### T19 URL routing table   [P0]   Milestone: M3

Goal: `route()` reproduces SPEC section 4 exactly for 12 URLs.
Depends on: T05.
Files: `src/lib/platforms.ts`, `test/platforms.test.ts`, `src/types.ts`
Interfaces:
```ts
export interface RouteConfig { available: Record<EngineId, boolean>; privacyMode?: boolean; manual?: EngineId; }
export function route(url: string, cfg: RouteConfig): { primary: EngineId; fallbacks: EngineId[] };
```
Modifiers in order: drop unavailable, then privacy swap for YouTube, then manual override (primary replaced, yt-dlp only fallback).
Failing test first: `test/platforms.test.ts` holds 12 cases as a table: one per SPEC row, plus drop-unavailable (cobalt present then absent), privacy-mode YouTube, manual override, and a non-http URL rejection. Each case asserts the full `{primary, fallbacks}` object. Fails on missing module.
Steps: implement the matcher (host suffix match, photo-path special case first), then the modifiers, run the table.
Verify: `npm test` prints `12 passed` (or more).
Done when: AC-1 passes.
Do not: make the function async or touch config files.

### T20 Engine registry and fallback runner   [P0]   Milestone: M3

Goal: a failing primary falls through and the UI labels the fallback.
Depends on: T19, T09, T15.
Files: `src/engines/index.ts`, `test/registry.test.ts`, `src/app.tsx`
Interfaces:
```ts
export function registry(cfg: RouteConfig): Engine[];
export async function runWithFallback(url: string, engines: Engine[], signal: AbortSignal,
  onFallback: (from: EngineId, to: EngineId) => void): Promise<{ engine: Engine; probe: ProbeResult }>;
```
Failing test first: `test/registry.test.ts` registers a fake primary whose `probe` rejects with `EngineError` and a fake secondary that succeeds; asserts `onFallback` was called with the pair and the resolved probe came from the secondary. Second test: no fallback available resolves to a rejected promise carrying `userMessage`. Fails on missing module.
Steps: implement, test, then surface the fallback label in the input/probing frame.
Verify: `npm test` exits 0.
Done when: AC-3 passes.
Do not: retry more than once per engine.

### T21 Manual engine control   [P1]   Milestone: M3

Goal: the segmented control and `--engine` pick the engine and show it before probing.
Depends on: T20, T23.
Files: `src/app.tsx`, `test/manual-engine.test.tsx`, `src/lib/platforms.ts`
Interfaces: input screen renders `engine: yt-dlp | cobalt | ...` line fed by `route(url, {manual})`.
Failing test first: render the app with `args.engine === 'cobalt'`, press Enter on a cobalt-supported URL, assert the frame shows `cobalt` before any probing text. Second test: toggle the segmented control with arrow keys and assert the label changes.
Steps: render the label, handle the toggle keys, test, commit.
Verify: `npm test` exits 0.
Done when: "show the chosen engine before probing" is observable in a test.
Do not: change the routing rules from T19.

---

## M4 Flags, config, clipboard, history

### T22 Config precedence and atomic writes   [P0]   Milestone: M4

Goal: flag > env > `~/.clirip/config.json` > default, written atomically at 0600.
Depends on: T08.
Files: `src/lib/config.ts`, `test/config.test.ts`, `src/types.ts`
Interfaces:
```ts
export interface Config { theme?: 'auto'|'light'|'dark'; engine?: EngineId; cobaltApi?: string; output?: string; audioOnly?: boolean; noWatermark?: boolean; }
export function resolveConfig(flag: Partial<Config>, env: NodeJS.ProcessEnv, file: Partial<Config>): Config;
export async function writeConfig(path: string, cfg: Config): Promise<void>;
```
Failing test first: `test/config.test.ts` asserts precedence across all four levels for `cobaltApi` (flag wins over env over file over default), asserts `writeConfig` creates the file with mode `0600` (stat it), and asserts a corrupt JSON file is replaced with defaults rather than thrown. Fails on missing module.
Steps: implement resolve (pure, easy), then write with temp-plus-rename, test both.
Verify: `npm test` exits 0, mode assertion prints `600`.
Done when: precedence and permissions are both proven.
Do not: read the config in `cli.tsx` yet.

### T23 Full flag surface   [P0]   Milestone: M4

Goal: every flag in SPEC section 5 parses, and `--help` prints them all.
Depends on: T08, T22.
Files: `src/lib/parse-args.ts`, `test/flags.test.ts`, `src/lib/usage.ts`
Interfaces: extend `CliArgs` with every flag from SPEC 5; `usage(): string` lists them.
Failing test first: `test/flags.test.ts` holds a table of all 8 flags with sample argv and expected parsed output, plus `unknown flag -> exit code 2`, plus `--help` output containing every flag string. Fails on missing flags.
Steps: implement, test, commit.
Verify: `npm test` exits 0, and `node dist/cli.js --help | head -20` output pasted into the ledger.
Done when: AC-13's `--theme` half passes and every SPEC 5 flag is covered.
Do not: add a flag that is not in SPEC 5.

### T24 Clipboard prefill   [P1]   Milestone: M4

Goal: a URL in the clipboard lands in the input field on start.
Depends on: T23.
Files: `src/lib/clipboard.ts`, `test/clipboard.test.ts`, `src/app.tsx`
Interfaces:
```ts
export const readers: Record<string, string[]>; // darwin: pbpaste | win32: powershell Get-Clipboard | linux: wl-paste then xclip
export async function readClipboard(platform: NodeJS.Platform, run?: Runner): Promise<string | null>;
```
Failing test first: `test/clipboard.test.ts` mocks the runner and asserts darwin uses `pbpaste`, win32 uses `powershell -c Get-Clipboard`, linux tries `wl-paste` then `xclip`, and a URL-shaped result is returned while non-URL text yields null. Fails on missing module.
Steps: implement with an injectable runner, test, wire the prefill, commit.
Verify: `npm test` exits 0.
Done when: prefill never populates a non-URL.
Do not: spawn a shell string.

### T25 History with cap and corruption recovery   [P0]   Milestone: M4

Goal: history survives runs, caps at 500, and resets on a corrupt file.
Depends on: T22.
Files: `src/lib/history.ts`, `test/history.test.ts`, `src/app.tsx`
Interfaces:
```ts
export const HISTORY_CAP = 500;
export interface HistoryEntry { url: string; title?: string; path?: string; at: number; }
export async function loadHistory(path: string): Promise<HistoryEntry[]>;
export async function addEntry(path: string, e: HistoryEntry): Promise<void>; // dedup by url, newest first, cap
```
Failing test first: `test/history.test.ts` writes 505 entries and asserts length 500 (newest kept), writes `not json` and asserts `loadHistory` resolves to `[]` plus the file is rewritten, writes 3 entries and asserts reload returns the same 3. Fails on missing module.
Steps: implement with temp-plus-rename, test, then render the history screen reachable from `input` via `H` and the footer, and from `--history`.
Verify: `npm test` exits 0.
Done when: AC-11 passes.
Do not: store more than the four fields.

---

## M5 cobalt

### T26 Typed cobalt client   [P1]   Milestone: M5

Goal: request and response types straight from the current docs, every status handled.
Depends on: T05.
Files: `src/engines/cobalt.ts`, `test/cobalt.test.ts`, `plan/ledger.md`
Interfaces: types copied from SPEC section 1: `CobaltRequest`, `CobaltTunnelResponse`, `CobaltLocalProcessingResponse`, `CobaltPickerResponse`, `CobaltErrorResponse`, union `CobaltResponse`.
```ts
export async function cobaltRequest(baseUrl: string, key: string | undefined,
  body: CobaltRequest, fetchImpl?: typeof fetch): Promise<CobaltResponse>;
```
Headers: `Accept: application/json`, `Content-Type: application/json`, `Authorization: Api-Key <key>` only when a key exists.
Failing test first: `test/cobalt.test.ts` uses a fake `fetchImpl` for each of the five `status` values and asserts the returned union member narrows correctly; a sixth case asserts no `Authorization` header when key is undefined. Fails on missing module.
Steps: write the types from SPEC 1, implement, test with injected fetch, commit.
Verify: `npm test` exits 0 with 6 cases.
Done when: every documented status has a branch.
Do not: call a real instance, and do not use `api.cobalt.tools`.

### T27 cobalt options, errors, and the no-instance hint   [P1]   Milestone: M5

Goal: quality/codec/audio options surface, auth and capacity errors read well, and the hint shows when no instance is set.
Depends on: T26, T19.
Files: `src/engines/cobalt.ts`, `test/cobalt-ui.test.tsx`, `src/app.tsx`
Interfaces: `probe` maps cobalt options into `FormatOption[]`; error mapping: `api.auth.*` -> "This cobalt instance needs an API key. Set COBALT_API_KEY or cobaltApi.", `429`/limit -> "This cobalt instance is busy. Try again shortly."
Failing test first: `test/cobalt-ui.test.tsx` renders the input screen with no `cobaltApi` in config and asserts the one-line hint appears and that `route()` drops cobalt for an instagram URL; second test maps an auth error and asserts the friendly string, not the raw code. Fails on missing behavior.
Steps: implement hint + mapping, test, commit.
Verify: `npm test` exits 0.
Done when: AC-9 passes.
Do not: reintroduce a watermark toggle (ruled out in the ledger).

---

## M6 gallery-dl

### T28 gallery-dl capability verification and fixtures   [P1]   Milestone: M6

Goal: prove the installed version handles TikTok photo posts and capture real output.
Depends on: T13.
Files: `test/fixtures/gallery-dl-tiktok-photo.json`, `plan/ledger.md`, `test/gallery-dl-capability.test.ts`
Interfaces: fixture is `--dump-json` output for a TikTok photo URL, committed verbatim.
Failing test first: `test/gallery-dl-capability.test.ts` asserts the fixture parses, has an array of images, and exposes a post id field. Fails while the fixture is absent.
Steps: run `gallery-dl --version`, `gallery-dl --list-extractors | grep -i tiktok`, `gallery-dl --help | grep -i dump`, then `gallery-dl --dump-json <photo url> > fixture`. Record all four outputs in the ledger. If gallery-dl is not installed, write `Ruling: fixture deferred | gallery-dl absent on this machine | M6 blocked until a machine with gallery-dl runs this task` and stop.
Verify: fixture exists, test passes, ledger holds the command output.
Done when: AC-10's input exists.
Do not: hand-write the fixture.

### T29 gallery-dl engine   [P1]   Milestone: M6

Goal: TikTok photo URL produces preview text and a `tiktok_<postId>/` folder with numbered files.
Depends on: T28.
Files: `src/engines/gallery-dl.ts`, `test/gallery-dl-engine.test.ts`, `src/app.tsx`
Interfaces: picker options are `images only`, `images plus audio`, `audio only`. `probe` returns `summary: "12 images found, TikTok Slideshow"`. Download writes `tiktok_<postId>/` with `001.jpg` style names.
Failing test first: `test/gallery-dl-engine.test.ts` loads the fixture, asserts the preview string, and runs `download` against a mocked runner asserting the output directory name pattern and that file indices are sequential. Fails on missing module.
Steps: implement from the fixture shape, test with a mocked runner, wire the picker, commit.
Verify: `npm test` exits 0.
Done when: AC-10 passes.
Do not: write outside `outDir`.

---

## M7 Mouse everywhere

### T30 Click targets on buttons, rows, footer, logo   [P1]   Milestone: M7

Goal: every interactive element has a registered rectangle and a handler.
Depends on: T12 must have passed; T21, T25.
Files: `src/app.tsx`, `src/lib/click-map.ts`, `test/mouse.test.tsx`
Interfaces: `ClickMap` instances registered during render; logo click -> `input`; footer `H` -> `history`; list row click selects and a second click confirms.
Failing test first: `test/mouse.test.tsx` injects SGR press events at a registered logo rectangle and asserts the state becomes `input`; injects a click outside every rectangle and asserts no state change. Fails while mouse mode is not wired.
Steps: enable mouse in `cli.tsx` behind `MOUSE_ENABLE`, register rects on render, test both cases, commit.
Verify: `npm run typecheck && npm test` exits 0.
Done when: AC-12 passes end to end.
Do not: enable mouse when `process.stdout.isTTY` is false.

---

## M8 NewPipe

### T31 NewPipe availability and fallback   [P2]   Milestone: M8

Goal: the engine reports unavailable without Java 11+ or the JAR, and routing falls back to yt-dlp.
Depends on: T20.
Files: `src/engines/newpipe.ts`, `test/newpipe.test.ts`, `src/types.ts`
Interfaces: `available()` returns `{ok:false, reason:'Java 11 or newer is required for Privacy Mode.'}` when the check fails.
Failing test first: `test/newpipe.test.ts` mocks the runner: no java -> unavailable with that reason; java 17 + JAR present -> available. Then a routing test asserts YouTube with privacy mode falls back to yt-dlp when newpipe is unavailable.
Steps: implement, test, commit.
Verify: `npm test` exits 0.
Done when: the unavailable path never throws.
Do not: write Java code here (that is T32).

### T32 Gradle shim with JSON-over-stdout contract   [P2]   Milestone: M8

Goal: a buildable shim that prints one JSON object per probe.
Depends on: T31.
Files: `shim/build.gradle.kts`, `shim/src/main/java/.../Main.java`, `plan/ledger.md`
Interfaces: process args `java -jar shim.jar <url>`, stdout is a single `ProbeResult`-shaped JSON object, exit 0. Non-zero exit means stderr carries the reason.
Failing test first: `test/shim-contract.test.ts` skips when `gradle` and `java` are absent (assert a ledger ruling exists instead), otherwise builds and runs the shim against a fixture URL and asserts stdout parses as JSON with a `formats` array.
Steps: write the Gradle file, the main class calling NewPipe Extractor, the JSON serialization, then the contract test.
Verify: `npm test` exits 0 (skipped-with-ruling is acceptable on machines without Java).
Done when: the contract is documented in the ledger and, where possible, exercised.
Do not: let the shim touch the UI or read stdin.

---

## M9 Packaging and README

### T33 npm pack and npx smoke   [P0]   Milestone: M9

Goal: the package ships only `dist` and `README.md`, and runs from a clean directory.
Depends on: T02, T17, T23.
Files: `package.json`, `test/pack.test.ts`, `plan/ledger.md`
Interfaces: `"files": ["dist", "README.md"]`.
Failing test first: `test/pack.test.ts` runs `npm pack --dry-run --json` and asserts the file list contains no `cli-rip_enhanced-prompt-v1.md`, no `.freebuff`, no `plan/`, no `docs/`, and that `dist/cli.js` is present. Fails before the field is correct.
Steps: run the dry run, fix `files` until clean, then `npm pack` into a temp dir and run `npx --yes ./clirip-<v>.tgz --help` from an empty directory, paste the output.
Verify: `npm pack --dry-run` output and the `npx` run both pasted into the ledger.
Done when: AC-14 and AC-15's pack half pass.
Do not: publish.

### T34 Final README   [P0]   Milestone: M9

Goal: eleven items, every command executed and logged.
Depends on: T33.
Files: `README.md`, `plan/ledger.md`, `src/lib/usage.ts`
Interfaces: the eleven items are SPEC section 2.3, in that order.
Failing test first: `test/readme.test.ts` asserts the README contains eleven required headings (install, engines table, routing table, flags, keys and mouse, files written, development, docs link, legal line, credit line, transcript) and that the routing table rows match `platforms.test.ts` cases.
Steps: paste the real `--help` output, paste a real transcript from a completed run, run every command in the README and paste the results into the ledger, then commit.
Verify: `npm test` exits 0; ledger holds a line per command.
Done when: AC-17 passes.
Do not: document a feature that has no test.

---

## M10 Docs page

D tasks follow Section 12 of the spec. Load `design-taste-frontend` first. The spec wins any conflict, and the ruling goes in the ledger. Each D task appends to the same `docs/index.html`.

### D01 Shell, tokens, three themes, status line   [P1]   Milestone: M10

Goal: an empty page with the full token system, theme switching, and the status line.
Depends on: T34.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/ledger.md`
Interfaces:
```html
<html lang="en" data-theme="moss">
<style> :root, [data-theme="moss"] { --bg:#0f1210; ... } [data-theme="paper"] {...} [data-theme="ember"] {...} </style>
<div class="statusline"><span id="st-theme">moss</span><span id="st-section"></span><span id="st-keys">T theme · ? keys · / filter</span></div>
```
Keys spelled `T theme`, `? keys`, `/ filter` with spaces, no middle dots.
Failing test first: `test/docs/checks.mjs` (plain `node`) asserts: file exists, `<html` carries `data-theme`, all three theme blocks define all ten tokens, `localStorage` access is inside `try`. Fails on an empty file.
Steps: write head, tokens, reset, layout skeleton, status line, the check script, then `node test/docs/checks.mjs`.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: switching `data-theme` restyles everything by token alone.
Do not: write any content sections yet, and make no external request.

### D02 Sidebar, top bar, scroll tracking, filter, keys   [P1]   Milestone: M10

Goal: navigation works by keyboard, mouse, and at every width.
Depends on: D01.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/DESIGN.md`
Interfaces: `<nav>` with `start concepts interface engines reference` groups; `<button id="nav-toggle" aria-expanded>` for the under-860px bar; `<input id="nav-filter">` opened by `/`; `<dialog>` or a `div role="dialog"` for `?`; `IntersectionObserver` sets `.active` and writes `#st-section`.
Failing test first: the check script asserts one `<nav>`, one `h1`, the toggle button exists with `aria-expanded`, no duplicate `id` attributes, and every `href="#..."` has exactly one matching id.
Steps: markup, CSS, JS, check.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: nav collapses under 860px and is keyboard operable.
Do not: add content beyond section headings with ids.

### D03 Component group: wordmark, headings, code, callouts, tables, diagrams   [P1]   Milestone: M10

Goal: the reusable visual language of the page.
Depends on: D01.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/DESIGN.md`
Interfaces: wordmark markup from DESIGN.md with `aria-label="CLIrip"` and `aria-hidden="true"` on the art; `h2` index gutter `01`-`24`; `h3` with `──` glyph; `pre > code` plus a copy button using `navigator.clipboard` with a textarea fallback; `.callout.warning|.info|.note` with box-drawing frames; real `<table>`; `.diagram` with `<span class="hl">` and `<span class="dim">`; `.bar` block bars.
Failing test first: check script asserts the wordmark rows are all equal length, `aria-label="CLIrip"` exists, the art span is `aria-hidden="true"`, and the five rows match `src/lib/logo.ts` exactly (string compare).
Steps: write the CSS block, then the markup helpers as hand-written HTML, run the check.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: AC-23's docs half passes.
Do not: use emoji, gradients, glow, glass, or border-radius above 0.

### D04 Content: start group   [P1]   Milestone: M10

Goal: disclaimer, quick start, manual install.
Depends on: D02, D03.
Files: `docs/index.html`, `test/docs/checks.mjs`, `README.md`
Sections: `#disclaimer`, `#quickstart`, `#manual-install` (3 sections).
Content rules: disclaimer states "download only content you have the right to save" and "follow each site's terms". Quick start uses `npx clirip` and `npm install -g clirip`. Manual install covers Node 18+ requirements. Commands copied from the README, already executed in T34.
Interfaces: `<h2 id="disclaimer">` wrapping a `.callout.warning`; `<h2 id="quickstart">` and `<h2 id="manual-install">` each followed by `<pre><code>` blocks; three sidebar `href` targets that D02 already declared.
Failing test first: check script asserts all three ids exist exactly once and each section has an `h2`.
Steps:
1. Append the disclaimer section with its warning callout.
2. Append quick start with the two install commands in a code block.
3. Append manual install with the Node 18+ requirement line.
4. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: the three sections read correctly with JS disabled.
Do not: invent commands that were not run in T34.

### D05 Content: concepts group   [P1]   Milestone: M10

Goal: what is CLIrip, architecture with the state machine diagram, engine routing with table and flow diagram.
Depends on: D04.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#overview`, `#architecture`, `#routing` (3).
Interfaces: `<h2 id="overview">`; `<h2 id="architecture">` followed by a `.diagram` block holding the SPEC section 3 transition table as ASCII; `<h2 id="routing">` followed by a real `<table>` with header row `URL pattern / Primary / Fallback` and exactly 8 body rows, plus one `.diagram` flow.
The state machine diagram is the SPEC section 3 table drawn as ASCII in a `.diagram`. The routing table rows must match SPEC section 4 exactly.
Failing test first: check script asserts the routing table has 8 rows with the exact engine cells from SPEC 4, and the three ids exist.
Steps:
1. Append the overview section.
2. Append architecture with the ASCII state machine.
3. Append routing with the 8-row table and the flow diagram.
4. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: the routing table matches the spec cell for cell.
Do not: add a second ASCII diagram family beyond state machine and routing flow.

### D06 Content: interface part one   [P1]   Milestone: M10

Goal: input screen, format picker, downloading, done and error.
Depends on: D05.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#input-screen`, `#format-picker`, `#downloading`, `#done-error` (4).
Interfaces: four `<h2>` elements with ids as listed; a `.bar` block-character element for progress (`<span class="bar-fill">` in `--accent`, remainder in `--line`); one `<pre>` holding a real probe summary copied from `test/fixtures/ytdlp-video.json` rendering.
Include a block-character progress bar example and one real captured probe summary from the ledger fixtures.
Failing test first: check script asserts four ids exist, each `h2` has its index gutter, and no `pre` contains a string that looks like a fake screenshot div.
Steps:
1. Append input screen.
2. Append format picker with the real probe summary.
3. Append downloading with the block bar.
4. Append done and error, then run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: content renders without JS.
Do not: use div-built fake screenshots.

### D07 Content: interface part two   [P1]   Milestone: M10

Goal: history, keys and mouse, themes.
Depends on: D06.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#history`, `#keys-mouse`, `#themes` (3).
Interfaces: `<h2 id="history">` with a `<table>` of the history fields; `<h2 id="keys-mouse">` with a `<table>` of `Key / Action` rows for arrows, j/k, Enter, Esc, Ctrl+C, Ctrl+T, H, number keys, plus one row for the mouse; `<h2 id="themes">` with a `moss / paper / ember` table and the `T` cycle note.
Keys table must list: arrows, j/k, Enter, Esc, Ctrl+C, Ctrl+T, H, number keys, and note mouse support. Themes section names moss, paper, ember with `T` cycling.
Failing test first: check script asserts three ids exist and the keys table contains a row for each of the eight key bindings.
Steps:
1. Append history.
2. Append keys and mouse with the full bindings table.
3. Append themes naming all three tokens sets.
4. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: the keys table matches the implemented bindings.
Do not: document a key that has no handler.

### D08 Content: engines yt-dlp and cobalt   [P1]   Milestone: M10

Goal: `#ytdlp` and `#cobalt` reference the real behavior.
Depends on: D07.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#ytdlp`, `#cobalt` (2, dense).
Interfaces: `<h2 id="ytdlp">` with an `h3` per capability (install and checksum, probe, format scoring, download, MP3); `<h2 id="cobalt">` with `h3` children `Instance`, `API key`, `Options`, and a `.callout.warning` carrying the no-default-instance caveat.
cobalt covers instance, API key, options. It states that no default instance is configured and hosted `api.cobalt.tools` is not for this project.
Failing test first: check script asserts both ids exist and that `#cobalt` text contains "cobaltApi" and "no default instance".
Steps:
1. Append yt-dlp from the facts T13 to T18 proved.
2. Append cobalt with the three subsections.
3. Add the warning callout with the instance caveat.
4. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: the cobalt caveat is on the page.
Do not: print an API key or a real instance URL.

### D09 Content: engines gallery-dl and NewPipe   [P1]   Milestone: M10

Goal: `#gallery-dl` and `#newpipe`.
Depends on: D08.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#gallery-dl`, `#newpipe` (2).
Interfaces: `<h2 id="gallery-dl">` with the three picker options in a `<table>` and a `.diagram` showing `tiktok_<postId>/` with numbered files; `<h2 id="newpipe">` with the Privacy Mode sentence verbatim, a `.callout.info` for the Java 11+ requirement, and the shim described as project-built.
gallery-dl covers TikTok slideshows and the `tiktok_<postId>/` folder layout. NewPipe covers Privacy Mode wording exactly as SPEC 1.5 (no official API, no Google account, still contacts YouTube servers), the Java 11+ requirement, and the shim.
Failing test first: check script asserts both ids exist and the NewPipe section contains the phrase "still contacts YouTube servers".
Steps:
1. Append gallery-dl with picker options and folder tree.
2. Append NewPipe with the Privacy Mode sentence copied from SPEC 1.5.
3. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: Privacy Mode wording matches the spec.
Do not: claim NewPipe avoids contacting YouTube.

### D10 Content: reference part one   [P1]   Milestone: M10

Goal: CLI flags, configuration and precedence, output and files.
Depends on: D09.
Files: `docs/index.html`, `test/docs/checks.mjs`, `src/lib/usage.ts`
Sections: `#flags`, `#configuration`, `#output-files` (3).
Interfaces: `<h2 id="flags">` with a `<table>` of `Flag / Value / Default` rows and one `<pre>` holding the verbatim `clirip --help` output; `<h2 id="configuration">` with an ordered list of the four precedence levels; `<h2 id="output-files">` with a `.diagram` tree of `~/.clirip/`.
Flags come from the real `clirip --help` output captured in T23. Configuration documents flag > env > file > default and the `~/.clirip/config.json` layout with mode 0600.
Failing test first: check script extracts every flag string from `src/lib/usage.ts` and asserts each appears somewhere in `docs/index.html`, and that every `--flag`-looking string in the docs exists in `usage.ts`. Fails in both directions.
Steps:
1. Paste the captured `--help` output into the flags section.
2. Append configuration with the four precedence levels.
3. Append output and files with the directory tree.
4. Run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: AC-20's flag parity half passes.
Do not: document `--no-watermark` as applying to cobalt.

### D11 Content: reference part two   [P1]   Milestone: M10

Goal: dependencies, project files, troubleshooting, changelog.
Depends on: D10.
Files: `docs/index.html`, `test/docs/checks.mjs`, `plan/SPEC.md`
Sections: `#dependencies`, `#project-files`, `#troubleshooting`, `#changelog` (4).
Interfaces: `<h2 id="dependencies">` with a `Tool / Where it lives / Required by` `<table>`; `<h2 id="project-files">` with a `.diagram` repo tree; `<h2 id="troubleshooting">` with seven `h3` entries matching SPEC 7.6 exactly; `<h2 id="changelog">` with an ordered list of shipped milestones.
Troubleshooting covers all seven required cases from SPEC 7.6. Changelog lists shipped milestones only; a cut feature appears as "not shipped".
Failing test first: check script asserts seven troubleshooting entries exist (yt-dlp checksum, ffmpeg missing, cobalt auth or no instance, gallery-dl missing, Java missing, terminal not restored, mouse not responding) and all four ids exist.
Steps:
1. Append dependencies table.
2. Append project files tree.
3. Append troubleshooting with all seven `h3` entries.
4. Append changelog, then run the check script.
Verify: `node test/docs/checks.mjs` exits 0.
Done when: all seven troubleshooting cases are present.
Do not: list an unshipped feature as shipped.

### D12 Automated docs checks   [P1]   Milestone: M10

Goal: AC-18 through AC-22 in one runnable script.
Depends on: D01-D11.
Files: `test/docs/checks.mjs`, `test/docs/contrast.mjs`, `docs/index.html`
Interfaces: `node test/docs/checks.mjs` prints one PASS/FAIL line per check and exits non-zero on any failure. `node test/docs/contrast.mjs` recomputes all 42 ratios from DESIGN.md's tables and fails below 4.5.
Checks in order: no external requests (no `http` in `src`/`href` on `<link>`, no `@import`, no `url()` with a scheme, size under 300 KB); ids unique and every nav href resolves; AA contrast per theme; focus visible on every interactive element (`:focus-visible` rule exists); `prefers-reduced-motion` disables the three allowed transitions; `document.documentElement.scrollWidth` does not exceed `clientWidth` at 375, 768, 1280 (asserted by a width rule audit, since the script has no browser); wordmark row equality.
Failing test first: run the script before adding checks to `docs/index.html`; it must fail today.
Steps: write checks one at a time, run after each, keep them failing until the page satisfies them.
Verify: `node test/docs/checks.mjs && node test/docs/contrast.mjs` both exit 0, output pasted into the ledger.
Done when: AC-18, AC-19, AC-21, AC-22 all have PASS lines.
Do not: weaken a check to make it pass.

### D13 Parity checks   [P1]   Milestone: M10

Goal: AC-20, AC-23, AC-24 proven by script.
Depends on: D12.
Files: `test/docs/parity.mjs`, `test/platforms.test.ts`, `src/lib/logo.ts`
Interfaces: `node test/docs/parity.mjs` reads `docs/index.html`, `src/lib/logo.ts`, `src/lib/usage.ts`, and the routing cases, then asserts: wordmark rows identical in both files; every flag in help appears in docs and vice versa; routing table rows in docs match the test table row for row; `T` key handler present in the docs script.
Failing test first: run it before writing the comparison; fails with a diff.
Steps: write the comparator, run, fix whichever side is wrong.
Verify: `node test/docs/parity.mjs` exits 0, output pasted into the ledger.
Done when: AC-20, AC-23, AC-24 all pass from one command.
Do not: edit the spec to match the page.

---

## Traceability

Every AC maps to at least one task. No AC is orphaned.

| AC | Task(s) |
|---|---|
| AC-1 route() table, 12 URLs | T19 |
| AC-2 fake engine walks all states and prints the path | T09, T10, T11 |
| AC-3 fallback triggers and is labeled | T20 |
| AC-4 error screen shows only userMessage | T11 |
| AC-5 terminal restored on Ctrl+C and on throw | T08 |
| AC-6 h264 ranks above av1 and vp9 | T16 |
| AC-7 --audio-only skips picking, yields mp3 | T18 |
| AC-8 installer rejects a bad SHA-256 | T14 |
| AC-9 cobalt skipped with no instance, hint shown | T27 |
| AC-10 gallery-dl fixture yields preview and folder | T28, T29 |
| AC-11 history caps at 500 and survives corruption | T25 |
| AC-12 click inside fires, click outside does not | T12, T30 |
| AC-13 theme cycles on Ctrl+T and footer, --theme sets start | T06, T23 |
| AC-14 npm pack and npx from a clean directory | T33 |
| AC-15 ignore rules hold in git and in the pack | T01, T33 |
| AC-16 origin points at the repo, or fallback commands logged | T04 |
| AC-17 README has eleven items, every command run | T34 |
| AC-18 one file, no external requests | D12 |
| AC-19 full content with JavaScript disabled | D12 |
| AC-20 unique ids, flag parity both directions | D10, D12, D13 |
| AC-21 AA contrast in every theme | D12 |
| AC-22 T cycles themes, focus visible, reduced motion, no h-scroll | D12 |
| AC-23 wordmark row lengths equal and identical in both files | T07, D03, D13 |
| AC-24 routing and engine tables match the tests | D05, D13, T19 |

ACs with no task: none.

Tasks with no direct AC (infrastructure, they keep other tasks testable): T02 T03 T05 T13 T15 T17 T21 T22 T24 T26 T31 T32 D01 D02 D04 D06 D07 D08 D09 D11. Each still ends green on the milestone gate.
