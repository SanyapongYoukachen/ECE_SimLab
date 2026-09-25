'use client';

import { useMessages } from '@/lib/i18n';
import { usePracticeMode, setPracticeMode } from './usePracticeMode';

/**
 * Cross-module switch for the opt-in "predict first" gate (see
 * PredictionGate's `persist={false}` mode). Lives in the module header so
 * it's reachable from any module; the preference itself lives in
 * localStorage and applies the next time a module mounts.
 */
export function PracticeModeToggle(): React.JSX.Element {
  const practiceMode = usePracticeMode();
  const t = useMessages().common.practice;

  return (
    <button
      type="button"
      onClick={() => setPracticeMode(!practiceMode)}
      aria-pressed={practiceMode}
      title={t.title}
      className={
        'rounded-md border px-3 py-1.5 text-sm transition-colors ' +
        (practiceMode
          ? 'border-[var(--plot-active)] bg-[var(--plot-active)]/10 text-[var(--foreground)]'
          : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)]')
      }
    >
      {practiceMode ? t.on : t.off}
    </button>
  );
}
