import type { EngineId } from '../types';

export interface CliArgs {
  url?: string;
  theme?: 'auto' | 'light' | 'dark';
  engine?: EngineId;
  cobaltApi?: string;
  audioOnly?: boolean;
  output?: string;
  noWatermark?: boolean;
  history?: boolean;
}

export const USAGE = [
  'Usage: clirip [URL] [options]',
  '',
  '  --theme auto|light|dark',
  '  --engine yt-dlp|cobalt|gallery-dl|newpipe',
  '  --cobalt-api <url>',
  '  --audio-only',
  '  --output <dir>        default ~/Downloads',
  '  --no-watermark',
  '  --history',
].join('\n');

const THEMES = ['auto', 'light', 'dark'] as const;
const ENGINES: readonly EngineId[] = ['yt-dlp', 'cobalt', 'gallery-dl', 'newpipe'];

function fail(message: string): never {
  throw new Error(`${message}\n\n${USAGE}`);
}

// The value for a flag that takes one, or a throw naming that flag.
function valueOf(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    fail(`${flag} needs a value`);
  }
  return value;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === undefined) continue;

    switch (token) {
      case '--theme': {
        const value = valueOf(argv, index, '--theme');
        if (!(THEMES as readonly string[]).includes(value)) {
          fail(`--theme must be one of ${THEMES.join('|')}, got ${value}`);
        }
        args.theme = value as CliArgs['theme'];
        index += 1;
        break;
      }
      case '--engine': {
        const value = valueOf(argv, index, '--engine');
        if (!ENGINES.includes(value as EngineId)) {
          fail(`--engine must be one of ${ENGINES.join('|')}, got ${value}`);
        }
        args.engine = value as EngineId;
        index += 1;
        break;
      }
      case '--cobalt-api':
        args.cobaltApi = valueOf(argv, index, '--cobalt-api');
        index += 1;
        break;
      case '--output':
        args.output = valueOf(argv, index, '--output');
        index += 1;
        break;
      case '--audio-only':
        args.audioOnly = true;
        break;
      case '--no-watermark':
        args.noWatermark = true;
        break;
      case '--history':
        args.history = true;
        break;
      default:
        if (token.startsWith('-')) {
          fail(`Unknown option: ${token}`);
        }
        if (args.url === undefined) {
          args.url = token;
        } else {
          fail(`Unexpected argument: ${token}`);
        }
    }
  }

  return args;
}
