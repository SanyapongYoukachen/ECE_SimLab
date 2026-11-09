/**
 * Semiconductor devices for the Electronics module: the P/N junction's
 * electrostatics, diode models and a diode–resistor circuit, an NPN BJT in
 * a simple bias circuit, and a common-emitter amplifier. Pure TypeScript,
 * no DOM; silicon at 300 K throughout unless a device says otherwise.
 */

/** Elementary charge, C. */
export const Q = 1.602176634e-19;
/** Thermal voltage kT/q at 300 K, V. */
export const VT = 0.025852;
/** Intrinsic carrier density of silicon at 300 K, cm⁻³. */
export const NI_SI = 1.0e10;
/** Permittivity of silicon, F/cm (11.7 · ε0). */
export const EPS_SI = 11.7 * 8.8541878128e-14;

// ---------------------------------------------------------------------------
// P/N junction (abrupt, step doping)
// ---------------------------------------------------------------------------

export interface JunctionParams {
  /** Acceptor density on the P side, cm⁻³. */
  readonly na: number;
  /** Donor density on the N side, cm⁻³. */
  readonly nd: number;
  /** Applied voltage, P relative to N, V (positive = forward bias). */
  readonly va: number;
}

export interface JunctionResult {
  /** Built-in potential, V. */
  readonly vbi: number;
  /** Voltage actually across the depletion region, Vbi − Va (clamped above 0), V. */
  readonly vj: number;
  /** Depletion width and its extent into each side, cm. */
  readonly w: number;
  readonly xp: number;
  readonly xn: number;
  /** Peak electric field at the junction, V/cm. */
  readonly eMax: number;
  /** Majority carriers on each side (≈ the doping), and minority carriers (ni²/N), cm⁻³. */
  readonly pP: number;
  readonly nN: number;
  readonly nP: number;
  readonly pN: number;
  /** Diode current density relative to its saturation value: exp(Va/VT) − 1. */
  readonly currentRatio: number;
}

/** The smallest junction voltage we keep: the depletion approximation fails as Va approaches Vbi. */
const MIN_VJ = 0.05;

/**
 * Abrupt-junction electrostatics in the depletion approximation:
 *   Vbi = VT·ln(Na·Nd / ni²)
 *   W   = √( 2ε(Vbi − Va)/q · (1/Na + 1/Nd) ),  xp·Na = xn·Nd
 *   Emax = q·Na·xp / ε
 */
export function solveJunction(p: JunctionParams): JunctionResult {
  const vbi = VT * Math.log((p.na * p.nd) / (NI_SI * NI_SI));
  const vj = Math.max(MIN_VJ, vbi - p.va);
  const w = Math.sqrt(((2 * EPS_SI * vj) / Q) * (1 / p.na + 1 / p.nd));
  const xp = (w * p.nd) / (p.na + p.nd);
  const xn = (w * p.na) / (p.na + p.nd);
  return {
    vbi,
    vj,
    w,
    xp,
    xn,
    eMax: (Q * p.na * xp) / EPS_SI,
    pP: p.na,
    nN: p.nd,
    nP: (NI_SI * NI_SI) / p.na,
    pN: (NI_SI * NI_SI) / p.nd,
    currentRatio: Math.exp(p.va / VT) - 1,
  };
}

// ---------------------------------------------------------------------------
// Diodes
// ---------------------------------------------------------------------------

export type DiodeKind = 'si' | 'ge' | 'red' | 'green' | 'blue';

export const DIODE_KINDS: readonly DiodeKind[] = ['si', 'ge', 'red', 'green', 'blue'];

export interface DiodeModel {
  /** Forward voltage at 10 mA, V. */
  readonly vf: number;
  /** Ideality factor. */
  readonly n: number;
  /** Saturation current, A (derived from vf and n). */
  readonly is: number;
  /** Emitted wavelength for LEDs, nm. */
  readonly wavelength?: number;
}

const IF_REF = 0.01;

function model(vf: number, n: number, wavelength?: number): DiodeModel {
  return { vf, n, is: IF_REF / Math.exp(vf / (n * VT)), wavelength };
}

/**
 * Typical parts. An LED's forward voltage tracks its band gap, so it sits
 * close to the energy of the photons it emits (1240/λ eV).
 */
export const DIODES: Readonly<Record<DiodeKind, DiodeModel>> = {
  si: model(0.7, 1),
  ge: model(0.3, 1),
  red: model(1.9, 2, 650),
  green: model(2.2, 2, 565),
  blue: model(2.9, 2, 460),
};

export type DiodeApprox = 'ideal' | 'drop' | 'exp';

export const DIODE_APPROX: readonly DiodeApprox[] = ['ideal', 'drop', 'exp'];

