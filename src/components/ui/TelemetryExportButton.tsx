'use client';

import { useMessages } from '@/lib/i18n';
import { downloadEventsAsJson } from '@/lib/state/telemetry';

export function TelemetryExportButton(): React.JSX.Element {
  const t = useMessages().common;
  return (
    <button
      type="button"
      onClick={() => downloadEventsAsJson()}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
      title={t.exportLogTitle}
    >
      {t.exportLog}
    </button>
  );
}
