'use client';

import { useSyncExternalStore, type KeyboardEvent } from 'react';
import { useMessages } from '@/lib/i18n';
import { logEvent } from '@/lib/state/telemetry';
import type { PredictionOption, PredictionQuestion } from './PredictionGate';

interface PredictionCheckProps {
  readonly moduleId: string;
  readonly questions: readonly PredictionQuestion[];
  /** Instructor lecture-mode flag (URL: ?predict=off). When true, the whole block is hidden. */
  readonly disabled: boolean;
  /** Hide the card's own "Check your understanding" heading (when a tab already names it). */
  readonly showHeading?: boolean;
}

// Shares its storage bus with PredictionGate's — both key answers under the
// same `signals-lab:predicted:<moduleId>...` namespace, so localStorage has
// no same-window change event either way.
const storageListeners = new Set<() => void>();
function subscribeStorage(callback: () => void): () => void {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
}
function notifyStorageChange(): void {
  storageListeners.forEach((l) => l());
}

function answerKey(moduleId: string, questionId: string): string {
  return `signals-lab:predicted:${moduleId}:${questionId}`;
}

export interface CheckProgress {
  readonly answered: number;
  readonly correct: number;
  readonly total: number;
}

/**
 * How far a student has got through a module's check: answered and correct
 * counts, live as answers are chosen or cleared. The snapshot is a string so
 * useSyncExternalStore sees a stable value between unrelated renders.
 */
export function useCheckProgress(
  moduleId: string,
  questions: readonly PredictionQuestion[]
): CheckProgress {
  const snapshot = useSyncExternalStore(
    subscribeStorage,
    () => {
      let answered = 0;
      let correct = 0;
      for (const q of questions) {
        const chosen = window.localStorage.getItem(answerKey(moduleId, q.id));
        if (chosen === null) continue;
        answered++;
        if (q.options.find((o) => o.id === chosen)?.correct) correct++;
      }
      return `${answered}/${correct}`;
    },
    () => '0/0'
  );
  const [answered, correct] = snapshot.split('/').map(Number);
  return { answered, correct, total: questions.length };
}

/** Clears a module's check answers so the student can retake it. */
export function resetCheckAnswers(
  moduleId: string,
  questions: readonly PredictionQuestion[]
): void {
  for (const q of questions) window.localStorage.removeItem(answerKey(moduleId, q.id));
  notifyStorageChange();
  logEvent(moduleId, 'prediction_check_reset', {});
}

/**
 * A non-blocking "check your understanding" quiz shown after a module's
 * interactive content, rather than gating access to it (see PredictionGate
 * for that variant, used when a student turns on "predict first" practice
 * mode). The student has already watched the concepts play out; this bank
 * of 3-5 questions checks whether they landed, instead of demanding a guess
 * before anything is shown. Each question persists its own answer
 * independently, so answering one doesn't affect the others.
 */
export function PredictionCheck({
  moduleId,
  questions,
  disabled,
  showHeading = true,
}: PredictionCheckProps): React.JSX.Element | null {
  const t = useMessages().common.prediction;
  if (disabled || questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      {showHeading && (
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
          {t.checkHeading}
        </p>
      )}
      <div className="flex flex-col gap-5">
        {questions.map((q, i) => (
          <PredictionCheckItem key={q.id} moduleId={moduleId} question={q} number={i + 1} />
        ))}
      </div>
    </div>
  );
}

function PredictionCheckItem({
  moduleId,
  question,
  number,
}: {
  readonly moduleId: string;
  readonly question: PredictionQuestion;
  readonly number: number;
}): React.JSX.Element {
  const t = useMessages().common.prediction;
  const storageKey = answerKey(moduleId, question.id);
  const options = question.options;

  const selected = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null),
    () => null
  );

  function choose(opt: PredictionOption): void {
    if (selected !== null) return;
    window.localStorage.setItem(storageKey, opt.id);
    notifyStorageChange();
    logEvent(moduleId, 'prediction_answered', {
      questionId: question.id,
      optionId: opt.id,
      correct: opt.correct,
    });
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
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--foreground)]">
        <span className="mr-1.5 font-mono text-[var(--foreground)]/50">{number}.</span>
        {question.question}
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={question.question}>
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
                <span className="ml-2 font-medium">{opt.correct ? t.correct : t.notQuite}</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <p className="text-xs text-[var(--foreground)]/60">
          {selectedOption.correct ? t.checkRight : t.checkWrong}
        </p>
      )}
    </div>
  );
}
