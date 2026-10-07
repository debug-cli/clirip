# CLIrip SPEC (binding authority)

Derived from `cli-rip_enhanced-prompt-v1.md` sections 3, 4, 7, 8, 10, 11, 12. Where an external fact was verified while writing this plan, the source URL follows the claim.

## 1. Hard facts and open items

1. **cobalt public instance.** Hosted `api.cobalt.tools` uses bot protection and is not intended for other projects without permission. cobalt is enabled only when the user sets `--cobalt-api <url>` or config `cobaltApi`. With no instance configured, routing skips cobalt and uses the fallback engine. The UI shows a one-line hint. Source: https://raw.githubusercontent.com/imputnet/cobalt/main/docs/api.md ("hosted api instances (such as api.cobalt.tools) use bot protection and are not intended to be used in other projects without explicit permission").
2. **cobalt request shape.** `POST /` with `Accept: application/json` and `Content-Type: application/json`. Auth header `Authorization: Api-Key <key>` (or `Bearer <token>`). All body keys optional except `url`. Verified field list: `audioBitrate` (320/256/128/96/64/8), `audioFormat` (best/mp3/ogg/wav/opus), `downloadMode` (auto/audio/mute), `filenameStyle` (classic/pretty/basic/nerdy), `videoQuality` (max/4320/2160/1440/1080/720/480/360/240/144), `disableMetadata`, `alwaysProxy`, `localProcessing` (disabled/preferred/forced), `subtitleLang`, `youtubeVideoCodec` (h264/av1/vp9), `youtubeVideoContainer` (auto/mp4/webm/mkv), `youtubeDubLang`, `convertGif`, `allowH265`, `tiktokFullAudio`, `youtubeBetterAudio`, `youtubeHLS`. Response `status` is one of `tunnel`, `local-processing`, `redirect`, `picker`, `error`. Tunnel/redirect carry `url` + `filename`. Picker carries `picker[]` of `{type: photo|video|gif, url, thumb?}` plus optional `audio`/`audioFilename`. Error carries `error.code` + optional `error.context`. Source: https://raw.githubusercontent.com/imputnet/cobalt/main/docs/api.md
3. **cobalt watermark toggle.** The current schema has no watermark field. Remove the `--no-watermark` mapping for cobalt and log a ruling. (`--no-watermark` stays for engines that support it.) Source: same api.md field tables above.
4. **NewPipe Extractor** is a Java library with no CLI. The shim is code this project writes and builds. P2. The engine reports "unavailable" when Java 11+ or the JAR is missing.
5. **Privacy Mode wording.** NewPipe does not use the official YouTube API or a Google account. It still contacts YouTube servers. UI text and docs must say exactly that.
6. **Ink has no mouse support.** Mouse needs SGR mouse mode escape sequences read from raw stdin plus a map from screen cells to click targets. Enable `\x1b[?1002h\x1b[?1006h`, disable on exit, guard on `process.stdout.isTTY`. SGR packet: `ESC [ < btn ; col ; row (M|m)`, 1-based coords, regex `\x1b\[<(\d+);(\d+);(\d+)([Mm])`. P1 with a spike first. Source: https://shuntksh.com/blog/202506/modern-terminal-app-with-mouse-support/ ; Ink raw-mode surface `useStdin().setRawMode` and `exitOnCtrlC` per https://raw.githubusercontent.com/vadimdemedes/ink/v5.0.1/readme.md
7. **gallery-dl TikTok photo support** must be verified against the installed version before the engine is built. Run `gallery-dl --version`, `gallery-dl --list-extractors`, `gallery-dl --help`. Capture real `--dump-json` output as fixtures. Not installed on the planner machine (command not found); the builder records the fixture from the machine that has it, or logs a ruling and defers.
8. **yt-dlp binary download.** Fetch official GitHub releases over HTTPS, pick the asset for the current OS/arch, verify SHA-256 against the release checksum file, then mark executable. Asset names on release `2026.08.19`: `yt-dlp`, `yt-dlp.exe`, `yt-dlp_arm64.exe`, `yt-dlp_x86.exe`, `yt-dlp_linux`, `yt-dlp_linux_aarch64`, `yt-dlp_macos`, `yt-dlp_musllinux`, `yt-dlp_musllinux_aarch64`, `yt-dlp_win.zip`, `yt-dlp_win_arm64.zip`, `yt-dlp_win_x86.zip`. Checksums: `SHA2-256SUMS` (+ `.sig`). Source: https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest
9. **GitHub pages for repository trees block automated fetches.** Read repository files with `git clone --depth 1` or from raw.githubusercontent.com.

