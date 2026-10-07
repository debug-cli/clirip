import { useStdin, useStdout } from 'ink';
import { useEffect, useRef } from 'react';

import { MOUSE_DISABLE, MOUSE_ENABLE, type ClickMap, resolveMouseChunk } from './click-map';

// Ink 5 has no mouse API, so SGR mouse reporting is switched on around the render and
// reads the same input channel ink's own useInput reads. Everything is reverted on
// unmount, and nothing is emitted when the terminal cannot do raw mode.
export function useMouseClick(map: ClickMap, onClick: (id: string) => void): void {
  const handlerRef = useRef(onClick);
  handlerRef.current = onClick;

  const { internal_eventEmitter, isRawModeSupported, setRawMode } = useStdin();
  const { stdout, write } = useStdout();

  useEffect(() => {
    if (!isRawModeSupported) {
      return;
    }

    setRawMode(true);
    write(MOUSE_ENABLE);

    const handleChunk = (chunk: unknown): void => {
      const id = resolveMouseChunk(String(chunk), map);
      if (id !== null) {
        handlerRef.current(id);
      }
    };

    internal_eventEmitter.on('input', handleChunk);

    return () => {
      internal_eventEmitter.removeListener('input', handleChunk);
      // Ink's own `write` returns early once the app is unmounting, and the terminal
      // must not be left reporting mouse events, so teardown goes to the stream.
      stdout.write(MOUSE_DISABLE);
      setRawMode(false);
    };
  }, [internal_eventEmitter, isRawModeSupported, map, setRawMode, stdout, write]);
}
