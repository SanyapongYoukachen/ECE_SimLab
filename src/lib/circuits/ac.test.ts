import { describe, it, expect } from 'vitest';
import {
  WAVE_SHAPES,
  RMS_FACTOR,
  acInstant,
  numericalRms,
  solveAcLoad,
  unitWave,
  waveStats,
} from './ac';

describe('waveforms and RMS', () => {
  it('matches the closed-form RMS factors by direct integration', () => {
    for (const shape of WAVE_SHAPES) {
      expect(numericalRms(shape, 1)).toBeCloseTo(RMS_FACTOR[shape], 4);
    }
  });

  it('gives Thai mains its familiar numbers: 220 V rms ↔ 311 V peak', () => {
    const s = waveStats('sine', 220 * Math.SQRT2, 50);
    expect(s.rms).toBeCloseTo(220, 9);
    expect(s.peak).toBeCloseTo(311.1, 1);
    expect(s.peakToPeak).toBeCloseTo(622.3, 1);
    expect(s.period).toBeCloseTo(0.02, 12);
    expect(s.omega).toBeCloseTo(314.16, 2);
    expect(s.crestFactor).toBeCloseTo(Math.SQRT2, 9);
  });

  it('phase-aligns every shape with sin: zero at the start, peak at a quarter period', () => {
    for (const shape of WAVE_SHAPES) {
      expect(unitWave(shape, Math.PI / 2)).toBeCloseTo(1, 9);
      expect(unitWave(shape, (3 * Math.PI) / 2)).toBeCloseTo(-1, 9);
    }
    expect(unitWave('triangle', 0)).toBe(0);
  });
});

describe('series AC loads', () => {
  const V = 220;
  const f = 50;

  it('pure R: current in phase, unity power factor, all power real', () => {
    const r = solveAcLoad('r', V, f, 100, 0.1, 100e-6);
    expect(r.theta).toBe(0);
    expect(r.pfKind).toBe('unity');
    expect(r.p).toBeCloseTo((V * V) / 100, 9);
    expect(r.q).toBeCloseTo(0, 9);
  });

  it('pure L: current lags by 90°, zero real power', () => {
    const r = solveAcLoad('l', V, f, 100, 0.1, 100e-6);
    expect(r.theta).toBeCloseTo(Math.PI / 2, 12);
    expect(r.pfKind).toBe('lagging');
    expect(r.xl).toBeCloseTo(2 * Math.PI * 50 * 0.1, 9);
    expect(r.p).toBeCloseTo(0, 6);
    expect(r.q).toBeCloseTo(r.s, 9);
  });

  it('pure C: current leads by 90°, negative reactive power', () => {
    const r = solveAcLoad('c', V, f, 100, 0.1, 100e-6);
    expect(r.theta).toBeCloseTo(-Math.PI / 2, 12);
    expect(r.pfKind).toBe('leading');
    expect(r.xc).toBeCloseTo(1 / (2 * Math.PI * 50 * 100e-6), 9);
    expect(r.q).toBeCloseTo(-r.s, 9);
  });

  it('RL matches a hand calculation: 10 Ω + 50 mH at 50 Hz', () => {
    const r = solveAcLoad('rl', V, f, 10, 0.05, 1e-6);
    // X_L = 2π·50·0.05 = 15.708 Ω; |Z| = 18.621 Ω; θ = 57.52°
    expect(r.xl).toBeCloseTo(15.708, 3);
    expect(r.zMag).toBeCloseTo(18.621, 3);
    expect((r.theta * 180) / Math.PI).toBeCloseTo(57.52, 2);
    expect(r.powerFactor).toBeCloseTo(0.537, 3);
    expect(r.iRms).toBeCloseTo(11.815, 3);
  });

  it('keeps the power triangle closed: S² = P² + Q²', () => {
    for (const load of ['rl', 'rc', 'rlc'] as const) {
      const r = solveAcLoad(load, V, 60, 22, 0.08, 150e-6);
      expect(r.s * r.s).toBeCloseTo(r.p * r.p + r.q * r.q, 6);
      expect(r.p).toBeCloseTo(r.iRms * r.iRms * 22, 6);
    }
  });

  it('series RLC at resonance: X_L = X_C, Z = R, unity PF — and V_L can exceed the source', () => {
    const L = 0.1;
    const C = 100e-6;
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    const r = solveAcLoad('rlc', V, f0, 5, L, C);
    expect(r.resonance).toBeCloseTo(f0, 9);
    expect(r.xl).toBeCloseTo(r.xc, 9);
    expect(r.zMag).toBeCloseTo(5, 9);
    expect(r.pfKind).toBe('unity');
    expect(r.vL).toBeGreaterThan(V);
    expect(r.vL).toBeCloseTo(r.vC, 9);
  });

  it('RLC flips from leading to lagging as frequency crosses resonance', () => {
    const below = solveAcLoad('rlc', V, 30, 10, 0.1, 100e-6);
    const above = solveAcLoad('rlc', V, 80, 10, 0.1, 100e-6);
    expect(below.pfKind).toBe('leading');
    expect(above.pfKind).toBe('lagging');
  });

  it('averages p(t) = v·i over a period to exactly P', () => {
    const r = solveAcLoad('rl', V, f, 10, 0.05, 1e-6);
    const n = 10_000;
    let sum = 0;
    for (let k = 0; k < n; k++) sum += acInstant(r, f, ((k + 0.5) / n) * (1 / f)).p;
    expect(sum / n).toBeCloseTo(r.p, 3);
  });
});