## 2. Repository and git hygiene

Repository: `github.com/debug-cli/clirip`, public, default branch `main`. Same owner as the dosping repository.

M0 order of operations:
1. `git init -b main`.
2. Write `.gitignore` with exactly the content in section 3 below.
3. Run `git check-ignore -v cli-rip_enhanced-prompt-v1.md .freebuff`. Both must print a matching rule. Log the output.
4. Write a README stub (full README lands in M9).
5. `git add -A`, run `git status --short`, confirm neither ignored path is listed, then make the first commit.
6. `gh repo create debug-cli/clirip --public --source . --remote origin --description "Multi-engine terminal media downloader"` and push `main`. Verified flags: `--public`, `--source`, `--remote` (implied by `--source`), `-d/--description`. Source: `gh repo create --help`. If `gh` is missing or not signed in, print the exact commands for the owner and keep building locally. Never write tokens to any file.

### 2.1 .gitignore (exact)

```
node_modules/
dist/
coverage/
*.tsbuildinfo
*.log
.env
.env.*
.DS_Store
.freebuff
cli-rip_enhanced-prompt-v1.md
```

### 2.2 Standing rules

- The prompt file stays on disk. Git never tracks it. Neither does git track `.freebuff`.
- If either path was ever staged: `git rm --cached <path>`, log a ruling, amend nothing already pushed.
- `package.json` sets `"files": ["dist", "README.md"]`. Neither ignored path appears in the npm package. Check with `npm pack --dry-run`.
- Push to `origin main` at the end of M0 and at the end of every milestone. Standing approval for those pushes. No force pushes. No `npm publish`.
- Docs hosting: `docs/index.html` is GitHub Pages ready (source `main`, folder `/docs`). Do not enable Pages. Print the three steps for the owner at the end of M10. Add the Pages URL to the README only after the owner confirms it is live.

### 2.3 README.md final content (M9)

1. Title, one-line description, credit line: UI modeled on yoinks by Pablo Stanley.
2. A real text transcript of one successful run, pasted from actual output.
3. Install: `npm install -g clirip` and `npx clirip`. Requirements: Node 18+.
4. Engines table: engine, what it handles, what it needs installed.
5. Routing table from section 5 below.
6. Flags (copied from `clirip --help`), config file keys, environment variables.
7. Keys and mouse.
8. Files written: `~/.clirip/` layout and output folder rules.
9. Development: install, build, test, typecheck commands.
10. Link to `docs/index.html`.
11. Legal line: download only content you have the right to save.

Every command in the README runs as written. Run each one and log the result.

## 3. State machine

States: `input`, `probing`, `picking`, `downloading`, `done`, `error`, plus `history` reached from `input` and from the `--history` flag.

| From | Event | To |
|---|---|---|
| input | Enter on valid URL | probing |
| probing | probe ok | picking (skip to downloading when `--audio-only`) |
| probing | probe fails, fallback exists | probing with fallback engine |
| probing | probe fails, no fallback | error |
| picking | Enter on format | downloading |
| picking | Esc | input |
| downloading | success | done |
| downloading | failure | error |
| any | click logo | input |
| error | Back | input |
| input | H or footer click | history |

Controls: up/down, j/k, or number keys to pick. Enter confirms. Esc goes back. Ctrl+C quits. Ctrl+T cycles theme. On exit, print saved paths to stdout, one per line.

Terminal handling: enter the alternate screen on start and leave it on every exit path including SIGINT, SIGTERM, and uncaught exceptions. Enable mouse reporting on start and disable it on exit. Restore the cursor.

## 4. Routing (`src/lib/platforms.ts`)

Pure function `route(url, config) => { primary: EngineId, fallbacks: EngineId[] }`. Unit test every row.

