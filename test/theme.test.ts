import { describe, expect, it } from 'vitest';

import { nextTheme, resolveTheme, themes, type ThemeName } from '../src/theme';

const NAMES: ThemeName[] = ['auto', 'light', 'dark'];

describe('theme cycle (AC-13)', () => {
  it('advances auto -> light -> dark -> auto', () => {
    expect(nextTheme('auto')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('auto');
  });

  it('returns to the starting name after three steps from every entry point', () => {
    for (const name of NAMES) {
      expect(nextTheme(nextTheme(nextTheme(name)))).toBe(name);
    }
  });

  it('never leaves the theme union', () => {
    for (const name of NAMES) {
      expect(NAMES).toContain(nextTheme(name));
    }
  });
});

describe('theme resolution', () => {
  it('follows the terminal when the name is auto', () => {
    expect(resolveTheme('auto', true)).toBe('dark');
    expect(resolveTheme('auto', false)).toBe('light');
    expect(themes[resolveTheme('auto', true)]).toBe(themes.dark);
  });

  it('honours an explicit name regardless of the terminal', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('token sets', () => {
  it('defines all ten tokens in both sets as 6-digit hex', () => {
    const keys: (keyof (typeof themes)['light'])[] = [
      'bg',
      'surface',
      'line',
      'text',
      'dim',
      'bright',
      'accent',
      'ok',
      'warn',
      'err',
    ];

    for (const mode of ['light', 'dark'] as const) {
      expect(Object.keys(themes[mode]).sort()).toEqual([...keys].sort());
      for (const key of keys) {
        expect(themes[mode][key]).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});
