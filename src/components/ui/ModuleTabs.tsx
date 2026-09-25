'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { useMessages } from '@/lib/i18n';
import { ModuleViewStateSchema, type ModuleViewState } from '@/lib/state/schemas';
import { decodeModuleViewState, encodeModuleViewState } from '@/lib/state/urlState';
import { useUrlSyncedState } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { PredictionCheck, resetCheckAnswers, useCheckProgress } from './PredictionCheck';
import type { PredictionQuestion } from './PredictionGate';

const DEFAULT_VIEW = ModuleViewStateSchema.parse({});

type View = ModuleViewState['view'];
const VIEWS: readonly View[] = ['explore', 'quiz'];

interface ModuleTabsProps {
  readonly moduleId: string;
  readonly questions: readonly PredictionQuestion[];
  /** Instructor lecture-mode flag (URL: ?predict=off): no quiz, so no tabs either. */
  readonly disabled: boolean;
  /** The module's interactive content. */
  readonly children: React.ReactNode;
}

/**
 * Splits a module into "Explore" (the interactive content) and "Check your
 * understanding" (its question bank), so students work with the theory
 * first and take the check when they choose to, rather than scrolling past
 * a quiz. The active tab lives in the URL (`?view=quiz`) so an instructor
 * can link straight to the check. Follows the WAI-ARIA tabs pattern: arrow
 * keys move between tabs, and only the active tab is in the Tab order.
 */
export function ModuleTabs({
  moduleId,
  questions,
  disabled,
  children,
}: ModuleTabsProps): React.JSX.Element {
  const t = useMessages().common.prediction;
  const [state, setState] = useUrlSyncedState(
    decodeModuleViewState,
    encodeModuleViewState,
    DEFAULT_VIEW
  );
  const progress = useCheckProgress(moduleId, questions);
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);

  if (disabled || questions.length === 0) return <>{children}</>;

  const view = state.view;

  function select(next: View, focus = false): void {
    if (next !== view) {
      logEvent(moduleId, 'view_changed', { view: next });
      setState({ view: next });
    }
    const tablist = tablistRef.current;
    if (focus) {
      tablist?.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
    } else {
      // Arriving from a button at the bottom of a long page: bring the tabs back into view.
      tablist?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number): void {
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (index + 1) % VIEWS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + VIEWS.length) % VIEWS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = VIEWS.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(VIEWS[next], true);
  }

  const labels: Record<View, React.ReactNode> = {
    explore: t.tabExplore,
    quiz: (
      <>
        <span>{t.checkHeading}</span>
        <span
          className={
            'rounded-full px-1.5 py-0.5 font-mono text-xs tabular-nums ' +
            (progress.answered === progress.total
              ? 'bg-[var(--plot-output)]/15 text-[var(--foreground)]'
              : 'bg-[var(--surface-2)] text-[var(--foreground)]/70')
          }
          aria-label={t.progressAria(progress.answered, progress.total)}
        >
          {t.progress(progress.answered, progress.total)}
        </span>
      </>
    ),
  };

  const allDone = progress.answered === progress.total;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label={t.tabsLabel}
        className="flex scroll-mt-4 gap-1 border-b border-[var(--border)]"
      >
        {VIEWS.map((v, index) => {
          const selected = v === view;
          return (
            <button
              key={v}
              type="button"
              role="tab"
              id={`${baseId}-tab-${v}`}
              data-view={v}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${v}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(v, true)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={
                '-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors ' +
                (selected
                  ? 'border-[var(--accent)] font-medium text-[var(--foreground)]'
                  : 'border-transparent text-[var(--foreground)]/65 hover:text-[var(--foreground)]')
              }
            >
              {labels[v]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${view}`}
        aria-labelledby={`${baseId}-tab-${view}`}
        className="flex flex-col gap-4"
      >
        {view === 'explore' ? (
          <>
            {children}
            <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{t.ctaTitle}</p>
                <p className="mt-0.5 text-sm text-[var(--foreground)]/70">
                  {allDone
                    ? t.summary(progress.answered, progress.total, progress.correct)
                    : t.ctaBody(progress.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => select('quiz')}
                className="shrink-0 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
              >
                {t.ctaButton}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between"
              aria-live="polite"
            >
              <div className="flex flex-col gap-1">
                <p className="font-mono text-sm tabular-nums text-[var(--foreground)]">
                  {t.summary(progress.answered, progress.total, progress.correct)}
                </p>
                <p className="text-sm text-[var(--foreground)]/70">
                  {allDone
                    ? t.allDone(progress.correct, progress.total)
                    : t.notStarted(progress.total)}
                </p>
              </div>
              {progress.answered > 0 && (
                <button
                  type="button"
                  onClick={() => resetCheckAnswers(moduleId, questions)}
                  className="shrink-0 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface)]"
                >
                  {t.reset}
                </button>
              )}
            </div>
            <PredictionCheck
              moduleId={moduleId}
              questions={questions}
              disabled={false}
              showHeading={false}
            />
            <div>
              <button
                type="button"
                onClick={() => select('explore')}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
              >
                {t.back}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
