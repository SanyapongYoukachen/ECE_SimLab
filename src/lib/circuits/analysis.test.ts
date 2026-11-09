import { describe, it, expect } from 'vitest';
import {
  loadCurrentDirect,
  powerSweep,
  solveThevenin,
  solveTwoSource,
  terminalVoltage,
} from './analysis';

describe('Thévenin and Norton equivalents', () => {
  it('matches the hand calculation for 9 V, 220 Ω, 470 Ω, 330 Ω', () => {
    const th = solveThevenin(9, 220, 470, 330, 1000);
    expect(th.vth).toBeCloseTo((9 * 470) / 690, 12);
    expect(th.rth).toBeCloseTo((220 * 470) / 690 + 330, 9);
    expect(th.iN).toBeCloseTo(th.vth / th.rth, 12);
  });

  it('gives the load exactly the current the original circuit does, for any load', () => {
    for (const rl of [10, 100, 480, 1000, 2200]) {
      const th = solveThevenin(12, 330, 1000, 150, rl);
      expect(th.il).toBeCloseTo(loadCurrentDirect(12, 330, 1000, 150, rl), 12);
      // Norton: IN splits between Rth and RL.
      expect((th.iN * th.rth) / (th.rth + rl)).toBeCloseTo(th.il, 12);
    }
  });

  it('puts every operating point on the terminal line V = Vth − I·Rth', () => {
    const th = solveThevenin(9, 220, 470, 330, 680);
    expect(terminalVoltage(th, th.il)).toBeCloseTo(th.vl, 12);
    expect(terminalVoltage(th, 0)).toBe(th.vth);
    expect(terminalVoltage(th, th.iN)).toBeCloseTo(0, 12);
  });

  it('transfers maximum power when RL = Rth', () => {
    const th = solveThevenin(9, 220, 470, 330, 1000);
    const matched = solveThevenin(9, 220, 470, 330, th.rth);
    expect(matched.pl).toBeCloseTo(th.pmax, 12);
    const sweep = powerSweep(th, 10, 2200, 2001);
    const best = sweep.p.indexOf(Math.max(...sweep.p));
    expect(Math.abs(sweep.rl[best] - th.rth)).toBeLessThan(2);
  });
});

describe('mesh and nodal analysis', () => {
  it('agree with each other', () => {
    const r = solveTwoSource(9, 5, 220, 470, 330);
    expect(r.i1).toBeCloseTo(r.iR1, 12);
    expect(r.i2).toBeCloseTo(r.iR3, 12);
    expect(r.i1 - r.i2).toBeCloseTo(r.iR2, 12);
    expect(9 - r.i1 * 220).toBeCloseTo(r.va, 12);
  });

  it('satisfy KCL at A and conserve power', () => {
    const r = solveTwoSource(12, 3, 100, 1000, 220);
    expect(r.iR1 - r.iR2 - r.iR3).toBeCloseTo(0, 12);
    expect(r.pV1 + r.pV2).toBeCloseTo(r.pR, 12);
  });

  it('reduce to a divider when V2 is shorted to 0 V', () => {
    const r = solveTwoSource(10, 0, 1000, 1000, 1000);
    // R2 ‖ R3 = 500 Ω below R1 = 1 kΩ.
    expect(r.va).toBeCloseTo(10 / 3, 12);
  });

  it('shows the weaker source being charged: it absorbs power', () => {
    const r = solveTwoSource(12, 1, 100, 2200, 100);
    expect(r.iR3).toBeGreaterThan(0);
    expect(r.pV2).toBeLessThan(0);
  });
});
