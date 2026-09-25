import { describe, it, expect } from 'vitest';
import {
  SENSORS,
  SENSOR_IDS,
  BRIDGE_ARMS,
  quarterBridgeArms,
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
        const r = quarterBridgeArms(s, arm, s.reference);
        const b = solveWheatstoneBridge(5, r.r1, r.r2, r.r3, r.r4, 100);
        expect(b.balanced).toBe(true);
        expect(b.ig).toBeCloseTo(0, 12);
      }
    }
  });

  it('flips output polarity between the R1/R4 and R2/R3 arm positions', () => {
    const s = SENSORS.strain;
    const sign = (arm: 'r1' | 'r2' | 'r3' | 'r4'): number => {
      const r = quarterBridgeArms(s, arm, 1000);
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
