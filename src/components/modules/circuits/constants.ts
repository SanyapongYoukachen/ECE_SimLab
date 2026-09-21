import type { CircuitMode, Topology } from '@/lib/state/schemas';

export const MODE_OPTIONS: readonly { value: CircuitMode; label: string }[] = [
  { value: 'ohm', label: "Ohm's law" },
  { value: 'network', label: 'Series & parallel' },
  { value: 'divider', label: 'Voltage divider' },
];

export const TOPOLOGY_OPTIONS: readonly { value: Topology; label: string }[] = [
  { value: 'series', label: 'Series' },
  { value: 'parallel', label: 'Parallel' },
];

export const MIN_VOLTAGE = 0;
export const MAX_VOLTAGE = 24;
export const MIN_RESISTANCE = 10;
export const MAX_RESISTANCE = 2200;
