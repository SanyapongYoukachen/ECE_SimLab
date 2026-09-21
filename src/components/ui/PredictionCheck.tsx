'use client';

import { useSyncExternalStore, type KeyboardEvent } from 'react';
import { logEvent } from '@/lib/state/telemetry';
import type { PredictionOption } from './PredictionGate';

interface PredictionCheckProps {
  readonly moduleId: string;
  readonly question: string;
  readonly options: readonly PredictionOption[];
  /** Instructor lecture-mode flag (URL: ?predict=off). When true, the check is hidden entirely. */
  readonly disabled: boolean;
}

// Shares its storage bus with PredictionGate's — both key answers under the
// same `signals-lab:predicted:<moduleId>` namespace, so localStorage has no
// same-window change event either way.
const storageListeners = new Set<() => void>();
function subscribeStorage(callback: () => void): () => void {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
}
function notifyStorageChange(): void {
  storageListeners.forEach((l) => l());
}

/**
 * A non-blocking "check your understanding" prompt shown after a module's
 * interactive content, rather than gating access to it (see
 * PredictionGate for that variant, still used by the circuits module). The
 * student has already watched the concept play out; this checks whether it
 * landed, instead of demanding a guess before anything is shown.
 */
export function PredictionCheck({
  moduleId,
  question,
  options,
  disabled,
}: PredictionCheckProps): React.JSX.Element | null {
  const storageKey = `signals-lab:predicted:${moduleId}`;

  const selected = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null),
    () => null
  );

  if (disabled) return null;

  function choose(opt: PredictionOption): void {
    if (selected !== null) return;
    window.localStorage.setItem(storageKey, opt.id);
    notifyStorageChange();
    logEvent(moduleId, 'prediction_answered', { optionId: opt.id, correct: opt.correct });
  }

  const selectedOption = options.find((o) => o.id === selected);
  const focusableIndex = Math.max(
    0,
    options.findIndex((o) => o.id === selected)
  );

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (selected !== null) return;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = options.length - 1;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      const group = e.currentTarget.parentElement;
      const buttons = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[nextIndex]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--plot-active)]">
          Check your understanding
        </p>
        <p className="mt-1 text-base text-[var(--foreground)]">{question}</p>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={question}>
        {options.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === focusableIndex ? 0 : -1}
              onClick={() => choose(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={selected !== null && !isSelected}
              className={
                'rounded-md border px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-50 ' +
                (isSelected
                  ? opt.correct
                    ? 'border-[var(--plot-output)] bg-[var(--plot-output)]/10 text-[var(--foreground)]'
                    : 'border-[var(--plot-danger)] bg-[var(--plot-danger)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--foreground)]')
              }
            >
              {opt.label}
              {isSelected && (
                <span className="ml-2 font-medium">
                  {opt.correct ? '— correct' : '— not quite'}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <p className="text-sm text-[var(--foreground)]/70">
          {selectedOption.correct
            ? 'Matches what you just saw above.'
            : 'Worth another look at the panels above.'}
        </p>
      )}
    </div>
  );
}
