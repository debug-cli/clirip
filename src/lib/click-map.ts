export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
}

export interface MouseEvent {
  x: number;
  y: number;
  button: string;
  action: 'press' | 'release';
}

export const MOUSE_ENABLE = '\x1b[?1002h\x1b[?1006h';
export const MOUSE_DISABLE = '\x1b[?1002l\x1b[?1006l';

// ESC [ < btn ; col ; row (M|m). Columns and rows from the terminal are 1-based.
const SGR = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/;

export function parseSGR(buffer: string): MouseEvent | null {
  const match = SGR.exec(buffer);
  if (match === null) {
    return null;
  }

  const [, button, column, row, terminator] = match;
  if (button === undefined || column === undefined || row === undefined || terminator === undefined) {
    return null;
  }

  return {
    x: Number(column) - 1,
    y: Number(row) - 1,
    button,
    action: terminator === 'M' ? 'press' : 'release',
  };
}

// Turns one stdin chunk into the id of the rectangle that was clicked, or null when
// the chunk is not a mouse press or lands on nothing.
export function resolveMouseChunk(buffer: string, map: ClickMap): string | null {
  const event = parseSGR(buffer);
  if (event === null || event.action !== 'press') {
    return null;
  }
  return map.hit(event.x, event.y);
}

export class ClickMap {
  private readonly rects = new Map<string, Rect>();

  // Registering the same id again replaces it, so a component may re-register on
  // every render without piling up duplicates.
  add(id: string, rect: Rect): void {
    this.rects.set(id, { ...rect, id });
  }

  // Last registered wins, so a small target drawn over a large one takes the click.
  hit(x: number, y: number): string | null {
    let found: string | null = null;

    for (const rect of this.rects.values()) {
      if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) {
        found = rect.id;
      }
    }

    return found;
  }
}
