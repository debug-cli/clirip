# CLIrip ledger

Append rows. Never delete a row. Source URLs are mandatory for any external fact.

## Decisions

| Date | Subject | Decision | Source |
|---|---|---|---|
| 2026-10-06 | ink version | Pin `ink@5.2.1`. `ink@8.0.0` is latest but its peer range is `react >=19.3.0`, which breaks the React 18 requirement. | https://registry.npmjs.org/ink (npm view ink version peerDependencies) |
| 2026-10-06 | react version | Pin `react@18.3.1` (last 18.x) and `@types/react@18.3.31` (last 18.x). | https://registry.npmjs.org/react |
| 2026-10-06 | input helpers | `ink-select-input@6.2.0` (peer `ink >=5.0.0`, `react >=18.0.0`), `ink-text-input@6.0.0` (peer `ink >=5`), `ink-spinner@5.0.0` (peer `ink >=4.0.0`). All compatible. | https://registry.npmjs.org/ink-select-input etc. |
| 2026-10-06 | test stack | `vitest@5.0.3`, `ink-testing-library@4.0.0` (peer `@types/react >=18.0.0`). | https://registry.npmjs.org/vitest |
| 2026-10-06 | build stack | `tsup@8.5.1`, format `esm`, shebang banner. `ffmpeg-static@5.3.0`. | https://registry.npmjs.org/tsup |
| 2026-10-06 | cobalt schema | Request and response types are written from `docs/api.md` on `main`, not from blog posts. Body keys: `url` (required), `videoQuality`, `audioFormat`, `audioBitrate`, `downloadMode`, `filenameStyle`, `disableMetadata`, `alwaysProxy`, `localProcessing`, `subtitleLang`, `youtubeVideoCodec`, `youtubeVideoContainer`, `youtubeDubLang`, `convertGif`, `allowH265`, `tiktokFullAudio`, `youtubeBetterAudio`, `youtubeHLS`. Response `status`: `tunnel`, `local-processing`, `redirect`, `picker`, `error`. Auth: `Authorization: Api-Key <key>` or `Bearer <token>`. | https://raw.githubusercontent.com/imputnet/cobalt/main/docs/api.md |
| 2026-10-06 | cobalt watermark | Current schema has no watermark field. Drop the cobalt mapping of `--no-watermark`. Ruling logged in the Rulings table below. | https://raw.githubusercontent.com/imputnet/cobalt/main/docs/api.md |
| 2026-10-06 | cobalt instances | No default instance. cobalt is enabled only by `--cobalt-api` / `cobaltApi`. Hosted `api.cobalt.tools` is off limits without permission. | https://raw.githubusercontent.com/imputnet/cobalt/main/docs/api.md |
| 2026-10-06 | mouse protocol | Enable `\x1b[?1002h\x1b[?1006h`, parse `ESC [ < btn ; col ; row (M\|m)` with regex `\x1b\[<(\d+);(\d+);(\d+)([Mm])`, coordinates 1-based, disable both on exit, guard on `process.stdout.isTTY`. | https://shuntksh.com/blog/202506/modern-terminal-app-with-mouse-support/ |
| 2026-10-06 | ink raw input | Ink exposes raw mode through `useStdin().setRawMode` and `exitOnCtrlC`; there is no mouse API in Ink 5, so mouse bytes are read from `process.stdin` directly. | https://raw.githubusercontent.com/vadimdemedes/ink/v5.0.1/readme.md |
| 2026-10-06 | yt-dlp assets | Release `2026.08.19` ships `yt-dlp`, `yt-dlp.exe`, `yt-dlp_arm64.exe`, `yt-dlp_x86.exe`, `yt-dlp_linux`, `yt-dlp_linux_aarch64`, `yt-dlp_macos`, `yt-dlp_musllinux`, `yt-dlp_musllinux_aarch64`, `yt-dlp_win.zip`, `yt-dlp_win_arm64.zip`, `yt-dlp_win_x86.zip`, plus `SHA2-256SUMS` and `SHA2-256SUMS.sig`. | https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest |
| 2026-10-06 | gh flags | `gh repo create <name> --public --source . --remote origin -d <desc>` is valid: `--public`, `--source`, `-d/--description` all exist; `--remote` is implied by `--source`. | `gh repo create --help` |
| 2026-10-06 | local toolchain | ffmpeg 8.1.2 and yt-dlp 2026.08.19 present on the planner machine. `gallery-dl` and `java` are NOT installed, so their fixtures and availability checks run on the build machine or the engine reports unavailable. | local command output, this session |
| 2026-10-06 | design skill vs contract | design-taste-frontend rules yield to the Section 12 structural contract wherever they conflict: one framework-free HTML file, three themes instead of dual-mode, index gutter on every h2. | cli-rip_enhanced-prompt-v1.md section 12 |
| 2026-10-06 | DOSping docs page audit | Structure and depth only, as SPEC 7 says. Keep: fixed sidebar with logo box, group labels, links and a footer line; one main column of id'd sections; code blocks with a copy button; three callout kinds; real tables; ASCII diagrams with highlight and dim spans; troubleshooting then changelog last. Reject: the Google Fonts `@import`, the `window.addEventListener("scroll")` tracker, the `> ` and `$ ` heading pseudo-markers, the grey palette, `nav{display:none}` with no toggle, `min-height:100vh`, the em-dashes in the changelog, changelog-as-table, and the absent `h1`, `data-theme`, status line, focus styles and reduced-motion block. Each reject is already a CLIrip requirement in SPEC 7 or AC-18 to AC-22, so no new work item follows from it. | `/c/Users/saint/Documents/dosping/docs/index.html` (2881 lines, 129 KB, read this session) |
| 2026-10-06 | ASCII diagram authoring | The reference diagrams are visibly garbled: art rows are wrapped across indented HTML source lines inside `white-space: pre`, so the indentation becomes part of the drawing. Every `.diagram` and wordmark in CLIrip keeps one art row per physical source line, and a check compares row lengths before a batch is accepted. | `/c/Users/saint/Documents/dosping/docs/index.html` lines 757-765, read this session |

