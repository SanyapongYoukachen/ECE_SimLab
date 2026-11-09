'use client';

import { useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { useMessages } from '@/lib/i18n';
import { logEvent } from '@/lib/state/telemetry';

export interface PredictionOption {
  readonly id: string;
  readonly label: string;
  readonly correct: boolean;
}

export interface PredictionQuestion {
  readonly id: string;
  readonly question: string;
  readonly options: readonly PredictionOption[];
}

interface PredictionGateProps {
  readonly moduleId: string;
  readonly question: string;
  readonly options: readonly PredictionOption[];
  /** Instructor lecture-mode flag (URL: ?predict=off). When true, the gate never blocks. */
  readonly disabled: boolean;
  readonly children: React.ReactNode;
  /**
   * Whether an answer permanently unlocks the module across visits (the
   * default gating behaviour). Practice mode passes `false`: it re-gates
   * every time so drilling a fresh random question actually repeats,
   * instead of "answer once, unlocked forever."
   */
  readonly persist?: boolean;
}

// localStorage has no same-window change event, so `choose()` broadcasts its
// own writes on this bus for useSyncExternalStore to observe.
const storageListeners = new Set<() => void>();
function subscribeStorage(callback: () => void): () => void {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
}
function notifyStorageChange(): void {
  storageListeners.forEach((l) => l());
}

/**
 * Locks a module's interactive controls behind a committed multiple-choice
 * prediction. The point isn't to grade the student — it's that a guess made
 * out loud, before seeing the answer, is what turns "watching an animation"
 * into "noticing you were wrong." Answers persist locally so returning
 * students aren't re-gated every visit.
 */
export function PredictionGate({
  moduleId,
  question,
  options,
  disabled,
  children,
  persist = true,
}: PredictionGateProps): React.JSX.Element {
  const t = useMessages().common.prediction;
  const storageKey = `signals-lab:predicted:${moduleId}`;

  const storedSelected = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null),
    () => null
  );
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const selected = persist ? storedSelected : localSelected;

  // Captured once at mount: distinguishes "already answered on a prior visit"
  // (skip straight to unlocked) from "just answered this session" (still
  // require the explicit Continue click below). Practice mode (persist =
  // false) never treats a prior answer as a standing unlock.
  const [hadStoredAnswerAtMount] = useState(
    () =>
      persist && typeof window !== 'undefined' && window.localStorage.getItem(storageKey) !== null
  );
  const [continueClicked, setContinueClicked] = useState(false);

  const revealed = disabled || selected !== null;
  const unlocked = disabled || hadStoredAnswerAtMount || continueClicked;

  function choose(opt: PredictionOption): void {
    if (revealed) return;
    if (persist) {
      window.localStorage.setItem(storageKey, opt.id);
      notifyStorageChange();
    } else {
      setLocalSelected(opt.id);
    }
    logEvent(moduleId, 'prediction_answered', {
      optionId: opt.id,
      correct: opt.correct,
      practice: !persist,
    });
  }

  const locked = !disabled && !unlocked;
  const selectedOption = options.find((o) => o.id === selected);
  const focusableIndex = Math.max(
    0,
    options.findIndex((o) => o.id === selected)
  );

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (revealed) return;
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
    <div className="relative">
      {locked && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.gateDialog}
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/97 p-6 backdrop-blur-sm"
        >
          <div className="flex w-full max-w-md flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
                {t.gateKicker}
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
                    disabled={revealed && !isSelected}
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
                        {opt.correct ? t.correct : t.notQuite}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {revealed && selectedOption && (
              <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <p className="text-sm text-[var(--foreground)]/70">
                  {selectedOption.correct ? t.gateRight : t.gateWrong}
                </p>
                <button
                  type="button"
                  onClick={() => setContinueClicked(true)}
                  className="shrink-0 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
                >
                  {t.continue}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        aria-hidden={locked}
        inert={locked || undefined}
        className={locked ? 'pointer-events-none opacity-30' : ''}
      >
        {children}
      </div>
    </div>
  );
}
