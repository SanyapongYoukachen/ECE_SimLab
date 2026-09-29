/**
 * Where AC comes from: a coil turning in a magnetic field (single phase),
 * and three coils 120° apart (three phase). Pure TypeScript, no DOM.
 *
 * Single phase. A coil of N turns and area A turns in a field B. The flux
 * through it is N·B·A·cos θe, so Faraday's law gives
 *   e = −dλ/dt = N·B·A·ωe·sin θe,
 * where θe is the electrical angle. A machine with P poles passes P/2 N–S
 * pole pairs per mechanical turn, so θe = (P/2)·θm, ωe = (P/2)·ωm and
 * f = P·n/120 with n in rpm.
 *
 * Three phase. Three identical windings a, b, c spaced 120° electrical
 * apart give three equal sine voltages 120° apart. Loads are per-phase
 * Z = R + jX, connected in star (Y, with neutral) or delta (Δ).
 */

export interface GeneratorParams {
  /** Turns in the coil. */
  readonly turns: number;
  /** Flux density, T. */
  readonly flux: number;
  /** Coil area, m². */
  readonly area: number;
  /** Shaft speed, rpm. */
  readonly rpm: number;
  /** Number of poles (even). */
  readonly poles: number;
  /** Load resistance, Ω. */
  readonly rLoad: number;
  /** Armature (coil) resistance, Ω. */
  readonly ra: number;
}

export interface GeneratorResult {
  /** Mechanical and electrical angular speed, rad/s. */
  readonly omegaM: number;
  readonly omegaE: number;
  readonly frequency: number;
  readonly period: number;
  /** Peak flux linkage N·B·A, Wb-turns. */
  readonly linkage: number;
  readonly ePeak: number;
  readonly eRms: number;
  readonly iPeak: number;
  readonly iRms: number;
  readonly vPeak: number;
  readonly vRms: number;
  /** Average power delivered to the load, and generated (load + armature loss), W. */
  readonly pLoad: number;
  readonly pGen: number;
  readonly efficiency: number;
  /** Average torque the prime mover must supply, N·m: P_gen / ωm. */
  readonly torque: number;
}

export function solveGenerator(p: GeneratorParams): GeneratorResult {
  const omegaM = (2 * Math.PI * p.rpm) / 60;
  const omegaE = (p.poles / 2) * omegaM;
  const frequency = omegaE / (2 * Math.PI);
  const linkage = p.turns * p.flux * p.area;
  const ePeak = linkage * omegaE;
  const eRms = ePeak / Math.SQRT2;
  const iPeak = ePeak / (p.rLoad + p.ra);
  const iRms = iPeak / Math.SQRT2;
  const pLoad = iRms * iRms * p.rLoad;
  const pGen = eRms * iRms;
  return {
    omegaM,
    omegaE,
    frequency,
    period: frequency > 0 ? 1 / frequency : Infinity,
    linkage,
    ePeak,
    eRms,
    iPeak,
    iRms,
    vPeak: iPeak * p.rLoad,
    vRms: iRms * p.rLoad,
    pLoad,
    pGen,
    efficiency: pGen > 0 ? pLoad / pGen : 0,
    torque: omegaM > 0 ? pGen / omegaM : 0,
  };
}

/** Instantaneous values at electrical angle θe (0 = coil face-on to the field, flux at its maximum). */
export function generatorInstant(
  r: GeneratorResult,
  thetaE: number
): { lambda: number; e: number; i: number; v: number } {
  const s = Math.sin(thetaE);
  return {
    lambda: r.linkage * Math.cos(thetaE),
    e: r.ePeak * s,
    i: r.iPeak * s,
    v: r.vPeak * s,
  };
}

// ---------------------------------------------------------------------------
// Three phase
// ---------------------------------------------------------------------------

export type Connection = 'wye' | 'delta';

export const PHASES = ['a', 'b', 'c'] as const;
export type Phase = (typeof PHASES)[number];

/** Phase shifts: b lags a by 120°, c lags a by 240° (i.e. leads by 120°). */
export const PHASE_SHIFT: Readonly<Record<Phase, number>> = {
  a: 0,
  b: (-2 * Math.PI) / 3,
  c: (2 * Math.PI) / 3,
};

interface Complex {
  readonly re: number;
  readonly im: number;
}

const polar = (mag: number, angle: number): Complex => ({
  re: mag * Math.cos(angle),
  im: mag * Math.sin(angle),
});
const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const sub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};
const abs = (a: Complex): number => Math.hypot(a.re, a.im);
const arg = (a: Complex): number => Math.atan2(a.im, a.re);

export interface Phasor {
  /** RMS magnitude. */
  readonly mag: number;
  /** Angle, radians. */
  readonly angle: number;
}

const toPhasor = (c: Complex): Phasor => ({ mag: abs(c), angle: arg(c) });

