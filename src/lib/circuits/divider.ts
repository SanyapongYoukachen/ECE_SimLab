export interface DividerResult {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly current: number;
  readonly vOut: number;
  readonly vR1: number;
  readonly ratio: number;
}

/** Unloaded voltage divider: R1 and R2 in series across V, Vout tapped across R2. */
export function solveDivider(voltage: number, r1: number, r2: number): DividerResult {
  const total = r1 + r2;
  const current = total > 0 ? voltage / total : 0;
  const vOut = current * r2;
  const ratio = total > 0 ? r2 / total : 0;
  return { voltage, r1, r2, current, vOut, vR1: current * r1, ratio };
}
