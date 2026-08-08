'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns a value that updates at most once per `delayMs`, always settling
 * on the latest value after the caller stops changing it. Used to keep ARIA
 * live announcements from firing on every pixel of a slider drag —
 * assistive tech announces every mutation, and a 60fps feed is unusable.
 */
export function useThrottledValue<T>(value: T, delayMs = 600): T {
  const [throttled, setThrottled] = useState(value);
  const lastRun = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastRun.current;

    if (elapsed >= delayMs) {
      lastRun.current = now;
      setThrottled(value);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      lastRun.current = Date.now();
      setThrottled(value);
    }, delayMs - elapsed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delayMs]);

  return throttled;
}