export interface ThreePhaseParams {
  /** Phase (line-to-neutral) voltage, V rms. */
  readonly vPhase: number;
  readonly frequency: number;
  /** Per-phase load resistance and reactance (+ inductive), Ω. */
  readonly r: number;
  readonly x: number;
  /** Phase a's load as a fraction of the others (1 = balanced). */
  readonly unbalance: number;
  readonly connection: Connection;
}

export interface ThreePhaseResult {
  /** Line-to-neutral voltages Va, Vb, Vc. */
  readonly vPhase: Readonly<Record<Phase, Phasor>>;
  /** Line-to-line voltages Vab, Vbc, Vca. */
  readonly vLine: Readonly<Record<Phase, Phasor>>;
  /** Currents in the three load impedances (phase currents). */
  readonly iLoad: Readonly<Record<Phase, Phasor>>;
  /** Currents in the three lines. */
  readonly iLine: Readonly<Record<Phase, Phasor>>;
  /** Neutral current (Y only; 0 for Δ, which has no neutral). */
  readonly iNeutral: Phasor;
  /** Voltage across each load: phase voltage for Y, line voltage for Δ. */
  readonly vLoad: Readonly<Record<Phase, Phasor>>;
  readonly p: number;
  readonly q: number;
  readonly s: number;
  readonly powerFactor: number;
  /** Load impedance angle, radians (current lags voltage by this much). */
  readonly phi: number;
}

/**
 * Steady-state three-phase analysis with an ideal (zero-impedance) balanced
 * source. Y uses a solid neutral, so each load sees its own phase voltage
 * and any imbalance returns through the neutral; Δ puts each load across a
 * line voltage.
 */
export function solveThreePhase(p: ThreePhaseParams): ThreePhaseResult {
  const z: Record<Phase, Complex> = {
    a: { re: p.r * p.unbalance, im: p.x * p.unbalance },
    b: { re: p.r, im: p.x },
    c: { re: p.r, im: p.x },
  };
  const vp: Record<Phase, Complex> = {
    a: polar(p.vPhase, PHASE_SHIFT.a),
    b: polar(p.vPhase, PHASE_SHIFT.b),
    c: polar(p.vPhase, PHASE_SHIFT.c),
  };
  const prev: Record<Phase, Phase> = { a: 'c', b: 'a', c: 'b' };
  const vl: Record<Phase, Complex> = {
    a: sub(vp.a, vp.b),
    b: sub(vp.b, vp.c),
    c: sub(vp.c, vp.a),
  };

  let vLoad: Record<Phase, Complex>;
  let iLoad: Record<Phase, Complex>;
  let iLine: Record<Phase, Complex>;
  if (p.connection === 'wye') {
    vLoad = vp;
    iLoad = { a: div(vp.a, z.a), b: div(vp.b, z.b), c: div(vp.c, z.c) };
    iLine = iLoad;
  } else {
    // Load "a" sits between lines a and b, and so on round the triangle.
    vLoad = vl;
    iLoad = { a: div(vl.a, z.a), b: div(vl.b, z.b), c: div(vl.c, z.c) };
    // Line current into node a = I_ab − I_ca.
    iLine = {
      a: sub(iLoad.a, iLoad[prev.a]),
      b: sub(iLoad.b, iLoad[prev.b]),
      c: sub(iLoad.c, iLoad[prev.c]),
    };
  }
  const iN = p.connection === 'wye' ? add(add(iLine.a, iLine.b), iLine.c) : { re: 0, im: 0 };

  let pTot = 0;
  let qTot = 0;
  for (const k of PHASES) {
    const i2 = abs(iLoad[k]) ** 2;
    pTot += i2 * z[k].re;
    qTot += i2 * z[k].im;
  }
  const s = Math.hypot(pTot, qTot);
  const map = (rec: Record<Phase, Complex>): Record<Phase, Phasor> => ({
    a: toPhasor(rec.a),
    b: toPhasor(rec.b),
    c: toPhasor(rec.c),
  });
  return {
    vPhase: map(vp),
    vLine: map(vl),
    iLoad: map(iLoad),
    iLine: map(iLine),
    iNeutral: toPhasor(iN),
    vLoad: map(vLoad),
    p: pTot,
    q: qTot,
    s,
    powerFactor: s > 0 ? pTot / s : 1,
    phi: Math.atan2(p.x, p.r),
  };
}

/** Instantaneous value of an rms phasor at time t: √2·|X|·sin(ωt + ∠X). */
export function instant(ph: Phasor, omega: number, t: number): number {
  return Math.SQRT2 * ph.mag * Math.sin(omega * t + ph.angle);
}

/** Total instantaneous power delivered to the three loads: Σ v_load·i_load. */
export function totalPower(r: ThreePhaseResult, omega: number, t: number): number {
  let sum = 0;
  for (const k of PHASES) sum += instant(r.vLoad[k], omega, t) * instant(r.iLoad[k], omega, t);
  return sum;
}
