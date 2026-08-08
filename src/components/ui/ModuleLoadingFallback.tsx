export function ModuleLoadingFallback(): React.JSX.Element {
  return (
    <div
      className="flex h-64 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]/50"
      role="status"
    >
      Loading module…
    </div>
  );
}
