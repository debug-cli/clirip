import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

const root = new URL('..', import.meta.url);
const PROTECTED = ['cli-rip_enhanced-prompt-v1.md', '.freebuff'];

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

describe('protected paths (AC-15)', () => {
  it.each(PROTECTED)('ignores %s and prints the matching rule', (path) => {
    // execFileSync throws on a non-zero exit, so an unmatched path fails here.
    const out = git(['check-ignore', '-v', path]);

    expect(out).toContain(path);
    expect(out.split('\t').length).toBeGreaterThan(1);
  });

  it('tracks neither protected path in the index', () => {
    const tracked = git(['ls-files']).split('\n');

    for (const path of PROTECTED) {
      expect(tracked).not.toContain(path);
    }
  });
});
