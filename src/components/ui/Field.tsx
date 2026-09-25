/**
 * A visible caption above a control. The control keeps its own accessible
 * name (e.g. a radiogroup's aria-label), so the caption is hidden from
 * assistive tech to avoid announcing it twice.
 */
export function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--foreground)]/60" aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}
