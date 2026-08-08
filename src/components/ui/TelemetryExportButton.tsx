'use client';

import { downloadEventsAsJson } from '@/lib/state/telemetry';

export function TelemetryExportButton(): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => downloadEventsAsJson()}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
      title="Download this browser's interaction log as JSON"
    >
      Export log
    </button>
  );
}
