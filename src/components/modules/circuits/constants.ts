import type { Topology } from '@/lib/state/schemas';

/** Display order; labels live in the i18n dictionary under `circuits.topologies`. (Section order: lib/topics.) */
export const TOPOLOGY_ORDER: readonly Topology[] = ['series', 'parallel'];

export const MIN_VOLTAGE = 0;
export const MAX_VOLTAGE = 24;
export const MIN_RESISTANCE = 10;
export const MAX_RESISTANCE = 2200;
