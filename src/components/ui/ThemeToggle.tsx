'use client';

import { useThemePreference, setThemePreference, type ThemePreference } from './useThemeWatcher';

const CYCLE: readonly ThemePreference[] = ['system', 'light', 'dark'];
const LABEL: Record<ThemePreference, string> = {
  system: 'Theme: system',
  light: 'Theme: light',
  dark: 'Theme: dark',
};

export function ThemeToggle(): React.JSX.Element {
  const pref = useThemePreference();

  function cycle(): void {
    setThemePreference(CYCLE[(CYCLE.indexOf(pref) + 1) % CYCLE.length]);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
      aria-label={`${LABEL[pref]}. Activate to cycle theme.`}
    >
      {LABEL[pref]}
    </button>
  );
}
