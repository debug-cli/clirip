import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ERROR_LOG_NAME = 'last-error.log';

export function errorLogPath(dir: string): string {
  return join(dir, ERROR_LOG_NAME);
}

// Writes the raw message and stack, which the UI never shows. The write is a temp
// file plus a rename so a crash mid-write cannot leave a half-written log.
export function recordError(error: unknown, dir: string): void {
  const target = errorLogPath(dir);
  const body =
    error instanceof Error
      ? `${error.message}\n${error.stack ?? ''}\n`
      : `${String(error)}\n`;

  const temp = `${target}.${process.pid}.tmp`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(temp, `${new Date().toISOString()}\n${body}`, { mode: 0o600 });
  renameSync(temp, target);
}
