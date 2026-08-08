/**
 * Anonymous, local-only interaction logging. No backend in v1 — events are
 * appended to localStorage and can be exported as JSON. The event shape is
 * deliberately generic (module / type / payload) so a real collector can be
 * pointed at the same `logEvent` call later without changing this schema.
 */

export interface TelemetryEvent {
  readonly ts: number;
  readonly sessionId: string;
  readonly module: string;
  readonly type: string;
  readonly payload: Record<string, unknown>;
}

const SESSION_KEY = 'signals-lab:session-id';
const EVENTS_KEY = 'signals-lab:telemetry';
const MAX_EVENTS = 2000;

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getSessionId(): string {
  if (!hasStorage()) return 'server';
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function logEvent(
  module: string,
  type: string,
  payload: Record<string, unknown> = {}
): void {
  if (!hasStorage()) return;
  const event: TelemetryEvent = {
    ts: Date.now(),
    sessionId: getSessionId(),
    module,
    type,
    payload,
  };
  const events = getEvents();
  events.push(event);
  const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
}

export function getEvents(): TelemetryEvent[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TelemetryEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearEvents(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(EVENTS_KEY);
}

export function exportEventsAsJson(): string {
  return JSON.stringify(getEvents(), null, 2);
}

/** Triggers a browser download of the current event log as a .json file. */
export function downloadEventsAsJson(filename = 'signals-lab-telemetry.json'): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([exportEventsAsJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
