import type { SimulatorTab } from '@/lib/state/schemas';

/**
 * More circuits land here over time — Wheatstone bridge is the first. Tab
 * labels live in the i18n dictionary under `simulator.tabs`.
 */
export const SIMULATOR_TAB_ORDER: readonly SimulatorTab[] = ['wheatstone'];