| URL pattern | Primary | Fallback |
|---|---|---|
| tiktok.com/*/photo/* | gallery-dl | cobalt |
| tiktok.com/* (video) | cobalt | yt-dlp |
| instagram.com/* | cobalt | yt-dlp |
| youtube.com/*, youtu.be/* | yt-dlp | newpipe |
| x.com/*, twitter.com/* | cobalt | yt-dlp |
| reddit.com/* | cobalt | yt-dlp |
| soundcloud.com/* | cobalt | yt-dlp |
| anything else | yt-dlp | none |

Modifiers, applied in order:
1. Drop any engine not configured or not available (cobalt without an instance, gallery-dl not installed, newpipe without Java).
2. Privacy Mode on and the host is YouTube: newpipe first, yt-dlp as fallback.
3. A manual engine choice from the segmented control or `--engine` replaces the primary and keeps yt-dlp as the only fallback.

Show the chosen engine on the input screen before probing starts.

## 5. CLI surface

```
clirip [URL]
clirip --theme auto|light|dark
clirip --engine yt-dlp|cobalt|gallery-dl|newpipe
clirip --cobalt-api <url>
clirip --audio-only
clirip --output <dir>        default ~/Downloads
clirip --no-watermark        applies only where the engine supports it
clirip --history
```

Config precedence: flag, then environment, then `~/.clirip/config.json`, then default. Unknown flags print usage and exit 2.

## 6. Acceptance criteria (every one needs a test or a scripted check)

- AC-1: `route()` returns the section 4 table for 12 sample URLs, including drop-unavailable and Privacy Mode cases.
- AC-2: With the fake engine, the app moves input, probing, picking, downloading, done and prints the saved path on exit.
- AC-3: A failing primary engine triggers the fallback and the UI shows the fallback label.
- AC-4: An engine failure shows only `userMessage` on the error screen. No stack trace appears.
- AC-5: Ctrl+C and a thrown error both restore the terminal (alt screen off, mouse off, cursor on).
- AC-6: yt-dlp fixture JSON produces a scored format list with h264 ranked above av1 and vp9 at equal height.
- AC-7: `--audio-only` skips `picking` and yields an `.mp3`.
- AC-8: The yt-dlp installer rejects a binary whose SHA-256 does not match.
- AC-9: cobalt with no configured instance is skipped by routing and the UI shows the hint.
- AC-10: A gallery-dl TikTok photo fixture yields the preview text and a `tiktok_<postId>/` folder with numbered files.
- AC-11: History persists across runs, caps at 500, and survives a corrupt file by resetting it.
- AC-12: A click inside a registered rectangle fires its handler. A click outside fires nothing.
- AC-13: Theme cycles auto, light, dark on Ctrl+T and by footer click, and `--theme` sets the start value.
- AC-14: `npm pack` produces a package. `npx` runs it from a clean directory.
- AC-15: `git check-ignore -v` matches `.freebuff` and `cli-rip_enhanced-prompt-v1.md`. `git ls-files` lists neither. `npm pack --dry-run` lists neither.
- AC-16: A remote named `origin` points to `github.com/debug-cli/clirip`, or the plan log holds the printed fallback commands.
- AC-17: README has all eleven items in section 2.3. Every command in it was run and logged.
- AC-18: `docs/index.html` is one file with no external requests. A script finds no `http` in any `src`, `href` on a `link` tag, `@import`, or `url()`. Plain anchor links to GitHub are allowed.
- AC-19: The docs page shows all content with JavaScript disabled. JavaScript adds copy buttons, scroll tracking, and theme switching only.
- AC-20: Every nav anchor resolves to exactly one id. No duplicate ids. Every flag in `clirip --help` appears in the docs, and every documented flag exists.
- AC-21: Body text and secondary text pass WCAG AA contrast in every docs theme. The script output is logged.
- AC-22: `T` cycles docs themes. Focus is visible on every control. Reduced-motion users get no animation. No horizontal page scroll at 375, 768, and 1280 pixel widths.
- AC-23: The ASCII wordmark rows all have equal length, checked by script, and the same art is in `src/lib/logo.ts` and `docs/index.html`.
- AC-24: Routing and engine tables in the docs match `platforms.ts` test cases row for row.

Tests never touch the network. Engines are tested against fixtures and a mocked process runner.

## 7. Docs page spec (`docs/index.html`)

Structural contract kept from the DOSping reference (structure and depth only, no text, no grey palette, no `>` / `$` heading markers, no Google Fonts import, no DOSping content):
- Fixed left sidebar: logo box, grouped links with small group labels, footer line with the version from `package.json`.
- Scroll tracking marks the current section in the sidebar.
- Main column of numbered sections, each with an id.
- Code blocks with a copy button.
- Three callout kinds: warning, info, note.
- Tables, ordered lists, ASCII diagrams with highlighted and dimmed spans.
- Troubleshooting and changelog at the end.

### 7.1 Visual language (ASCII theme)

- Read omarchy.us for traits only. Never copy its code, copy, logo, or images. Traits: monospace first, hairline borders on a character grid, block-character bars and sparklines inside code blocks, semantic terminal colors, a theme key restyling the whole page, keyboard hints in a status line.
- No DOSping greys. No Omarchy default Tokyo Night blues and purples. No gradients behind text, no glow, no glass.
- Block-character wordmark for CLIrip in the sidebar and at the top of the page. Same art as the TUI logo.
- Box-drawing frames for callouts. Block-character bars for download progress and format sizes in examples.
- Section headings carry a zero-padded index gutter (01, 02, ...). Subheadings carry a short horizontal rule glyph.
- Bottom status line fixed to the viewport: current theme name, current section id, key hints (`T` theme, `/` filter nav, `?` keys).
- Three or more themes. Default dark. One light. One more dark in a different hue family. `T` cycles them. First visit follows `prefers-color-scheme`. Choice persists in localStorage inside try and catch.

### 7.2 Default theme tokens (theme `moss`)

| Token | Value | Use |
|---|---|---|
| --bg | #0f1210 | page |
| --surface | #151a17 | sidebar, code blocks |
| --line | #232b26 | hairlines |
| --text | #a9b5ad | body |
| --dim | #7c8981 | secondary text |
| --bright | #dfe6e1 | headings |
| --accent | #e8643c | links, active nav, one highlight per view |
| --ok | #7fb069 | success |
| --warn | #e0b04a | warnings |
| --err | #e05a5a | errors |

Faint tones are for borders and decoration only, never for text. Full three-theme token sets with computed contrast ratios live in `plan/DESIGN.md`.

### 7.3 Type

System monospace stack only: `ui-monospace, "JetBrains Mono", "Cascadia Code", "SF Mono", Menlo, Consolas, monospace`. No web font requests. Base 14px, line height 1.7, measure under 80 characters in the main column.

### 7.4 Dials

`DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 5`. Design Read line at the top of `plan/DESIGN.md`.

### 7.5 Motion and content rules

- No emoji. No decorative animation. Allowed motion: smooth anchor scroll, a short theme color transition, a copy-button state change. All off under `prefers-reduced-motion`.
- Spartan tone. Short sentences. Active voice. Every claim comes from the built tool or its tests.
- Real captured output in code blocks (`clirip --help`, a real probe summary, a real done screen). No hand-built fake screenshots made from divs. ASCII diagrams are fine.

### 7.6 Required sections (sidebar grouping)

- start: disclaimer, quick start, manual install
- concepts: what is CLIrip, architecture (state machine as ASCII diagram), engine routing (table plus flow diagram)
- interface: input screen, format picker, downloading, done and error, history, keys and mouse, themes
- engines: yt-dlp, cobalt (instance, API key, options), gallery-dl (TikTok slideshows, folder layout), NewPipe (Privacy Mode, Java, shim)
- reference: CLI flags, configuration and precedence, output and files, dependencies and where they live, project files (tree), troubleshooting, changelog

Disclaimer states: download only content you have the right to save, and follow each site's terms.

Troubleshooting covers at least: yt-dlp download or checksum failure, ffmpeg missing, cobalt auth error or no instance, gallery-dl missing, Java missing for NewPipe, terminal not restored after a crash, mouse not responding.

### 7.7 Technical rules

- One file, inline CSS and JS, no build step, no external requests, under 300 KB.
- Semantic HTML: one `h1`, `nav`, `main`, `h2` per section with an id, `h3` for subsections, real `table` elements, `pre` and `code` for code.
- Sidebar becomes a collapsible top bar under 860px, with a button operable from the keyboard.
- Scroll tracking uses IntersectionObserver. Copy buttons use `navigator.clipboard` with a textarea fallback.
- The ASCII wordmark has `aria-label="CLIrip"`, the art itself `aria-hidden="true"`.
- Build in pieces: shell and tokens first, then components, then content in batches of three or four sections, then checks. Append each batch to the same file.
- Load the design-taste-frontend skill before any docs task. If one of its rules conflicts with this contract, the contract wins. Log a ruling.
