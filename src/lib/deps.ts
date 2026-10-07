import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';

import ffmpegStaticPath from 'ffmpeg-static';

export type DepName = 'yt-dlp' | 'ffmpeg' | 'gallery-dl' | 'java';

export interface DepInfo {
  name: string;
  path?: string;
  version?: string;
  ok: boolean;
  reason?: string;
}

export interface RunOutput {
  stdout: string;
  stderr: string;
}

// Injected so tests never spawn a process and never touch the network.
export type Runner = (file: string, args: string[]) => Promise<RunOutput>;

export const DEP_NAMES: readonly DepName[] = ['yt-dlp', 'ffmpeg', 'gallery-dl', 'java'];

export const NOT_INSTALLED = 'not installed';

const VERSION_ARGS: Record<DepName, string[]> = {
  'yt-dlp': ['--version'],
  ffmpeg: ['-version'],
  'gallery-dl': ['--version'],
  java: ['-version'],
};

// Argument array only. Nothing here is ever handed to a shell.
export const runProcess: Runner = (file, args) =>
  new Promise((resolve, reject) => {
    execFile(file, args, { timeout: 10_000, windowsHide: true }, (error, stdout, stderr) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });

function firstLine(text: string): string | undefined {
  return text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}

function extractVersion(name: DepName, output: string): string | undefined {
  switch (name) {
    case 'ffmpeg':
      return /ffmpeg version (\S+)/.exec(output)?.[1] ?? firstLine(output);
    case 'java':
      return /version "([^"]+)"/.exec(output)?.[1] ?? firstLine(output);
    default:
      return firstLine(output);
  }
}

function failureReason(error: unknown): string {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  if (code === 'ENOENT') {
    return NOT_INSTALLED;
  }
  if (code === 'EACCES') {
    return 'not executable';
  }
  const message = firstLine(error instanceof Error ? error.message : String(error));
  return message ?? NOT_INSTALLED;
}

async function probeBinary(name: DepName, file: string, runner: Runner): Promise<DepInfo> {
  try {
    const { stdout, stderr } = await runner(file, VERSION_ARGS[name]);
    const version = extractVersion(name, `${stdout}\n${stderr}`);

    if (version === undefined) {
      return { name, path: file, ok: false, reason: 'could not read a version' };
    }

    return { name, path: file, version, ok: true };
  } catch (error) {
    return { name, ok: false, reason: failureReason(error) };
  }
}

export async function findDep(name: DepName, runner: Runner = runProcess): Promise<DepInfo> {
  // The bundled ffmpeg ships inside the package, so it is preferred over PATH and
  // does not depend on the user having installed one.
  if (name === 'ffmpeg' && ffmpegStaticPath !== null && existsSync(ffmpegStaticPath)) {
    const bundled = await probeBinary(name, ffmpegStaticPath, runner);
    if (bundled.ok) {
      return bundled;
    }
  }

  return probeBinary(name, name, runner);
}

export async function checkAll(runner: Runner = runProcess): Promise<Record<string, DepInfo>> {
  const found = await Promise.all(DEP_NAMES.map(async (name) => [name, await findDep(name, runner)] as const));
  return Object.fromEntries(found);
}
