// TUI colour tokens. The docs page themes in plan/DESIGN.md are unrelated to these.
// Tokens are bare hex so Ink (via chalk) can accept them for color and backgroundColor.

export type ThemeName = 'auto' | 'light' | 'dark';

export interface ThemeTokens {
  bg: string;
  surface: string;
  line: string;
  text: string;
  dim: string;
  bright: string;
  accent: string;
  ok: string;
  warn: string;
  err: string;
}

export const themes: Record<'light' | 'dark', ThemeTokens> = {
  light: {
    bg: '#f4f5f7',
    surface: '#e9ebef',
    line: '#d2d6dd',
    text: '#262b31',
    dim: '#4d555e',
    bright: '#0d1117',
    accent: '#b1451f',
    ok: '#2f6b33',
    warn: '#7a5b12',
    err: '#a32424',
  },
  dark: {
    bg: '#0f1210',
    surface: '#151a17',
    line: '#232b26',
    text: '#a9b5ad',
    dim: '#7c8981',
    bright: '#dfe6e1',
    accent: '#e8643c',
    ok: '#7fb069',
    warn: '#e0b04a',
    err: '#e05a5a',
  },
};

const CYCLE: readonly ThemeName[] = ['auto', 'light', 'dark'];

export function resolveTheme(name: ThemeName, isDarkTerminal: boolean): 'light' | 'dark' {
  if (name === 'auto') {
    return isDarkTerminal ? 'dark' : 'light';
  }
  return name;
}

export function nextTheme(name: ThemeName): ThemeName {
  const index = CYCLE.indexOf(name);
  return CYCLE[(index + 1) % CYCLE.length] ?? 'auto';
}
