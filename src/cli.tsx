import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseArgs } from './lib/parse-args';

export type { CliArgs } from './lib/parse-args';

export const ALTERNATE_SCREEN_ENTER = '\x1b[?1049h\x1b[?25l';
export const ALTERNATE_SCREEN_EXIT = '\x1b[?1049l\x1b[?25h';

// Enters the alternate screen and hides the cursor, and returns the one teardown
// that undoes both. The guard makes the teardown idempotent so every exit path can
// call it without printing a second escape.
export function setupTerminal(): () => void {
  process.stdout.write(ALTERNATE_SCREEN_ENTER);

  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    process.stdout.write(ALTERNATE_SCREEN_EXIT);
  };
}

export async function main(argv: string[]): Promise<number> {
  try {
    parseArgs(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 2;
  }

  const teardown = setupTerminal();

  const quit = (code: number): void => {
    teardown();
    process.exit(code);
  };

  process.on('SIGINT', () => quit(130));
  process.on('SIGTERM', () => quit(143));
  process.on('uncaughtException', () => quit(1));
  process.on('unhandledRejection', () => quit(1));

  // T10 renders the app here. Until then the entry proves the lifecycle and leaves.
  teardown();
  return 0;
}

// Running the built binary must start the app; importing this module from a test
// must not. tsup bundles to dist/cli.js, where both paths resolve to the same file.
function isEntryPoint(): boolean {
  const script = process.argv[1];
  if (script === undefined) return false;
  try {
    return realpathSync(script) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  void main(process.argv.slice(2)).then((code) => {
    if (code !== 0) process.exit(code);
  });
}
