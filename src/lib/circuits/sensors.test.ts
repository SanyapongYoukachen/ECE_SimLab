import { describe, it, expect } from 'vitest';
import {
  SENSORS,
  SENSOR_IDS,
  BRIDGE_ARMS,
  BRIDGE_CONFIGS,
  armRoles,
  bridgeArms,
  mirroredQuantity,
  relativeSensitivity,
  referenceResistance,
  sampleQuantities,
} from './sensors';
import { solveWheatstoneBridge } from './wheatstone';

describe('sensor models', () => {
  it('LDR resistance falls as light rises, 10 kΩ at 100 lux', () => {
    const ldr = SENSORS.ldr;
    expect(ldr.resistance(100)).toBeCloseTo(10_000, 6);
    expect(ldr.resistance(10)).toBeGreaterThan(ldr.resistance(100));
    expect(ldr.resistance(1000)).toBeLessThan(ldr.resistance(100));
    // One decade of light changes R by 10^0.7 ≈ 5.01×.
    expect(ldr.resistance(10) / ldr.resistance(100)).toBeCloseTo(Math.pow(10, 0.7), 6);
  });

  it('NTC is 10 kΩ at 25 °C and falls with temperature (≈ −4.4 %/K near 25 °C)', () => {
    const ntc = SENSORS.ntc;
    expect(ntc.resistance(25)).toBeCloseTo(10_000, 6);
    expect(ntc.resistance(0)).toBeGreaterThan(ntc.resistance(25));
    expect(ntc.resistance(50)).toBeLessThan(ntc.resistance(25));
    const slope = (ntc.resistance(26) - ntc.resistance(24)) / 2 / 10_000;
    expect(slope).toBeCloseTo(-0.044, 2);
  });

  it('Pt100 matches IEC 60751 table values', () => {
    const rtd = SENSORS.rtd;
    expect(rtd.resistance(0)).toBeCloseTo(100, 6);
    expect(rtd.resistance(100)).toBeCloseTo(138.5055, 3);
    expect(rtd.resistance(200)).toBeCloseTo(175.856, 2);
  });

  it('strain gauge changes by GF·ε: +1000 µε → +0.2 %', () => {
    const g = SENSORS.strain;
    expect(g.resistance(0)).toBeCloseTo(350, 9);
    expect(g.resistance(1000)).toBeCloseTo(350 * 1.002, 9);
    expect(g.resistance(-1000)).toBeCloseTo(350 * 0.998, 9);
  });

  it('every sensor sits at its reference inside its own range', () => {
    for (const id of SENSOR_IDS) {
      const s = SENSORS[id];
      expect(s.reference).toBeGreaterThanOrEqual(s.min);
      expect(s.reference).toBeLessThanOrEqual(s.max);
      expect(referenceResistance(s)).toBeGreaterThan(0);
    }
  });
});

describe('quarter bridge', () => {
  it('is balanced at the reference reading, whichever arm holds the sensor', () => {
    for (const id of SENSOR_IDS) {
      const s = SENSORS[id];
      for (const arm of BRIDGE_ARMS) {
        const r = bridgeArms(s, 'quarter', arm, s.reference);
        const b = solveWheatstoneBridge(5, r.r1, r.r2, r.r3, r.r4, 100);
        expect(b.balanced).toBe(true);
        expect(b.ig).toBeCloseTo(0, 12);
      }
    }
  });

  it('flips output polarity between the R1/R4 and R2/R3 arm positions', () => {
    const s = SENSORS.strain;
    const sign = (arm: 'r1' | 'r2' | 'r3' | 'r4'): number => {
      const r = bridgeArms(s, 'quarter', arm, 1000);
      return Math.sign(solveWheatstoneBridge(5, r.r1, r.r2, r.r3, r.r4, 100).ig);
    };
    expect(sign('r1')).toBe(sign('r4'));
    expect(sign('r2')).toBe(sign('r3'));
    expect(sign('r1')).toBe(-sign('r2'));
  });

  it('samples log-spaced light levels across four decades', () => {
    const qs = sampleQuantities(SENSORS.ldr, 5);
    expect(qs[0]).toBeCloseTo(1, 9);
    expect(qs[2]).toBeCloseTo(100, 9);
    expect(qs[4]).toBeCloseTo(10_000, 6);
  });
});

