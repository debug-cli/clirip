# CLIrip DESIGN (design-taste-frontend)

## Design Read

Reading this as: a documentation and reference page for a terminal tool, for CLI users and contributors, with a monospace-first ASCII-terminal language, leaning toward native CSS with semantic tokens and near-zero motion.

## Dials

| Dial | Value | Reason |
|---|---|---|
| DESIGN_VARIANCE | 5 | Fixed sidebar plus numbered-section grid is the contract; asymmetry lives in the index gutter, callout frames and block bars, not in the page skeleton. |
| MOTION_INTENSITY | 3 | Section 12 allows only smooth anchor scroll, a theme color transition, and a copy-button state change, all off under reduced motion. Skill rule "motion claimed = motion shown" is satisfied at 3 with `:hover` / `:active` states only. |
| VISUAL_DENSITY | 5 | Reference-table density: 14px / 1.7, measure under 80ch, hairlines instead of cards. |

Skill rulings (contract wins, logged in `plan/ledger.md`):
1. Skill prefers a real design system or a React/Tailwind stack. Contract mandates one framework-free HTML file with no external requests. Contract wins, native CSS.
2. Skill ships dual-mode light/dark by default. Contract mandates three themes with `T` cycling and `prefers-color-scheme` on first visit. Contract wins, contrast verified per theme.
3. Skill caps eyebrows at one per three sections. Contract requires a zero-padded index gutter on every `h2`. The gutter is a structural index, not a marketing eyebrow. Allowed as the contract defines it.
4. Section-tinting guidance applies within one theme only. No mid-page theme flips.

## Themes

One theme at a time, applied to `<html data-theme>`. Every section uses the same tokens. No section inverts.

### moss (default dark, green-grey neutrals)

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

### paper (light, cool neutral)

| Token | Value | Use |
|---|---|---|
| --bg | #f4f5f7 | page |
| --surface | #e9ebef | sidebar, code blocks |
| --line | #d2d6dd | hairlines |
| --text | #262b31 | body |
| --dim | #4d555e | secondary text |
| --bright | #0d1117 | headings |
| --accent | #b1451f | links, active nav, one highlight per view |
| --ok | #2f6b33 | success |
| --warn | #7a5b12 | warnings |
| --err | #a32424 | errors |

### ember (dark, warm hue family)

| Token | Value | Use |
|---|---|---|
| --bg | #171310 | page |
| --surface | #1e1915 | sidebar, code blocks |
| --line | #332b24 | hairlines |
| --text | #cabfb2 | body |
| --dim | #97897b | secondary text |
| --bright | #f4ece2 | headings |
| --accent | #ff9d3d | links, active nav, one highlight per view |
| --ok | #9ec96f | success |
| --warn | #f2d14c | warnings |
| --err | #e06a5a | errors |

### Contrast ratios (WCAG 2.1, computed: `(L1+0.05)/(L2+0.05)`)

Ratio on `--bg` / on `--surface`. Threshold: 4.5:1 minimum for text tokens.

| Token | moss bg | moss surface | paper bg | paper surface | ember bg | ember surface |
|---|---|---|---|---|---|---|
| --text | 8.88 | 8.31 | 13.08 | 11.95 | 10.21 | 9.63 |
| --dim | 5.16 | 4.83 | 6.93 | 6.34 | 5.44 | 5.13 |
| --bright | 14.85 | 13.88 | 17.35 | 15.86 | 15.78 | 14.89 |
| --accent | 5.67 | 5.30 | 5.15 | 4.70 | 8.92 | 8.42 |
| --ok | 7.46 | 6.98 | 5.88 | 5.38 | 9.71 | 9.16 |
| --warn | 9.40 | 8.79 | 5.78 | 5.28 | 12.31 | 11.62 |
| --err | 5.19 | 4.85 | 6.79 | 6.21 | 5.61 | 5.29 |

All 42 ratios pass AA (4.5:1). `--line` is a border token and is never used for text. Script output re-verified by task D08.

## Type scale

Stack: `ui-monospace, "JetBrains Mono", "Cascadia Code", "SF Mono", Menlo, Consolas, monospace`. No web font requests.

| Role | Size | Weight | Line height | Notes |
|---|---|---|---|---|
| h1 (page title next to wordmark) | 24px | 700 | 1.3 | one per page |
| h2 (section) | 17px | 700 | 1.4 | carries `01` index gutter in `--dim` |
| h3 (subsection) | 14px | 700 | 1.5 | preceded by `──` glyph in `--line` |
| body | 14px | 400 | 1.7 | measure under 80ch |
| code / pre | 13px | 400 | 1.6 | |
| table | 13px | 400 | 1.6 | |
| sidebar link | 13px | 400 | 1.6 | active: `--accent` + left hairline |
| group label, status line | 11px | 700 | 1.4 | uppercase, tracking 0.14em |