## Rulings

Format: `Ruling: <decision> | <why> | <cost if wrong>`

| Date | Ruling |
|---|---|
| 2026-10-06 | Ruling: drop `--no-watermark` for cobalt, keep it for other engines \| the current cobalt schema has no watermark field \| a dead flag that does nothing when passed |
| 2026-10-06 | Ruling: T02 creates `src/cli.tsx` and `src/types.ts` as dependency-free stubs \| the tsup entry `src/cli.tsx` cannot resolve on an empty tree, so T02's own gate (`typecheck && test && build`) cannot pass without one, and T02 already pre-authorizes pulling T05's stub forward \| T05 and T08 replace both files; a stale stub would ship an empty binary |
| 2026-10-06 | Ruling: T02 runs `npm install` itself so its own gate can execute; T03 verifies the pins and records the resolved versions \| T02's Verify line requires typecheck, test and build, none of which run without installed tooling \| the lockfile would go unrecorded if T03's evidence step is dropped |
| 2026-10-06 | Ruling: T01's ignore check runs as the literal `git check-ignore -v` command instead of `test/ignore.test.ts` \| T01 forbids editing any file outside its `Files:` list and vitest does not exist until T02/T03, so the vitest form of the same two assertions lands with T02 and T01 proves the rule by command \| the ignore rule goes unwatched by `npm test` for exactly one task |
| 2026-10-06 | Ruling: the status line key hints read exactly `T theme ? keys / filter`, single spaces, no middle dots, `/` kept as the glyph \| DESIGN.md describes that field as "slash filter" while D01's interface snippet writes `/ filter`, and D01's prose then bans the middle dots its own snippet contains, so the block contradicts itself; SPEC 7.1 names the keys as `T`, `/` and `?` \| D01's check script asserts one literal string, and if the two sides disagree the shipped status line contradicts the keys overlay D02 builds |

## Task log

Format: `task id | commit hash | result`

| Task | Commit | Result |
|---|---|---|
| T01 | 7c7e3cb | PASS. `git init -b main` created the repo. `git check-ignore -v cli-rip_enhanced-prompt-v1.md .freebuff` printed `.gitignore:10` and `.gitignore:9` respectively, exit 0. `git status --short` and `git ls-files` list neither protected path. AC-15 first half passes. |
