'use client';

import { useSyncExternalStore } from 'react';

/** Bumps whenever the effective theme could have changed (system preference or manual override). */
function subscribeThemeChange(callback: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => {
    mq.removeEventListener('change', callback);
    observer.disconnect();
  };
}

function getThemeSnapshot(): string {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit) return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerThemeSnapshot(): string {
  return 'light';
}

/** A string that changes whenever the effective theme changes — use as a redraw dependency. */
export function useThemeVersion(): string {
  return useSyncExternalStore(subscribeThemeChange, getThemeSnapshot, getServerThemeSnapshot);
}

export type ThemePreference = 'system' | 'light' | 'dark';
const THEME_KEY = 'signals-lab:theme';

// localStorage has no same-window change event, so the toggle button
// broadcasts its own writes on this bus for useSyncExternalStore to observe.
const prefListeners = new Set<() => void>();

function subscribeThemePref(callback: () => void): () => void {
  prefListeners.add(callback);
  return () => prefListeners.delete(callback);
}

function getThemePrefSnapshot(): ThemePreference {
  const v = window.localStorage.getItem(THEME_KEY);
  return v === 'light' || v === 'dark' ? v : 'system';
}

function getServerThemePrefSnapshot(): ThemePreference {
  return 'system';
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeThemePref, getThemePrefSnapshot, getServerThemePrefSnapshot);
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  return getThemePrefSnapshot();
}

export function setThemePreference(pref: ThemePreference): void {
  if (typeof window === 'undefined') return;
  if (pref === 'system') {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.removeItem(THEME_KEY);
  } else {
    document.documentElement.setAttribute('data-theme', pref);
    window.localStorage.setItem(THEME_KEY, pref);
  }
  prefListeners.forEach((l) => l());
}