## Components

1. Sidebar: logo box, group labels, links, version footer (version read from `package.json` at build time by the D task).
2. Nav group label (`start`, `concepts`, `interface`, `engines`, `reference`).
3. Section heading with zero-padded index gutter.
4. Subheading with `──` rule glyph.
5. Code block with copy button (hover reveal, always visible on focus).
6. Callout, three kinds: warning (`--warn` left frame), info (`--dim`), note (`--accent`). Box-drawing frame `┌ ┐ └ ┘`.
7. Table: hairline rows, uppercase header in `--dim`.
8. ASCII diagram block: `--accent` spans (`.hl`) and `--dim` spans (`.dim`), `white-space: pre`.
9. Block-character bar: `█` repeated for progress and format sizes, filled run in `--accent`, remainder in `--line`.
10. Wordmark (sidebar + page top).
11. Status line (fixed bottom).
12. Mobile top bar with a keyboard-operable toggle (under 860px).
13. Nav filter input (opened with `/`).
14. Keys overlay (opened with `?`).

Corner-radius system: radius 0 everywhere. Sharp corners match the character grid.

## Wordmark

Five rows, every row exactly 47 characters (checked by script in tasks T06 and D09):

```
 █████  ██      ███████ ██████  ███████ ██████ 
██      ██         ██   ██   ██    ██   ██   ██
██      ██         ██   ██████     ██   ██████ 
██      ██         ██   ██  ██     ██   ██     
 █████  ███████ ███████ ██   ██ ███████ ██     
```

Rendering rules: `<span class="wordmark" aria-label="CLIrip"><span aria-hidden="true">…rows…</span></span>` in the docs; `aria-hidden` art in the TUI is not applicable (TUI has no accessibility tree), so `logo.ts` exports the same five strings. Color: `--bright`, with the trailing `RIP` letters (` columns 31-47`) in `--accent`. No other accent use in the logo box.

## Section and id map (24 sections)

| Group | Label | id |
|---|---|---|
| start | Disclaimer | `#disclaimer` |
| start | Quick start | `#quickstart` |
| start | Manual install | `#manual-install` |
| concepts | What is CLIrip | `#overview` |
| concepts | Architecture | `#architecture` |
| concepts | Engine routing | `#routing` |
| interface | Input screen | `#input-screen` |
| interface | Format picker | `#format-picker` |
| interface | Downloading | `#downloading` |
| interface | Done and error | `#done-error` |
| interface | History | `#history` |
| interface | Keys and mouse | `#keys-mouse` |
| interface | Themes | `#themes` |
| engines | yt-dlp | `#ytdlp` |
| engines | cobalt | `#cobalt` |
| engines | gallery-dl | `#gallery-dl` |
| engines | NewPipe | `#newpipe` |
| reference | CLI flags | `#flags` |
| reference | Configuration | `#configuration` |
| reference | Output and files | `#output-files` |
| reference | Dependencies | `#dependencies` |
| reference | Project files | `#project-files` |
| reference | Troubleshooting | `#troubleshooting` |
| reference | Changelog | `#changelog` |

Index gutter runs `01` to `24` in the order above. Each id appears exactly once; task D08 fails the build on duplicates.

## Status line behavior

Fixed to the viewport bottom, one row, 11px uppercase, `--dim` text on `--bg`, top hairline in `--line`.

- Left: current theme name (`moss` / `paper` / `ember`), updated after every `T` press.
- Center: current section id without the hash (for example `format-picker`), updated by the same IntersectionObserver that marks the sidebar link active.
- Right: key hints `T theme` `? keys` `slash filter`. Written as `T theme` etc, no `·` separators, no dots.

It is informational, not a live region: no `aria-live`, so screen readers are not spammed on every scroll. Hidden from view under 640px to keep the reading column clear, but the key bindings still work.

## Content and motion notes for D tasks

- Zero em-dashes and zero en-dashes anywhere. Hyphen only.
- No emoji. No scroll cues. No section-number eyebrows beyond the contract's index gutter. No locale, weather or version strips.
- One accent per theme, used identically in every section.
- Real captured output in code blocks only. No div-built fake screenshots.
- Motion allowed: anchor scroll, theme transition (color, 120ms), copy-button state change. All wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Dark mode: two of three themes are dark by contract, and the light theme is a full peer, so both light and dark are covered by construction.
