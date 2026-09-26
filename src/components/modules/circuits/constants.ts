import type { CircuitMode, Topology } from '@/lib/state/schemas';

/** Display order; labels live in the i18n dictionary under `circuits.modes` / `circuits.topologies`. */
export const MODE_ORDER: readonly CircuitMode[] = ['ohm', 'network', 'divider', 'thevenin', 'mesh'];

export const TOPOLOGY_ORDER: readonly Topology[] = ['series', 'parallel'];

export const MIN_VOLTAGE = 0;
export const MAX_VOLTAGE = 24;
export const MIN_RESISTANCE = 10;
export const MAX_RESISTANCE = 2200;
