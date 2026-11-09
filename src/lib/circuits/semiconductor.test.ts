import { describe, it, expect } from 'vitest';
import {
  DIODES,
  EPS_SI,
  NI_SI,
  Q,
  VCE_SAT,
  VT,
  ampOutput,
  collectorCurrent,
  diodeCurrent,
  solveAmp,
  solveBjt,
  solveDiodeCircuit,
  solveJunction,
  type AmpParams,
} from './semiconductor';

describe('P/N junction', () => {
  const base = { na: 1e16, nd: 1e16, va: 0 };

  it('has a built-in potential of about 0.71 V for 10¹⁶/10¹⁶ cm⁻³ silicon', () => {
    const j = solveJunction(base);
    expect(j.vbi).toBeCloseTo(VT * Math.log(1e32 / (NI_SI * NI_SI)), 12);
    expect(j.vbi).toBeGreaterThan(0.69);
    expect(j.vbi).toBeLessThan(0.73);
  });

  it('is about 0.43 µm wide at zero bias and splits it by doping (xp·Na = xn·Nd)', () => {
    const j = solveJunction(base);
    expect(j.w * 1e4).toBeCloseTo(0.43, 1);
    const lop = solveJunction({ na: 1e17, nd: 1e15, va: 0 });
    expect(lop.xp * 1e17).toBeCloseTo(lop.xn * 1e15, 6);
    // The depletion region reaches mostly into the lightly doped side.
    expect(lop.xn).toBeGreaterThan(50 * lop.xp);
  });

  it('narrows under forward bias and widens under reverse bias as √(Vbi − Va)', () => {
    const f = solveJunction({ ...base, va: 0.4 });
    const z = solveJunction(base);
    const r = solveJunction({ ...base, va: -5 });
    expect(f.w).toBeLessThan(z.w);
    expect(r.w).toBeGreaterThan(z.w);
    expect(r.w / z.w).toBeCloseTo(Math.sqrt((z.vbi + 5) / z.vbi), 9);
  });

  it('has a peak field consistent with Gauss’s law and the triangle area = Vbi − Va', () => {
    const j = solveJunction({ ...base, va: -2 });
    expect(j.eMax).toBeCloseTo((Q * 1e16 * j.xp) / EPS_SI, 6);
    expect((j.eMax * j.w) / 2).toBeCloseTo(j.vj, 6);
  });

  it('obeys the mass-action law: n·p = ni² on each side', () => {
    const j = solveJunction({ na: 1e17, nd: 1e15, va: 0 });
    expect(j.pP * j.nP).toBeCloseTo(NI_SI * NI_SI, -5);
    expect(j.nN * j.pN).toBeCloseTo(NI_SI * NI_SI, -5);
  });
});

describe('diodes', () => {
  it('pass 10 mA at their rated forward voltage', () => {
    for (const d of Object.values(DIODES)) expect(diodeCurrent(d, d.vf)).toBeCloseTo(0.01, 6);
  });

  it('LED forward voltage is close to the photon energy hc/λ', () => {
    for (const k of ['red', 'green', 'blue'] as const) {
      const d = DIODES[k];
      const ev = 1239.84 / (d.wavelength ?? 1);
      expect(Math.abs(d.vf - ev)).toBeLessThan(0.25);
    }
  });

  it('solves 5 V through 430 Ω with all three models, close to one another', () => {
    const si = DIODES.si;
    const ideal = solveDiodeCircuit(si, 'ideal', 5, 430);
    const drop = solveDiodeCircuit(si, 'drop', 5, 430);
    const exp = solveDiodeCircuit(si, 'exp', 5, 430);
    expect(ideal.id).toBeCloseTo(5 / 430, 12);
    expect(drop.id).toBeCloseTo(4.3 / 430, 12);
    expect(exp.vd).toBeGreaterThan(0.66);
    expect(exp.vd).toBeLessThan(0.72);
    // Kirchhoff: the source voltage splits across R and the diode.
    expect(exp.vr + exp.vd).toBeCloseTo(5, 9);
    expect(diodeCurrent(si, exp.vd)).toBeCloseTo(exp.id, 9);
  });

  it('blocks in reverse: only the tiny saturation current flows', () => {
    const r = solveDiodeCircuit(DIODES.si, 'exp', -5, 1000);
    expect(r.id).toBeLessThan(0);
    expect(Math.abs(r.id)).toBeLessThan(1e-12);
    expect(r.vd).toBeCloseTo(-5, 6);
    expect(r.conducting).toBe(false);
  });
});