describe('quarter, half and full bridges', () => {
  const open = 1e12; // galvanometer resistance → effectively open-circuit output

  function output(config: 'quarter' | 'half' | 'full', q: number, rg = open): number {
    const r = bridgeArms(SENSORS.strain, config, 'r4', q);
    const b = solveWheatstoneBridge(10, r.r1, r.r2, r.r3, r.r4, rg);
    return b.vb - b.vc;
  }

  it('assigns one, two and four active arms, partners changing oppositely', () => {
    expect(armRoles('quarter', 'r4')).toEqual({
      r1: 'fixed',
      r2: 'fixed',
      r3: 'fixed',
      r4: 'plus',
    });
    expect(armRoles('half', 'r4')).toEqual({ r1: 'fixed', r2: 'fixed', r3: 'minus', r4: 'plus' });
    expect(armRoles('full', 'r4')).toEqual({ r1: 'plus', r2: 'minus', r3: 'minus', r4: 'plus' });
    expect(armRoles('half', 'r1')).toEqual({ r1: 'plus', r2: 'minus', r3: 'fixed', r4: 'fixed' });
  });

  it('mirrors linear readings about the reference and light on its log axis', () => {
    expect(mirroredQuantity(SENSORS.strain, 800)).toBe(-800);
    expect(mirroredQuantity(SENSORS.ntc, 40)).toBe(10);
    expect(mirroredQuantity(SENSORS.ldr, 1000)).toBeCloseTo(10, 9);
  });

  it('balances at the reference for every configuration, sensor and arm', () => {
    for (const config of BRIDGE_CONFIGS) {
      for (const id of SENSOR_IDS) {
        for (const arm of BRIDGE_ARMS) {
          const s = SENSORS[id];
          const r = bridgeArms(s, config, arm, s.reference);
          expect(solveWheatstoneBridge(5, r.r1, r.r2, r.r3, r.r4, 100).balanced).toBe(true);
        }
      }
    }
  });

  it('has 1 : 2 : 4 small-signal sensitivity (open circuit)', () => {
    const args = [SENSORS.strain, 'r4', 10, open] as const;
    expect(relativeSensitivity(args[0], 'quarter', args[1], args[2], args[3])).toBeCloseTo(1, 6);
    expect(relativeSensitivity(args[0], 'half', args[1], args[2], args[3])).toBeCloseTo(2, 3);
    expect(relativeSensitivity(args[0], 'full', args[1], args[2], args[3])).toBeCloseTo(4, 3);
  });

  it('matches the textbook outputs V/4·x, V/2·x and V·x for ΔR/R = x', () => {
    const x = 2.0 * 1000e-6; // GF · ε at 1000 µε
    expect(Math.abs(output('full', 1000))).toBeCloseTo(10 * x, 9);
    expect(Math.abs(output('half', 1000))).toBeCloseTo((10 / 2) * x, 9);
    // Quarter: V·x / (2·(2 + x)) — the exact form, slightly below V/4·x.
    expect(Math.abs(output('quarter', 1000))).toBeCloseTo((10 * x) / (2 * (2 + x)), 10);
  });

  it('is exactly linear for half and full bridges, but not for a quarter bridge', () => {
    for (const config of ['half', 'full'] as const) {
      expect(output(config, 2000) / output(config, 1000)).toBeCloseTo(2, 9);
    }
    const quarterRatio = output('quarter', 2000) / output('quarter', 1000);
    expect(Math.abs(quarterRatio - 2)).toBeGreaterThan(1e-4);
  });

  it('adds every active arm in the same direction, never cancelling', () => {
    for (const arm of BRIDGE_ARMS) {
      const sign = (config: 'quarter' | 'half' | 'full'): number => {
        const r = bridgeArms(SENSORS.rtd, config, arm, 80);
        return Math.sign(solveWheatstoneBridge(5, r.r1, r.r2, r.r3, r.r4, 100).ig);
      };
      expect(sign('half')).toBe(sign('quarter'));
      expect(sign('full')).toBe(sign('quarter'));
    }
  });
});