/** Shockley: I = Is·(exp(V/(n·VT)) − 1). */
export function diodeCurrent(d: DiodeModel, v: number): number {
  return d.is * Math.expm1(Math.min(v / (d.n * VT), 200));
}

export interface DiodeCircuitResult {
  readonly id: number;
  readonly vd: number;
  readonly vr: number;
  /** Power in the diode, W. */
  readonly pd: number;
  readonly conducting: boolean;
}

/**
 * A source VS in series with R and the diode (anode toward +). The three
 * textbook models: ideal (a switch with no drop), constant drop (Vf once
 * on), and the exponential Shockley curve, solved by bisection on the
 * diode voltage so it is always found.
 */
export function solveDiodeCircuit(
  d: DiodeModel,
  approx: DiodeApprox,
  vs: number,
  r: number
): DiodeCircuitResult {
  const result = (id: number, vd: number): DiodeCircuitResult => ({
    id,
    vd,
    vr: id * r,
    pd: id * vd,
    conducting: id > 1e-6,
  });
  if (approx === 'ideal') return vs > 0 ? result(vs / r, 0) : result(0, vs);
  if (approx === 'drop') return vs > d.vf ? result((vs - d.vf) / r, d.vf) : result(0, vs);
  // Exponential: f(vd) = Is(e^{vd/nVT} − 1) − (vs − vd)/R is increasing in vd; bracket and bisect.
  let lo = Math.min(vs, 0) - 1;
  let hi = Math.max(vs, 0) + 1;
  const f = (v: number): number => diodeCurrent(d, v) - (vs - v) / r;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid;
    else lo = mid;
  }
  const vd = (lo + hi) / 2;
  return result((vs - vd) / r, vd);
}

// ---------------------------------------------------------------------------
// NPN BJT
// ---------------------------------------------------------------------------

/** Transistor saturation current, A: VBE ≈ 0.65 V at 1 mA. */
export const BJT_IS = 1e-14;
/** Early voltage, V: the slight upward slope of the active-region curves. */
export const EARLY_V = 100;
/** Collector–emitter voltage scale of the saturation knee, V. */
const KNEE = 0.08;
export const VCE_SAT = 0.2;

/**
 * Output characteristic: collector current for a base current and VCE.
 * β·IB in the active region (rising slightly with VCE, the Early effect),
 * falling to zero through the saturation knee near VCE ≈ 0.
 */
export function collectorCurrent(beta: number, ib: number, vce: number): number {
  if (vce <= 0 || ib <= 0) return 0;
  return beta * ib * (1 - Math.exp(-vce / KNEE)) * (1 + vce / EARLY_V);
}

export type BjtRegion = 'cutoff' | 'active' | 'saturation';

export interface BjtResult {
  readonly ib: number;
  readonly ic: number;
  readonly ie: number;
  readonly vbe: number;
  readonly vce: number;
  readonly region: BjtRegion;
  /** IC at saturation for this collector circuit: (VCC − VCE,sat)/RC. */
  readonly icSat: number;
  /** IC / IB actually achieved (β in the active region, less in saturation). */
  readonly betaForced: number;
}

/**
 * VBB through RB into the base, VCC through RC into the collector, emitter
 * grounded. The base loop sets IB (VBB = IB·RB + VBE, VBE from the
 * exponential junction); the collector settles where the output curve for
 * that IB meets the load line IC = (VCC − VCE)/RC.
 */
export function solveBjt(
  vbb: number,
  rb: number,
  vcc: number,
  rc: number,
  beta: number
): BjtResult {
  // Base loop: VBB − IB·RB = VT·ln(β·IB/IS + 1). Bisect on IB.
  let ib = 0;
  if (vbb > 0) {
    let lo = 0;
    let hi = vbb / rb;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      const vbe = VT * Math.log1p((beta * mid) / BJT_IS);
      if (vbb - mid * rb > vbe) lo = mid;
      else hi = mid;
    }
    ib = (lo + hi) / 2;
  }
  const vbe = vbb > 0 ? VT * Math.log1p((beta * ib) / BJT_IS) : vbb;
  // Collector: bisect VCE where the device curve meets the load line.
  let lo = 0;
  let hi = vcc;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (collectorCurrent(beta, ib, mid) > (vcc - mid) / rc) hi = mid;
    else lo = mid;
  }
  const vce = (lo + hi) / 2;
  const ic = Math.max(0, (vcc - vce) / rc);
  const region: BjtRegion = ic < 1e-6 ? 'cutoff' : vce < 0.3 ? 'saturation' : 'active';
  return {
    ib,
    ic,
    ie: ic + ib,
    vbe,
    vce,
    region,
    icSat: (vcc - VCE_SAT) / rc,
    betaForced: ib > 0 ? ic / ib : 0,
  };
}

