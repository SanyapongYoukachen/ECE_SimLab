import { describe, it, expect } from 'vitest';
import {
  generatorInstant,
  instant,
  solveGenerator,
  solveThreePhase,
  totalPower,
} from './generator';

const BASE = { turns: 100, flux: 0.5, area: 0.01, rpm: 3000, poles: 2, rLoad: 100, ra: 1 };

describe('single-phase generator', () => {
  it('gives 157 V peak and 50 Hz for 100 turns, 0.5 T, 0.01 m², 3000 rpm, 2 poles', () => {
    const g = solveGenerator(BASE);
    expect(g.frequency).toBeCloseTo(50, 12);
    expect(g.ePeak).toBeCloseTo(157.08, 2);
    expect(g.eRms).toBeCloseTo(111.07, 2);
    expect(g.vRms).toBeCloseTo(109.97, 2);
    expect(g.iRms).toBeCloseTo(1.0997, 4);
    expect(g.pLoad).toBeCloseTo(120.9, 1);
  });

  it('follows f = P·n/120: four poles at 1500 rpm is still 50 Hz, with the same EMF', () => {
    const g4 = solveGenerator({ ...BASE, poles: 4, rpm: 1500 });
    expect(g4.frequency).toBeCloseTo(50, 12);
    expect(g4.ePeak).toBeCloseTo(solveGenerator(BASE).ePeak, 9);
  });

  it('balances energy: shaft power = load power + armature loss', () => {
    const g = solveGenerator({ ...BASE, ra: 10 });
    expect(g.torque * g.omegaM).toBeCloseTo(g.pLoad + g.iRms ** 2 * 10, 9);
    expect(g.efficiency).toBeCloseTo(100 / 110, 12);
  });

  it('is e = −dλ/dt: the EMF peaks where the flux through the coil crosses zero', () => {
    const g = solveGenerator(BASE);
    const at0 = generatorInstant(g, 0);
    const at90 = generatorInstant(g, Math.PI / 2);
    expect(at0.lambda).toBeCloseTo(g.linkage, 12);
    expect(at0.e).toBeCloseTo(0, 12);
    expect(at90.lambda).toBeCloseTo(0, 12);
    expect(at90.e).toBeCloseTo(g.ePeak, 12);
    // Numerical derivative of −λ(θ) × ωe matches e.
    const h = 1e-6;
    const th = 1.1;
    const dl = (generatorInstant(g, th + h).lambda - generatorInstant(g, th - h).lambda) / (2 * h);
    expect(-dl * g.omegaE).toBeCloseTo(generatorInstant(g, th).e, 4);
  });

  it('makes nothing when stopped', () => {
    const g = solveGenerator({ ...BASE, rpm: 0 });
    expect(g.ePeak).toBe(0);
    expect(g.torque).toBe(0);
  });
});

describe('three phase', () => {
  const Y = { vPhase: 230, frequency: 50, r: 20, x: 0, unbalance: 1, connection: 'wye' as const };

  it('has line voltage √3 × phase voltage, leading by 30°', () => {
    const r = solveThreePhase(Y);
    expect(r.vLine.a.mag).toBeCloseTo(230 * Math.sqrt(3), 9);
    expect(r.vLine.a.angle - r.vPhase.a.angle).toBeCloseTo(Math.PI / 6, 9);
  });

  it('balanced Y: no neutral current and constant total power', () => {
    const r = solveThreePhase({ ...Y, x: 15 });
    expect(r.iNeutral.mag).toBeLessThan(1e-9);
    const w = 2 * Math.PI * 50;
    for (const t of [0, 0.0013, 0.007, 0.0151]) expect(totalPower(r, w, t)).toBeCloseTo(r.p, 6);
    expect(r.p).toBeCloseTo(3 * 230 * r.iLine.a.mag * Math.cos(Math.atan2(15, 20)), 6);
  });

  it('unbalanced Y sends the difference home through the neutral', () => {
    const r = solveThreePhase({ ...Y, unbalance: 0.5 });
    // Ia = 23 A, Ib = Ic = 11.5 A → In = 11.5 A.
    expect(r.iLine.a.mag).toBeCloseTo(23, 9);
    expect(r.iNeutral.mag).toBeCloseTo(11.5, 9);
  });

  it('balanced Δ: line current √3 × phase current, and 3× the power of the same loads in Y', () => {
    const d = solveThreePhase({ ...Y, connection: 'delta' });
    const y = solveThreePhase(Y);
    expect(d.iLine.a.mag).toBeCloseTo(Math.sqrt(3) * d.iLoad.a.mag, 9);
    expect(d.p).toBeCloseTo(3 * y.p, 6);
    expect(d.iNeutral.mag).toBe(0);
  });

  it('currents at any instant sum to zero in a balanced system', () => {
    const r = solveThreePhase({ ...Y, x: 30 });
    const w = 2 * Math.PI * 50;
    const t = 0.0042;
    const sum = instant(r.iLine.a, w, t) + instant(r.iLine.b, w, t) + instant(r.iLine.c, w, t);
    expect(sum).toBeCloseTo(0, 9);
  });
});
