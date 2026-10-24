import { useEffect, useRef } from 'react';

export function usePolling(callback, delay = 5000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || delay === null) return;

    function tick() {
      savedCallback.current();
    }

    tick(); // Run immediately
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}