// ---------------------------------------------------------------------------
// Common-emitter amplifier, voltage-divider bias
// ---------------------------------------------------------------------------

export interface AmpParams {
  readonly vcc: number;
  readonly r1: number;
  readonly r2: number;
  readonly rc: number;
  readonly re: number;
  readonly rl: number;
  readonly beta: number;
  /** Emitter bypass capacitor fitted (RE shorted for the signal). */
  readonly bypass: boolean;
}

export interface AmpResult {
  /** Thévenin equivalent of the bias divider. */
  readonly vth: number;
  readonly rth: number;
  /** Quiescent (DC) point. */
  readonly ib: number;
  readonly ic: number;
  readonly vbe: number;
  readonly vb: number;
  readonly ve: number;
  readonly vc: number;
  readonly vce: number;
  /** Small-signal: intrinsic emitter resistance VT/IE, transconductance IC/VT. */
  readonly re0: number;
  readonly gm: number;
  /** Emitter resistance the signal sees: 0 when bypassed. */
  readonly reAc: number;
  /** AC load: RC ∥ RL. */
  readonly rac: number;
  /** Voltage gain vout/vin (negative: the CE stage inverts). */
  readonly gain: number;
  readonly rin: number;
  readonly rout: number;
  /** Largest undistorted output swing before cutoff (+) and saturation (−), V. */
  readonly swingUp: number;
  readonly swingDown: number;
  readonly saturated: boolean;
}

export function solveAmp(p: AmpParams): AmpResult {
  const vth = (p.vcc * p.r2) / (p.r1 + p.r2);
  const rth = (p.r1 * p.r2) / (p.r1 + p.r2);
  // VTH = IB·RTH + VBE(IC) + (β+1)·IB·RE, with VBE = VT·ln(IC/IS). Bisect on IC.
  let lo = 0;
  let hi = p.vcc / Math.max(p.re, 1);
  for (let i = 0; i < 200; i++) {
    const ic = (lo + hi) / 2;
    const ib = ic / p.beta;
    const need = ib * rth + VT * Math.log1p(ic / BJT_IS) + (ic + ib) * p.re;
    if (need < vth) lo = ic;
    else hi = ic;
  }
  let ic = (lo + hi) / 2;
  let vce = p.vcc - ic * p.rc - ic * (1 + 1 / p.beta) * p.re;
  const saturated = vce < VCE_SAT;
  if (saturated) {
    // The collector circuit can't pass β·IB: VCE pins at VCE,sat.
    ic = (p.vcc - VCE_SAT) / (p.rc + p.re);
    vce = VCE_SAT;
  }
  const ib = ic / p.beta;
  const ie = ic + ib;
  const re0 = VT / Math.max(ie, 1e-12);
  const reAc = p.bypass ? 0 : p.re;
  const rac = (p.rc * p.rl) / (p.rc + p.rl);
  const ve = ie * p.re;
  return {
    vth,
    rth,
    ib,
    ic,
    vbe: VT * Math.log1p(ic / BJT_IS),
    vb: ve + VT * Math.log1p(ic / BJT_IS),
    ve,
    vc: ve + vce,
    vce,
    re0,
    gm: ic / VT,
    reAc,
    rac,
    gain: saturated ? 0 : (-(p.beta / (p.beta + 1)) * rac) / (re0 + reAc),
    rin: 1 / (1 / p.r1 + 1 / p.r2 + 1 / ((p.beta + 1) * (re0 + reAc))),
    rout: p.rc,
    swingUp: ic * rac,
    swingDown: Math.max(0, vce - VCE_SAT),
    saturated,
  };
}

/**
 * Large-signal output for an instantaneous input: the base sits at its
 * quiescent voltage plus vin, and the collector current follows the real
 * exponential junction — so big inputs distort and, past the limits, clip
 * at cutoff (IC = 0) and saturation (VCE = VCE,sat).
 */
export function ampOutput(p: AmpParams, q: AmpResult, vin: number): number {
  if (q.saturated) return 0;
  const alpha = p.beta / (p.beta + 1);
  // Solve VT·ln(ic/IS) + (ic/α)·reAc = VBEQ + (IEQ)·reAc + vin for ic.
  const target = q.vbe + (q.ic / alpha) * q.reAc + vin;
  let lo = 0;
  let hi = q.ic * 50 + 0.1;
  for (let i = 0; i < 120; i++) {
    const ic = (lo + hi) / 2;
    const v = VT * Math.log1p(ic / BJT_IS) + (ic / alpha) * q.reAc;
    if (v < target) lo = ic;
    else hi = ic;
  }
  const ic = (lo + hi) / 2;
  const vout = -(ic - q.ic) * q.rac;
  return Math.max(-q.swingDown, Math.min(q.swingUp, vout));
}
