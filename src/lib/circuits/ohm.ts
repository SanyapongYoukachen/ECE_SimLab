export interface OhmResult {
  readonly voltage: number;
  readonly resistance: number;
  readonly current: number;
  readonly power: number;
}

/** Ohm's law: I = V / R, plus dissipated power P = VI. R <= 0 is treated as an open circuit (I = 0). */
export function solveOhm(voltage: number, resistance: number): OhmResult {
  const current = resistance > 0 ? voltage / resistance : 0;
  return { voltage, resistance, current, power: voltage * current };
}

export interface LoadLine {
  readonly vs: readonly number[];
  readonly is: readonly number[];
}

/** Samples the resistor's I-V line (I = V / R) across [0, maxVoltage], for plotting against the operating point. */
export function loadLine(resistance: number, maxVoltage: number, steps = 2): LoadLine {
  const vs = Array.from({ length: steps + 1 }, (_, i) => (maxVoltage * i) / steps);
  const is = vs.map((v) => (resistance > 0 ? v / resistance : 0));
  return { vs, is };
}
