interface ExpressionReadoutProps {
  readonly children: React.ReactNode;
  readonly label?: string;
}

/** Monospace, tabular-figure display for a live arithmetic expression, e.g. y[4] = 1.00x0.42 + ... = 1.83 */
export function ExpressionReadout({ children, label }: ExpressionReadoutProps): React.JSX.Element {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      {label && <div className="mb-1 text-xs text-[var(--foreground)]/60">{label}</div>}
      <div className="font-mono tabular-nums text-sm leading-relaxed break-words text-[var(--foreground)]">
        {children}
      </div>
    </div>
  );
}
