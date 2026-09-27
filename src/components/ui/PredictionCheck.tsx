'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
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

/** Each question's chosen option id (or null), live from storage. */
function useAnswers(moduleId: string, questions: readonly PredictionQuestion[]): (string | null)[] {
  const snapshot = useSyncExternalStore(
    subscribeStorage,
    () =>
      questions
        .map((q) => window.localStorage.getItem(answerKey(moduleId, q.id)) ?? '')
        .join('\u0000'),
    () => questions.map(() => '').join('\u0000')
  );
  return snapshot.split('\u0000').map((id) => (id === '' ? null : id));
}

/** How long a chosen answer stays on screen before the next question slides in. */
const ADVANCE_MS = 450;

/**
 * A non-blocking "check your understanding" quiz, taken one question at a
 * time: choosing an answer moves straight on to the next question, with no
 * right/wrong shown yet, and the score and a full review appear only after
 * the last one — so students commit to what they think rather than
 * adjusting to feedback mid-way. Answers persist (a reload resumes at the
 * first unanswered question), can be changed with Previous until the check
 * is finished, and are cleared by Retake. See PredictionGate for the
 * blocking "predict first" variant.
 */
export function PredictionCheck({
  moduleId,
  questions,
  disabled,
  showHeading = true,
}: PredictionCheckProps): React.JSX.Element | null {
  const t = useMessages().common.prediction;
  const answers = useAnswers(moduleId, questions);
  const firstUnanswered = answers.findIndex((a) => a === null);
  const finished = questions.length > 0 && firstUnanswered === -1;
  // null follows the first unanswered question; a number is where Previous/Next put us.
  const [position, setPosition] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const moved = useRef(false);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const index = Math.min(questions.length - 1, Math.max(0, position ?? firstUnanswered));

  // Move focus to each new question (not on first render), so keyboard and
  // screen-reader users land on it.
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
  }, [index, finished]);

  if (disabled || questions.length === 0) return null;

  function go(next: number | null): void {
    moved.current = true;
    setPosition(next);
  }

  function choose(qIndex: number, opt: PredictionOption): void {
    if (advancing) return;
    const q = questions[qIndex];
    window.localStorage.setItem(answerKey(moduleId, q.id), opt.id);
    notifyStorageChange();
    logEvent(moduleId, 'prediction_answered', {
      questionId: q.id,
      optionId: opt.id,
      correct: opt.correct,
    });
    const after = answers.map((a, i) => (i === qIndex ? opt.id : a));
    const nowFinished = after.every((a) => a !== null);
    if (nowFinished) {
      const correct = questions.filter(
        (qq, i) => qq.options.find((o) => o.id === after[i])?.correct
      ).length;
      logEvent(moduleId, 'prediction_check_completed', { correct, total: questions.length });
    }
    // Hold this question on screen, showing the choice, until the delay ends:
    // otherwise following "first unanswered" would jump ahead instantly.
    setPosition(qIndex);
    setAdvancing(true);
    timer.current = setTimeout(() => {
      setAdvancing(false);
      if (nowFinished) go(null);
      else {
        const nextOpen = after.findIndex((a, i) => i > qIndex && a === null);
        go(nextOpen === -1 ? after.findIndex((a) => a === null) : nextOpen);
      }
    }, ADVANCE_MS);
  }

  function retake(): void {
    resetCheckAnswers(moduleId, questions);
    go(null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      {showHeading && (
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
          {t.checkHeading}
        </p>
      )}
      {finished ? (
        <CheckResults
          questions={questions}
          answers={answers}
          headingRef={headingRef}
          onRetake={retake}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <p
                ref={headingRef}
                tabIndex={-1}
                aria-live="polite"
                className="font-mono text-xs tabular-nums text-[var(--foreground)]/65 outline-none"
              >
                {t.questionOf(index + 1, questions.length)}
              </p>
              <p className="text-xs text-[var(--foreground)]/55">{t.stepperHint}</p>
            </div>
            <div className="flex gap-1" aria-hidden="true">
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  className={
                    'h-1.5 flex-1 rounded-full transition-colors ' +
                    (i === index
                      ? 'bg-[var(--accent)]'
                      : answers[i] !== null
                        ? 'bg-[var(--accent)]/40'
                        : 'bg-[var(--surface-2)]')
                  }
                />
              ))}
            </div>
          </div>
          <CheckQuestion
            key={questions[index].id}
            question={questions[index]}
            selected={answers[index]}
            locked={advancing}
            onChoose={(opt) => choose(index, opt)}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0 || advancing}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:opacity-40"
            >
              {t.previous}
            </button>
            <button
              type="button"
              onClick={() => go(index + 1 < questions.length ? index + 1 : null)}
              disabled={answers[index] === null || advancing}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:opacity-40"
            >
              {t.next}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CheckQuestion({
  question,
  selected,
  locked,
  onChoose,
}: {
  readonly question: PredictionQuestion;
  readonly selected: string | null;
  readonly locked: boolean;
  readonly onChoose: (opt: PredictionOption) => void;
}): React.JSX.Element {
  const options = question.options;
  const focusableIndex = Math.max(
    0,
    options.findIndex((o) => o.id === selected)
  );

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number): void {
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
      group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-[var(--foreground)]">{question.question}</p>
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
              onClick={() => onChoose(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={locked}
              className={
                'rounded-md border px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors ' +
                (isSelected
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]')
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckResults({
  questions,
  answers,
  headingRef,
  onRetake,
}: {
  readonly questions: readonly PredictionQuestion[];
  readonly answers: readonly (string | null)[];
  readonly headingRef: React.RefObject<HTMLParagraphElement | null>;
  readonly onRetake: () => void;
}): React.JSX.Element {
  const t = useMessages().common.prediction;
  const results = questions.map((q, i) => {
    const chosen = q.options.find((o) => o.id === answers[i]);
    return { q, chosen, right: q.options.find((o) => o.correct), ok: !!chosen?.correct };
  });
  const correct = results.filter((r) => r.ok).length;
  const total = questions.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-md bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1" aria-live="polite">
          <p
            ref={headingRef}
            tabIndex={-1}
            className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/60 outline-none"
          >
            {t.resultsTitle}
          </p>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
            {t.score(correct, total)}
          </p>
          <p className="text-sm text-[var(--foreground)]/75">{t.allDone(correct, total)}</p>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="shrink-0 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
        >
          {t.retake}
        </button>
      </div>
      <ol className="flex flex-col gap-3">
        {results.map(({ q, chosen, right, ok }, i) => (
          <li
            key={q.id}
            className="flex flex-col gap-1 rounded-md border border-[var(--border)] p-3 text-sm"
            style={{ borderLeft: `3px solid var(${ok ? '--plot-output' : '--plot-danger'})` }}
          >
            <p className="text-[var(--foreground)]">
              <span className="mr-1.5 font-mono text-[var(--foreground)]/50">{i + 1}.</span>
              {q.question}
            </p>
            <p className="text-[var(--foreground)]/80">
              <span className="text-[var(--foreground)]/60">{t.yourAnswer}: </span>
              {chosen?.label} <span className="font-medium">{ok ? t.correct : t.notQuite}</span>
            </p>
            {!ok && right && (
              <p className="text-[var(--foreground)]/80">
                <span className="text-[var(--foreground)]/60">{t.correctAnswer}: </span>
                {right.label}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
