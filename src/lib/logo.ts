// The CLIrip wordmark: one source of truth, copied from plan/DESIGN.md.
// Five rows, every row exactly WORDMARK_WIDTH columns, block and space only.
// docs/index.html repeats these rows and test/docs/parity.mjs compares the two.

export const WORDMARK_WIDTH = 47;

export const WORDMARK: readonly string[] = [
  " █████  ██      ███████ ██████  ███████ ██████ ",
  "██      ██         ██   ██   ██    ██   ██   ██",
  "██      ██         ██   ██████     ██   ██████ ",
  "██      ██         ██   ██  ██     ██   ██     ",
  " █████  ███████ ███████ ██   ██ ███████ ██     ",
];
