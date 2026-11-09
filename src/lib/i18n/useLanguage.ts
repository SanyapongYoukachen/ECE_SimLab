'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { LANG_KEY, detectLang, type Lang } from './lang';
import { MESSAGES, type Messages } from './messages';
import { localizeQuestions, type LocalizedQuestion } from './localize';
import type { PredictionQuestion } from '@/components/ui/PredictionGate';

/**
 * Cross-module language preference. Mirrors usePracticeMode's pref-store
 * pattern: localStorage is the source of truth, with an in-memory listener
 * bus since localStorage has no same-window change event. The server (and
 * the first hydration pass) always renders English; the layout's init
 * script has already set <html lang/data-lang> before paint, which is what
 * the server-rendered <Localized> chrome keys off.
 */
const listeners = new Set<() => void>();
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Lang {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(LANG_KEY);
  } catch {
    // Storage blocked (private mode, sandboxed iframe): fall back to the browser.
  }
  return detectLang(stored, window.navigator.language);
}

function getServerSnapshot(): Lang {
  return 'en';
}

export function useLanguage(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useMessages(): Messages {
  return MESSAGES[useLanguage()];
}

/** A module's question bank in the current language; ids and correct flags are shared across languages. */
export function useLocalizedQuestions(
  bank: readonly LocalizedQuestion[]
): readonly PredictionQuestion[] {
  const lang = useLanguage();
  return useMemo(() => localizeQuestions(bank, lang), [bank, lang]);
}

export function setLanguage(lang: Lang): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Still switch for this page view even if it can't be remembered.
  }
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);
  listeners.forEach((l) => l());
}