describe('NPN transistor', () => {
  it('follows IC = β·IB in the active region', () => {
    const r = solveBjt(2, 100_000, 12, 2200, 100);
    expect(r.region).toBe('active');
    expect(r.vbe).toBeGreaterThan(0.55);
    expect(r.vbe).toBeLessThan(0.7);
    expect(r.ic / r.ib).toBeGreaterThan(100);
    expect(r.ic / r.ib).toBeLessThan(110);
    expect(r.vce).toBeCloseTo(12 - r.ic * 2200, 6);
  });

  it('saturates when β·IB asks for more than the collector circuit can pass', () => {
    const r = solveBjt(5, 10_000, 12, 2200, 100);
    expect(r.region).toBe('saturation');
    expect(r.vce).toBeLessThan(0.3);
    expect(r.ic).toBeLessThan(r.icSat * 1.05);
    expect(r.betaForced).toBeLessThan(100);
  });

  it('is cut off with no base drive', () => {
    const r = solveBjt(0, 100_000, 12, 2200, 100);
    expect(r.region).toBe('cutoff');
    expect(r.vce).toBeCloseTo(12, 3);
  });

  it('output curves are flat-ish in active and fall to zero at VCE = 0', () => {
    expect(collectorCurrent(100, 20e-6, 0)).toBe(0);
    const a = collectorCurrent(100, 20e-6, 5);
    const b = collectorCurrent(100, 20e-6, 10);
    expect(a).toBeCloseTo(2e-3 * 1.05, 4);
    expect(b / a).toBeCloseTo(110 / 105, 3);
  });
});

describe('common-emitter amplifier', () => {
  const P: AmpParams = {
    vcc: 12,
    r1: 100_000,
    r2: 22_000,
    rc: 4700,
    re: 1000,
    rl: 10_000,
    beta: 100,
    bypass: true,
  };

  it('biases mid-supply: IC ≈ 1.2 mA, VCE ≈ 5 V, active', () => {
    const q = solveAmp(P);
    expect(q.ic * 1e3).toBeGreaterThan(1.1);
    expect(q.ic * 1e3).toBeLessThan(1.35);
    expect(q.vce).toBeGreaterThan(4);
    expect(q.vce).toBeLessThan(6);
    expect(q.saturated).toBe(false);
    expect(q.vb - q.ve).toBeCloseTo(q.vbe, 9);
  });

  it('gains about −RC∥RL / re bypassed, and only about −RC∥RL / RE without', () => {
    const q = solveAmp(P);
    expect(q.gain).toBeCloseTo((-(100 / 101) * q.rac) / q.re0, 9);
    expect(q.gain).toBeLessThan(-100);
    const u = solveAmp({ ...P, bypass: false });
    expect(u.gain).toBeGreaterThan(-3.3);
    expect(u.gain).toBeLessThan(-2.9);
  });

  it('matches the small-signal gain for tiny inputs and inverts', () => {
    const q = solveAmp(P);
    const vin = 0.1e-3;
    const out = (ampOutput(P, q, vin) - ampOutput(P, q, -vin)) / (2 * vin);
    expect(out / q.gain).toBeCloseTo(1, 2);
  });

  it('clips at cutoff and at saturation for large inputs', () => {
    const q = solveAmp(P);
    expect(ampOutput(P, q, -0.5)).toBeCloseTo(q.swingUp, 6);
    expect(ampOutput(P, q, 0.5)).toBeCloseTo(-q.swingDown, 9);
    expect(q.swingDown).toBeCloseTo(q.vce - VCE_SAT, 12);
  });

  it('reports a saturated bias point instead of a gain', () => {
    const q = solveAmp({ ...P, r1: 10_000 });
    expect(q.saturated).toBe(true);
    expect(q.gain).toBe(0);
  });
});
