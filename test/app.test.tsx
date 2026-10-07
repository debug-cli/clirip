import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { App, nextStatus, transitions, type Status } from '../src/app';
import { fake } from '../src/engines/fake';
import type { Engine } from '../src/types';
import type { CliArgs } from '../src/lib/parse-args';

const URL = 'https://example.test/watch?v=abc123';

type Instance = ReturnType<typeof render>;

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ink attaches its stdin 'readable' listener in a passive effect, so a write issued
// in the same tick as render() is dropped. Every mount waits for the effect first.
async function mount(engine: Engine, args: CliArgs): Promise<Instance> {
  const instance = render(<App engine={engine} args={args} />);
  await tick(30);
  return instance;
}

function written(instance: Instance): string {
  return `${instance.frames.join('\n')}\n${instance.lastFrame() ?? ''}`;
}

async function waitFor(instance: Instance, needles: string[], timeoutMs = 3000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const seen = written(instance);
    if (needles.every((needle) => seen.includes(needle))) {
      return;
    }
    if (Date.now() > deadline) {
      throw new Error(`never saw ${JSON.stringify(needles)}. Last frame:\n${instance.lastFrame() ?? ''}`);
    }
    await tick(5);
  }
}

describe('transition table (SPEC section 3)', () => {
  it('walks input to probing on submit and to history on H', () => {
    expect(transitions.input['submit']).toBe('probing');
    expect(transitions.input['history']).toBe('history');
  });

  it('walks probing to picking, stays on fallback, and fails to error', () => {
    expect(transitions.probing['probe-ok']).toBe('picking');
    expect(transitions.probing['probe-fail-fallback']).toBe('probing');
    expect(transitions.probing['probe-fail']).toBe('error');
  });

  it('walks picking to downloading on confirm and back to input on back', () => {
    expect(transitions.picking['confirm']).toBe('downloading');
    expect(transitions.picking['back']).toBe('input');
  });

  it('walks downloading to done on success and to error on failure', () => {
    expect(transitions.downloading['success']).toBe('done');
    expect(transitions.downloading['failure']).toBe('error');
  });

  it('returns to input on back from error', () => {
    expect(transitions.error['back']).toBe('input');
  });

  it('skips the picker under --audio-only', () => {
    expect(nextStatus('probing', 'probe-ok', { audioOnly: true })).toBe('downloading');
    expect(nextStatus('probing', 'probe-ok', {})).toBe('picking');
  });

  it('returns to input from every state on a wordmark click', () => {
    for (const status of Object.keys(transitions) as Status[]) {
      expect(nextStatus(status, 'logo', {})).toBe('input');
    }
  });
});

describe('app walk (AC-2)', () => {
  it('renders the input screen with the wordmark before anything is typed', async () => {
    const instance = await mount(fake, {});
    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('Paste a URL');
    expect(frame).toContain('██');

    instance.unmount();
  });

  it('walks input, probing, picking, downloading and done', async () => {
    const instance = await mount(fake, {});

    instance.stdin.write(URL);
    await tick(30);
    expect(instance.lastFrame()).toContain(URL);

    instance.stdin.write('\r');
    await waitFor(instance, ['Probing']);
    await waitFor(instance, ['Choose a format', '1080p h264']);

    instance.stdin.write('\r');
    await waitFor(instance, ['Saved']);

    const seen = written(instance);
    const order = ['Probing', 'Choose a format', 'Downloading', 'Saved'];
    const positions = order.map((needle) => seen.indexOf(needle));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    console.log(`AC-2 walk passed through: ${order.join(' -> ')}`);
    expect(instance.lastFrame()).toContain('fixture.mp4');
    expect(instance.lastFrame()).toContain('Downloads');

    instance.unmount();
  });

  it('moves the picker with arrows, j/k and a number key', async () => {
    const instance = await mount(fake, {});

    instance.stdin.write(URL);
    await tick(30);
    instance.stdin.write('\r');
    await waitFor(instance, ['Choose a format', '> 1. 1080p h264']);

    instance.stdin.write('j');
    await waitFor(instance, ['> 2. 1080p av1']);

    instance.stdin.write('3');
    await waitFor(instance, ['> 3. MP3 audio']);

    instance.stdin.write('k');
    await waitFor(instance, ['> 2. 1080p av1']);

    instance.stdin.write('\r');
    await waitFor(instance, ['Saved']);

    instance.unmount();
  });

  it('returns to input on Esc from the picker', async () => {
    const instance = await mount(fake, {});

    instance.stdin.write(URL);
    await tick(30);
    instance.stdin.write('\r');
    await waitFor(instance, ['Choose a format']);

    instance.stdin.write('\u001B');
    await waitFor(instance, ['Paste a URL']);

    instance.unmount();
  });

  it('prefills the URL from the positional argument', async () => {
    const instance = await mount(fake, { url: URL });

    expect(instance.lastFrame()).toContain(URL);

    instance.unmount();
  });

  it('starts in history with --history and opens it on H', async () => {
    const flagged = await mount(fake, { history: true });
    expect(flagged.lastFrame()).toContain('History');
    flagged.unmount();

    const typed = await mount(fake, {});
    typed.stdin.write('H');
    await waitFor(typed, ['History']);
    typed.unmount();
  });

  it('skips the picker and downloads straight away under --audio-only', async () => {
    const instance = await mount(fake, { audioOnly: true, url: URL });

    instance.stdin.write('\r');
    await waitFor(instance, ['Saved']);

    expect(written(instance)).not.toContain('Choose a format');

    instance.unmount();
  });
});
