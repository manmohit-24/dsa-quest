"use client";

import { useCallback, useEffect, useRef } from "react";

/** Returns a stable function that calls `callback` once `delay` ms pass without another call. */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const latest = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}
