import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { WORDMARK, WORDMARK_WIDTH } from '../src/lib/logo';

describe('wordmark (AC-23)', () => {
  it('has five rows', () => {
    expect(WORDMARK).toHaveLength(5);
  });

  it('draws every row at the same width and nothing else', () => {
    // Printed so the ledger can quote the measured lengths.
    console.log('wordmark row lengths:', WORDMARK.map((row) => row.length).join(', '));

    for (const row of WORDMARK) {
      expect(row.length).toBe(WORDMARK_WIDTH);
      expect(row).toMatch(/^[█ ]+$/);
    }
  });

  it('declares a width that matches the art', () => {
    expect(WORDMARK_WIDTH).toBe(47);
  });

  it('matches the art in plan/DESIGN.md row for row', () => {
    const design = readFileSync(new URL('../plan/DESIGN.md', import.meta.url), 'utf8');
    const block = design.match(/## Wordmark[\s\S]*?```\n([\s\S]*?)```/);
    expect(block).not.toBeNull();

    const rows = (block?.[1] ?? '')
      .split('\n')
      .filter((row) => row.length > 0);

    expect([...WORDMARK]).toEqual(rows);
  });
});
