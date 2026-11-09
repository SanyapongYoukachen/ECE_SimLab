/**
 * Circuit-analysis methods on two small, textbook-shaped DC circuits.
 *
 * Thévenin/Norton — a source network feeding a load across terminals a–b:
 *
 *     V ─ R1 ─┬─ R3 ─ a
 *             R2      RL
 *     ────────┴────── b
 *
 * Two sources — solved by mesh (loop-current) and nodal analysis:
 *
 *     V1 ─ R1 ─ A ─ R3 ─ V2      (both sources + at the top)
 *               R2
 *     ──────────┴──────────  ground
 *
 * Pure TypeScript, no DOM — the same conventions as the rest of lib/circuits.
 */

function parallel(a: number, b: number): number {
  return (a * b) / (a + b);
}

export interface TheveninResult {
  /** Open-circuit voltage at a–b: the divider R1/R2 (R3 carries no current). */
  readonly vth: number;
  /** Resistance seen into a–b with the source switched off (replaced by a wire): R1‖R2 + R3. */
  readonly rth: number;
  /** Short-circuit current at a–b: the Norton source. */
  readonly iN: number;
  /** Load current, voltage and power. */
  readonly il: number;
  readonly vl: number;
  readonly pl: number;
  /** Largest power any load could draw (at RL = Rth). */
  readonly pmax: number;
  /** R1‖R2, shown as a step on the way to Rth. */
  readonly r12: number;
}

export function solveThevenin(
  v: number,
  r1: number,
  r2: number,
  r3: number,
  rl: number
): TheveninResult {
  const vth = (v * r2) / (r1 + r2);
  const r12 = parallel(r1, r2);
  const rth = r12 + r3;
  const il = vth / (rth + rl);
  return {
    vth,
    rth,
    iN: vth / rth,
    il,
    vl: il * rl,
    pl: il * il * rl,
    pmax: (vth * vth) / (4 * rth),
    r12,
  };
}

/**
 * The load current found the long way — solving the original circuit
 * directly — so tests (and students) can check the equivalent is exact.
 */
export function loadCurrentDirect(
  v: number,
  r1: number,
  r2: number,
  r3: number,
  rl: number
): number {
  // R3 + RL in parallel with R2, in series with R1.
  const branch = r3 + rl;
  const total = r1 + parallel(r2, branch);
  const vx = v - (v / total) * r1;
  return vx / branch;
}

/** Terminal voltage for a load current I: the Thévenin line V = Vth − I·Rth. */
export function terminalVoltage(th: TheveninResult, current: number): number {
  return th.vth - current * th.rth;
}

/** Load power over a range of RL, for the maximum-power-transfer curve. */
export function powerSweep(
  th: TheveninResult,
  rlMin: number,
  rlMax: number,
  count = 121
): { rl: number[]; p: number[] } {
  const rl: number[] = [];
  const p: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = rlMin + ((rlMax - rlMin) * i) / (count - 1);
    const current = th.vth / (th.rth + r);
    rl.push(r);
    p.push(current * current * r);
  }
  return { rl, p };
}

export interface TwoSourceResult {
  /** Mesh currents, both clockwise: I1 in the left window, I2 in the right. */
  readonly i1: number;
  readonly i2: number;
  /** Mesh equations in matrix form: [[a11, a12], [a21, a22]]·[I1, I2] = [b1, b2]. */
  readonly meshMatrix: readonly [readonly [number, number], readonly [number, number]];
  readonly meshRhs: readonly [number, number];
  readonly meshDet: number;
  /** Node voltage at A (ground at the bottom rail). */
  readonly va: number;
  /** Nodal equation G·VA = Is: total conductance and injected current. */
  readonly nodeG: number;
  readonly nodeIs: number;
  /** Branch currents: R1 left → A, R2 A → ground, R3 A → right. */
  readonly iR1: number;
  readonly iR2: number;
  readonly iR3: number;
  /** Power each source delivers (negative = it's absorbing, e.g. being charged). */
  readonly pV1: number;
  readonly pV2: number;
  /** Power dissipated in the resistors. */
  readonly pR: number;
}

export function solveTwoSource(
  v1: number,
  v2: number,
  r1: number,
  r2: number,
  r3: number
): TwoSourceResult {
  // Mesh (KVL, clockwise):
  //   left:  (R1 + R2)·I1 − R2·I2 = V1
  //   right: −R2·I1 + (R2 + R3)·I2 = −V2   (clockwise runs down through V2, + to −: a drop)
  const a11 = r1 + r2;
  const a12 = -r2;
  const a21 = -r2;
  const a22 = r2 + r3;
  const b1 = v1;
  const b2 = -v2;
  const det = a11 * a22 - a12 * a21;
  const i1 = (b1 * a22 - a12 * b2) / det;
  const i2 = (a11 * b2 - b1 * a21) / det;

  // Node (KCL at A, currents leaving): (VA − V1)/R1 + VA/R2 + (VA − V2)/R3 = 0.
  const nodeG = 1 / r1 + 1 / r2 + 1 / r3;
  const nodeIs = v1 / r1 + v2 / r3;
  const va = nodeIs / nodeG;

  const iR1 = (v1 - va) / r1;
  const iR2 = va / r2;
  const iR3 = (va - v2) / r3;
  return {
    i1,
    i2,
    meshMatrix: [
      [a11, a12],
      [a21, a22],
    ],
    meshRhs: [b1, b2],
    meshDet: det,
    va,
    nodeG,
    nodeIs,
    iR1,
    iR2,
    iR3,
    pV1: v1 * iR1,
    pV2: -v2 * iR3,
    pR: iR1 * iR1 * r1 + iR2 * iR2 * r2 + iR3 * iR3 * r3,
  };
}
