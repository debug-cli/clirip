import { Text, useStdin } from 'ink';
import { render } from 'ink-testing-library';
import { createElement, useRef } from 'react';
import { describe, expect, it } from 'vitest';

import {
  ClickMap,
  MOUSE_DISABLE,
  MOUSE_ENABLE,
  parseSGR,
  resolveMouseChunk,
  type Rect,
} from '../src/lib/click-map';
import { useMouseClick } from '../src/lib/use-mouse-click';

// Two rectangles that do not overlap, so a miss is a real miss.
const LOGO: Rect = { x: 1, y: 1, w: 20, h: 4, id: 'logo' };
const ROW: Rect = { x: 10, y: 5, w: 10, h: 1, id: 'row-2' };

function mapWithRects(): ClickMap {
  const map = new ClickMap();
  map.add(LOGO.id, LOGO);
  map.add(ROW.id, ROW);
  return map;
}

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('parseSGR', () => {
  it('converts 1-based terminal coordinates to 0-based cells', () => {
    expect(parseSGR('\x1b[<0;10;5M')).toEqual({ x: 9, y: 4, button: '0', action: 'press' });
  });

  it('reads a release as a release', () => {
    expect(parseSGR('\x1b[<0;10;5m')).toEqual({ x: 9, y: 4, button: '0', action: 'release' });
  });

  it('returns null for anything that is not a mouse sequence', () => {
    expect(parseSGR('j')).toBeNull();
    expect(parseSGR('\u001B[A')).toBeNull();
    expect(parseSGR('')).toBeNull();
  });
});

describe('ClickMap', () => {
  it('returns the id of the rectangle under the point', () => {
    expect(mapWithRects().hit(10, 5)).toBe('row-2');
  });

  it('returns null outside every rectangle', () => {
    expect(mapWithRects().hit(200, 90)).toBeNull();
  });

  it('treats the right and bottom edges as outside', () => {
    const map = mapWithRects();

    expect(map.hit(19, 5)).toBe('row-2');
    expect(map.hit(20, 5)).toBeNull();
    expect(map.hit(10, 6)).toBeNull();
  });

  it('lets a later registration of the same id replace the earlier one', () => {
    const map = mapWithRects();
    map.add('row-2', { x: 30, y: 9, w: 4, h: 1, id: 'row-2' });

    expect(map.hit(10, 5)).toBeNull();
    expect(map.hit(31, 9)).toBe('row-2');
  });

  it('lets a small target registered last win over a large one under it', () => {
    const map = mapWithRects();
    map.add('logo-badge', { x: 3, y: 2, w: 2, h: 1, id: 'logo-badge' });

    expect(map.hit(3, 2)).toBe('logo-badge');
    expect(map.hit(5, 2)).toBe('logo');
  });

  it('ignores a release and a click that lands on nothing', () => {
    const map = mapWithRects();

    expect(resolveMouseChunk('\x1b[<0;3;2m', map)).toBeNull();
    expect(resolveMouseChunk('\x1b[<0;200;90M', map)).toBeNull();
  });
});

describe('useMouseClick', () => {
  function Probe({ onHit }: { onHit: (id: string) => void }) {
    const map = useRef(mapWithRects()).current;
    useMouseClick(map, onHit);
    return createElement(Text, null, 'probe');
  }

  it('fires the logo handler for a click inside the logo rectangle', async () => {
    const hits: string[] = [];
    const instance = render(createElement(Probe, { onHit: (id: string) => hits.push(id) }));
    await tick(30);

    instance.stdin.write('\x1b[<0;3;2M');
    await tick(20);

    expect(hits).toEqual(['logo']);
    instance.unmount();
  });

  it('fires the row handler for a click inside a list row', async () => {
    const hits: string[] = [];
    const instance = render(createElement(Probe, { onHit: (id: string) => hits.push(id) }));
    await tick(30);

    instance.stdin.write('\x1b[<0;12;6M');
    await tick(20);

    expect(hits).toEqual(['row-2']);
    instance.unmount();
  });

  it('fires nothing for a click outside every rectangle or for a release', async () => {
    const hits: string[] = [];
    const instance = render(createElement(Probe, { onHit: (id: string) => hits.push(id) }));
    await tick(30);

    instance.stdin.write('\x1b[<0;80;40M');
    instance.stdin.write('\x1b[<0;3;2m');
    await tick(20);

    expect(hits).toEqual([]);
    instance.unmount();
  });

  it('enables mouse reporting on mount and disables it on unmount', async () => {
    const instance = render(createElement(Probe, { onHit: () => {} }));
    await tick(30);

    expect(instance.stdout.frames.join('')).toContain(MOUSE_ENABLE);

    instance.unmount();
    await tick(20);

    expect(instance.stdout.frames.join('')).toContain(MOUSE_DISABLE);
  });

  it('reports the raw mode flag the hook guards on', async () => {
    function RawProbe() {
      return createElement(Text, null, `raw=${String(useStdin().isRawModeSupported)}`);
    }

    const instance = render(createElement(RawProbe));
    await tick(20);

    expect(instance.lastFrame()).toContain('raw=true');
    instance.unmount();
  });
});
