/**
 * AC circuit math: periodic waveforms and their RMS, and steady-state
 * sinusoidal analysis of series R / L / C loads via complex impedance.
 * Pure TypeScript, no DOM — the same conventions as the rest of lib/circuits.
 */

export type WaveShape = 'sine' | 'square' | 'triangle';

export const WAVE_SHAPES: readonly WaveShape[] = ['sine', 'square', 'triangle'];

/** One period of a unit-amplitude waveform, `theta` in radians (any real value). */
export function unitWave(shape: WaveShape, theta: number): number {
  const turn = theta / (2 * Math.PI);
  const frac = turn - Math.floor(turn); // 0..1 through the cycle
  switch (shape) {
    case 'sine':
      return Math.sin(theta);
    case 'square':
      return frac < 0.5 ? 1 : -1;
    case 'triangle':
      // Phase-aligned with sin: 0 at the start, +1 at a quarter period.
      return frac < 0.25 ? 4 * frac : frac < 0.75 ? 2 - 4 * frac : 4 * frac - 4;
  }
}

/** RMS as a fraction of peak — the "form" that makes Vrms = Vp/√2 a sine-only rule. */
export const RMS_FACTOR: Readonly<Record<WaveShape, number>> = {
  sine: 1 / Math.SQRT2,
  square: 1,
  triangle: 1 / Math.sqrt(3),
};

/** Mean of |v| as a fraction of peak (what an average-responding meter measures). */
export const RECTIFIED_MEAN_FACTOR: Readonly<Record<WaveShape, number>> = {
  sine: 2 / Math.PI,
  square: 1,
  triangle: 0.5,
};

export interface WaveStats {
  readonly peak: number;
  readonly peakToPeak: number;
  readonly rms: number;
  /** Mean of |v|. The plain mean of any of these waveforms is zero. */
  readonly rectifiedMean: number;
  /** Peak / RMS. */
  readonly crestFactor: number;
  readonly period: number;
  readonly omega: number;
}

export function waveStats(shape: WaveShape, peak: number, frequency: number): WaveStats {
  const rms = peak * RMS_FACTOR[shape];
  return {
    peak,
    peakToPeak: 2 * peak,
    rms,
    rectifiedMean: peak * RECTIFIED_MEAN_FACTOR[shape],
    crestFactor: rms > 0 ? peak / rms : 0,
    period: frequency > 0 ? 1 / frequency : Infinity,
    omega: 2 * Math.PI * frequency,
  };
}

/** RMS by direct numerical integration over one period — used to verify RMS_FACTOR. */
export function numericalRms(shape: WaveShape, peak: number, samples = 20_000): number {
  let sum = 0;
  for (let i = 0; i < samples; i++) {
    const v = peak * unitWave(shape, (2 * Math.PI * (i + 0.5)) / samples);
    sum += v * v;
  }
  return Math.sqrt(sum / samples);
}

export type LoadType = 'r' | 'l' | 'c' | 'rl' | 'rc' | 'rlc';

export const LOAD_TYPES: readonly LoadType[] = ['r', 'l', 'c', 'rl', 'rc', 'rlc'];

/** Which components a load includes; unused component values are ignored. */
export function loadParts(load: LoadType): { r: boolean; l: boolean; c: boolean } {
  return { r: load.includes('r'), l: load.includes('l'), c: load.includes('c') };
}

export interface AcResult {
  /** Impedance Z = R + jX, in ohms. */
  readonly zRe: number;
  readonly zIm: number;
  readonly zMag: number;
  /**
   * Impedance angle θ = arg Z, in radians: the angle by which voltage LEADS
   * current. θ > 0 inductive (current lags), θ < 0 capacitive (current leads).
   */
  readonly theta: number;
  readonly xl: number;
  readonly xc: number;
  readonly vRms: number;
  readonly iRms: number;
  /** Component voltage magnitudes (rms) — V_L and V_C can each exceed the source. */
  readonly vR: number;
  readonly vL: number;
  readonly vC: number;
  readonly powerFactor: number;
  /** 'lagging' (inductive), 'leading' (capacitive), or 'unity'. */
  readonly pfKind: 'lagging' | 'leading' | 'unity';
  /** Real power P (W), reactive power Q (var; + inductive), apparent power S (VA). */
  readonly p: number;
  readonly q: number;
  readonly s: number;
  /** Series resonant frequency 1/(2π√LC), when the load has both L and C. */
  readonly resonance: number | null;
}

/**
 * Steady-state analysis of a series load across a sinusoidal source.
 * `vRms` in volts, `frequency` in Hz, `r` in Ω, `l` in H, `c` in F.
 */
export function solveAcLoad(
  load: LoadType,
  vRms: number,
  frequency: number,
  r: number,
  l: number,
  c: number
): AcResult {
  const parts = loadParts(load);
  const omega = 2 * Math.PI * frequency;
  const R = parts.r ? r : 0;
  const xl = parts.l ? omega * l : 0;
  const xc = parts.c && omega > 0 && c > 0 ? 1 / (omega * c) : 0;
  const zRe = R;
  const zIm = xl - xc;
  const zMag = Math.hypot(zRe, zIm);
  const theta = Math.atan2(zIm, zRe);
  const iRms = zMag > 0 ? vRms / zMag : 0;

  const powerFactor = Math.cos(theta);
  // Round-off at resonance (X_L − X_C ≈ 1e-15 Ω) shouldn't read as lagging.
  const pfKind = Math.abs(theta) < 1e-9 ? 'unity' : theta > 0 ? 'lagging' : 'leading';
  const s = vRms * iRms;

  return {
    zRe,
    zIm,
    zMag,
    theta,
    xl,
    xc,
    vRms,
    iRms,
    vR: iRms * R,
    vL: iRms * xl,
    vC: iRms * xc,
    powerFactor,
    pfKind,
    p: s * powerFactor,
    q: s * Math.sin(theta),
    s,
    resonance: parts.l && parts.c && l > 0 && c > 0 ? 1 / (2 * Math.PI * Math.sqrt(l * c)) : null,
  };
}

/** Instantaneous v(t), i(t) and p(t) = v·i for a solved load, voltage phase 0 at t = 0. */
export function acInstant(
  result: AcResult,
  frequency: number,
  t: number
): { v: number; i: number; p: number } {
  const omega = 2 * Math.PI * frequency;
  const v = Math.SQRT2 * result.vRms * Math.sin(omega * t);
  const i = Math.SQRT2 * result.iRms * Math.sin(omega * t - result.theta);
  return { v, i, p: v * i };
}
