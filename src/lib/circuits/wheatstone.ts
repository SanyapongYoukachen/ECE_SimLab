export interface WheatstoneResult {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly r3: number;
  readonly r4: number;
  readonly rg: number;
  /** Node voltage at the R1/R2 junction. */
  readonly vb: number;
  /** Node voltage at the R3/R4 junction. */
  readonly vc: number;
  readonly i1: number;
  readonly i2: number;
  readonly i3: number;
  readonly i4: number;
  /** Galvanometer branch current, signed: positive flows B -> C. */
  readonly ig: number;
  readonly balanced: boolean;
}

/**
 * Solves a Wheatstone bridge by nodal analysis. Layout: source +V at node A,
 * ground at node D; R1 (A-B) and R2 (B-D) form the left divider, R3 (A-C)
 * and R4 (C-D) the right divider, Rg (B-C) is the galvanometer/detector
 * bridging the two dividers' midpoints.
 *
 * Two unknowns (Vb, Vc), from KCL at each midpoint:
 *   (V-Vb)/R1 = Vb/R2 + (Vb-Vc)/Rg
 *   (V-Vc)/R3 = Vc/R4 + (Vc-Vb)/Rg
 * which is linear in Vb, Vc regardless of Rg — solved directly via Cramer's
 * rule rather than iteratively.
 */
export function solveWheatstoneBridge(
  voltage: number,
  r1: number,
  r2: number,
  r3: number,
  r4: number,
  rg: number
): WheatstoneResult {
  const g1 = r1 > 0 ? 1 / r1 : 0;
  const g2 = r2 > 0 ? 1 / r2 : 0;
  const g3 = r3 > 0 ? 1 / r3 : 0;
  const g4 = r4 > 0 ? 1 / r4 : 0;
  const gg = rg > 0 ? 1 / rg : 0;

  const a = g1 + g2 + gg;
  const b = g3 + g4 + gg;
  const c = gg;
  const d = voltage * g1;
  const e = voltage * g3;
  const det = a * b - c * c;

  const vb = det > 0 ? (d * b + c * e) / det : 0;
  const vc = det > 0 ? (a * e + c * d) / det : 0;

  const i1 = r1 > 0 ? (voltage - vb) / r1 : 0;
  const i2 = r2 > 0 ? vb / r2 : 0;
  const i3 = r3 > 0 ? (voltage - vc) / r3 : 0;
  const i4 = r4 > 0 ? vc / r4 : 0;
  const ig = rg > 0 ? (vb - vc) / rg : 0;

  // R1*R4 = R2*R3 is the balance condition — it holds regardless of Rg and V,
  // which is exactly why a bridge measures an unknown resistance precisely.
  const balanced = Math.abs(r1 * r4 - r2 * r3) < 1e-6 * Math.max(r1 * r4, r2 * r3, 1);

  return { voltage, r1, r2, r3, r4, rg, vb, vc, i1, i2, i3, i4, ig, balanced };
}
