'use client';

import { useSyncExternalStore } from 'react';

/**
 * "Predict first" is opt-in, cross-module practice preference: off by
 * default (modules open unlocked, with a non-blocking check at the end),
 * on when a student wants the stricter guess-before-you-see gate for extra
 * drilling. Mirrors useThemeWatcher's pref-store pattern.
 */
const PRACTICE_KEY = 'signals-lab:practice-mode';

const listeners = new Set<() => void>();
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return window.localStorage.getItem(PRACTICE_KEY) === 'on';
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePracticeMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setPracticeMode(on: boolean): void {
  if (typeof window === 'undefined') return;
  if (on) {
    window.localStorage.setItem(PRACTICE_KEY, 'on');
  } else {
    window.localStorage.removeItem(PRACTICE_KEY);
  }
  listeners.forEach((l) => l());
}
