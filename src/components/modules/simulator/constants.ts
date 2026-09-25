import type { SimulatorTab } from '@/lib/state/schemas';

/** More circuits land here over time — Wheatstone bridge is the first. */
export const SIMULATOR_TAB_OPTIONS: readonly { value: SimulatorTab; label: string }[] = [
  { value: 'wheatstone', label: 'Wheatstone bridge' },
];
