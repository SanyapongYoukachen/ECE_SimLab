import { describe, it, expect } from 'vitest';
import {
  ADC_LEVELS,
  LDR_R_DARK,
  NTC_ACTIVATION_EV,
  R_FIXED,
  SUPPLY_V,
  adcCode,
  boltzmannFactor,
  dividerOut,
  isAbsorbed,
  ldrLuxFromResistance,
  ldrResistance,
  ntcCelsiusFromResistance,
  ntcResistance,
  photonEnergyEv,
  photonRate,
  quantityFromCode,
  readChain,
  scenarioQuantity,
  SCENARIO_PERIOD,
  sweepChain,
  thermalEnergyEv,
} from './transducer';

describe('LDR physics', () => {
  it('absorbs visible photons above the 1.8 eV gap and passes infrared', () => {
    expect(photonEnergyEv('blue')).toBeCloseTo(2.755, 2);
    expect(photonEnergyEv('green')).toBeCloseTo(2.234, 2);
    expect(photonEnergyEv('red')).toBeCloseTo(1.907, 2);
    expect(photonEnergyEv('ir')).toBeCloseTo(1.319, 2);
    expect(isAbsorbed('blue')).toBe(true);
    expect(isAbsorbed('green')).toBe(true);
    expect(isAbsorbed('red')).toBe(true);
    expect(isAbsorbed('ir')).toBe(false);
  });

  it('falls from about 10 kΩ at 100 lx toward a few hundred ohms in sunlight', () => {
    expect(ldrResistance(100, 'green')).toBeCloseTo(9901, 0);
    expect(ldrResistance(10_000, 'green')).toBeLessThan(500);
    expect(ldrResistance(1, 'green')).toBeGreaterThan(150_000);
  });

  it('gives the same resistance for any absorbed colour, but stays dark under infrared', () => {
    expect(ldrResistance(500, 'blue')).toBe(ldrResistance(500, 'red'));
    expect(ldrResistance(10_000, 'ir')).toBe(LDR_R_DARK);
  });

  it('inverts its own model', () => {
    for (const lux of [1, 30, 100, 2500, 10_000]) {
      expect(ldrLuxFromResistance(ldrResistance(lux, 'green'))).toBeCloseTo(lux, 6);
    }
    expect(ldrLuxFromResistance(LDR_R_DARK * 2)).toBe(0);
  });

  it('counts photons: about 8 × 10¹² per second at 100 lx on a 20 mm² film', () => {
    expect(photonRate(100)).toBeCloseTo(8.18e12, -10);
  });
});

describe('NTC thermistor physics', () => {
  it('has an activation energy of about 0.34 eV, far above kT', () => {
    expect(NTC_ACTIVATION_EV).toBeCloseTo(0.3404, 3);
    expect(thermalEnergyEv(25)).toBeCloseTo(0.02569, 4);
  });

  it('frees more electrons as it warms: the Boltzmann factor grows steeply', () => {
    expect(boltzmannFactor(80) / boltzmannFactor(25)).toBeCloseTo(
      ntcResistance(25) / ntcResistance(80),
      6
    );
  });

  it('inverts the beta model', () => {
    for (const c of [-20, 0, 25, 60, 100]) {
      expect(ntcCelsiusFromResistance(ntcResistance(c))).toBeCloseTo(c, 9);
    }
  });
});

describe('measurement chain', () => {
  it('puts the reference point near mid-scale', () => {
    const ntc = readChain({ sensor: 'ntc', quantity: 25, color: 'green' });
    expect(ntc.resistance).toBeCloseTo(10_000, 6);
    expect(ntc.vout).toBeCloseTo(2.5, 9);
    expect(ntc.code).toBe(512);
    expect(ntc.carriers).toBeCloseTo(1, 9);
    expect(ntc.current).toBeCloseTo(250e-6, 12);
    expect(ntc.electronsPerSecond).toBeCloseTo(1.56e15, -13);
  });

  it('keeps Kirchhoff: sensor voltage plus Vout is the supply', () => {
    const r = readChain({ sensor: 'ldr', quantity: 700, color: 'blue' });
    expect(r.sensorVoltage + r.vout).toBeCloseTo(SUPPLY_V, 12);
    expect(r.current * (r.resistance + R_FIXED)).toBeCloseTo(SUPPLY_V, 12);
  });

  it('raises Vout with more light and with more heat', () => {
    const ldr = sweepChain('ldr', 'green');
    const ntc = sweepChain('ntc', 'green');
    for (const s of [ldr, ntc]) {
      for (let i = 1; i < s.vouts.length; i++) expect(s.vouts[i]).toBeGreaterThan(s.vouts[i - 1]);
    }
  });

  it('clamps the ADC to its codes', () => {
    expect(adcCode(-1)).toBe(0);
    expect(adcCode(SUPPLY_V)).toBe(ADC_LEVELS - 1);
    expect(adcCode(dividerOut(R_FIXED))).toBe(512);
  });

  it('measures the quantity back to within one ADC step', () => {
    for (const c of [-20, 0, 25, 50, 100]) {
      const r = readChain({ sensor: 'ntc', quantity: c, color: 'green' });
      expect(Math.abs(r.measured - c)).toBeLessThanOrEqual(r.resolution);
    }
    // One step is ~0.1 °C near room temperature but much coarser at the cold end.
    const cold = readChain({ sensor: 'ntc', quantity: -20, color: 'green' });
    const room = readChain({ sensor: 'ntc', quantity: 25, color: 'green' });
    expect(room.resolution).toBeLessThan(0.15);
    expect(cold.resolution).toBeGreaterThan(room.resolution * 2);
  });

  it('reads near-darkness under infrared, however bright', () => {
    const r = readChain({ sensor: 'ldr', quantity: 10_000, color: 'ir' });
    expect(r.measured).toBeLessThan(0.01);
    expect(quantityFromCode('ldr', 0)).toBe(0);
  });
});

describe('scenario', () => {
  it('sweeps each sensor through its range and repeats', () => {
    expect(scenarioQuantity('ldr', 0)).toBeCloseTo(1, 9);
    expect(scenarioQuantity('ldr', SCENARIO_PERIOD / 2)).toBeCloseTo(10_000, 6);
    expect(scenarioQuantity('ntc', 0)).toBeCloseTo(-10, 9);
    expect(scenarioQuantity('ntc', SCENARIO_PERIOD / 2)).toBeCloseTo(80, 9);
    expect(scenarioQuantity('ntc', SCENARIO_PERIOD)).toBeCloseTo(-10, 9);
  });
});
