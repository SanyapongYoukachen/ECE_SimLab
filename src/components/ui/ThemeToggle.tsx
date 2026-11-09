'use client';

import { useMessages } from '@/lib/i18n';
import { useThemePreference, setThemePreference, type ThemePreference } from './useThemeWatcher';

const CYCLE: readonly ThemePreference[] = ['system', 'light', 'dark'];
export function ThemeToggle(): React.JSX.Element {
  const pref = useThemePreference();
  const t = useMessages().common.theme;
  const label = t[pref];

  function cycle(): void {
    setThemePreference(CYCLE[(CYCLE.indexOf(pref) + 1) % CYCLE.length]);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
      aria-label={`${label}. ${t.cycleHint}`}
    >
      {label}
    </button>
  );
}
