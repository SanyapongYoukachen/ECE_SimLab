export interface ChainStage {
  readonly title: string;
  readonly value: string;
  readonly sub: string;
  /** Plot colour token for the stage's accent: the physical side, the electrons, the electrical side. */
  readonly tone: 'active' | 'input' | 'output';
}

const TONE: Readonly<Record<ChainStage['tone'], string>> = {
  active: 'var(--plot-active)',
  input: 'var(--plot-input)',
  output: 'var(--plot-output)',
};

/**
 * The whole measurement at a glance: six numbered stages, each one's value
 * the input of the next. Wraps to two or three columns on narrow screens;
 * the arrows between stages show only when they sit in one row.
 */
export function SignalChain({
  label,
  stages,
}: {
  readonly label: string;
  readonly stages: readonly ChainStage[];
}): React.JSX.Element {
  return (
    <ol aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {stages.map((s, i) => (
        <li
          key={s.title}
          className="relative flex flex-col gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          style={{ borderTop: `3px solid ${TONE[s.tone]}` }}
        >
          <span className="text-[11px] text-[var(--foreground)]/60">
            {i + 1}. {s.title}
          </span>
          <span className="font-mono tabular-nums text-sm font-semibold text-[var(--foreground)]">
            {s.value}
          </span>
          <span className="text-[11px] leading-snug text-[var(--foreground)]/65">{s.sub}</span>
          {i < stages.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-[var(--foreground)]/40 lg:block"
            >
              ›
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
