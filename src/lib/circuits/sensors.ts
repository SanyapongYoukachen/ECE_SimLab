import { solveWheatstoneBridge } from './wheatstone';

/**
 * Resistive sensor models for the Wheatstone bridge's sensing mode. Each one
 * maps a physical quantity to a resistance; the bridge's three fixed arms are
 * set to the sensor's resistance at its reference point, so the bridge reads
 * zero there (a quarter bridge) and any departure shows up as imbalance.
 */

export type SensorId = 'ldr' | 'ntc' | 'rtd' | 'strain' | 'pot';

export const SENSOR_IDS: readonly SensorId[] = ['ldr', 'ntc', 'rtd', 'strain', 'pot'];

export interface SensorModel {
  readonly id: SensorId;
  /** Range and reference of the physical quantity, in the model's own unit. */
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly reference: number;
  /** Plot/slider the quantity on a log10 axis (light spans four decades). */
  readonly logQuantity: boolean;
  /** Plot resistance on a log10 axis (exponential responses). */
  readonly logResistance: boolean;
  resistance(quantity: number): number;
}

const KELVIN = 273.15;

/** CdS light-dependent resistor: R = R_ref · (E / E_ref)^(−γ). Typical GL55xx-class values. */
export const LDR_R_REF = 10_000;
export const LDR_LUX_REF = 100;
export const LDR_GAMMA = 0.7;

/** NTC thermistor, beta model: R = R25 · exp(B · (1/T − 1/T25)). */
export const NTC_R25 = 10_000;
export const NTC_BETA = 3950;

/** Pt100 RTD, Callendar–Van Dusen for T ≥ 0 °C (IEC 60751 coefficients), extended below 0 without the C term. */
export const RTD_R0 = 100;
export const RTD_A = 3.9083e-3;
export const RTD_B = -5.775e-7;

/** Metal-foil strain gauge: R = R0 · (1 + GF · ε). */
export const STRAIN_R0 = 350;
export const STRAIN_GAUGE_FACTOR = 2.0;

export const SENSORS: Readonly<Record<SensorId, SensorModel>> = {
  ldr: {
    id: 'ldr',
    min: 1,
    max: 10_000,
    step: 0.05, // in log10(lux) — see logQuantity
    reference: LDR_LUX_REF,
    logQuantity: true,
    logResistance: true,
    resistance: (lux) => LDR_R_REF * Math.pow(Math.max(lux, 1e-6) / LDR_LUX_REF, -LDR_GAMMA),
  },
  ntc: {
    id: 'ntc',
    min: -20,
    max: 100,
    step: 1,
    reference: 25,
    logQuantity: false,
    logResistance: true,
    resistance: (celsius) =>
      NTC_R25 * Math.exp(NTC_BETA * (1 / (celsius + KELVIN) - 1 / (25 + KELVIN))),
  },
  rtd: {
    id: 'rtd',
    min: -50,
    max: 200,
    step: 1,
    reference: 0,
    logQuantity: false,
    logResistance: false,
    resistance: (celsius) => RTD_R0 * (1 + RTD_A * celsius + RTD_B * celsius * celsius),
  },
  strain: {
    id: 'strain',
    min: -2000,
    max: 2000,
    step: 50, // microstrain
    reference: 0,
    logQuantity: false,
    logResistance: false,
    resistance: (microstrain) => STRAIN_R0 * (1 + STRAIN_GAUGE_FACTOR * microstrain * 1e-6),
  },
  pot: {
    id: 'pot',
    min: 10,
    max: 2200,
    step: 10, // ohms: the "quantity" is the resistance itself
    reference: 1000,
    logQuantity: false,
    logResistance: false,
    resistance: (ohms) => ohms,
  },
};

export function referenceResistance(sensor: SensorModel): number {
  return sensor.resistance(sensor.reference);
}

export type BridgeArm = 'r1' | 'r2' | 'r3' | 'r4';

export const BRIDGE_ARMS: readonly BridgeArm[] = ['r1', 'r2', 'r3', 'r4'];

/**
 * The four arm resistances for a quarter bridge: `arm` holds the sensor at
 * its current reading, the other three sit at the sensor's reference value.
 */
export function quarterBridgeArms(
  sensor: SensorModel,
  arm: BridgeArm,
  quantity: number
): Readonly<Record<BridgeArm, number>> {
  const fixed = referenceResistance(sensor);
  const live = sensor.resistance(quantity);
  return {
    r1: arm === 'r1' ? live : fixed,
    r2: arm === 'r2' ? live : fixed,
    r3: arm === 'r3' ? live : fixed,
    r4: arm === 'r4' ? live : fixed,
  };
}

/** `count` quantity values spanning the sensor's range, log-spaced when the quantity is. */
export function sampleQuantities(sensor: SensorModel, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push(
      sensor.logQuantity
        ? Math.pow(
            10,
            Math.log10(sensor.min) + t * (Math.log10(sensor.max) - Math.log10(sensor.min))
          )
        : sensor.min + t * (sensor.max - sensor.min)
    );
  }
  return out;
}

export interface BridgeSweep {
  readonly quantities: number[];
  readonly resistances: number[];
  /** Bridge output VB − VC at each quantity. */
  readonly outputs: number[];
  readonly currents: number[];
  /** Largest |Ig| anywhere in the range — sets the meter's auto-range. */
  readonly maxCurrent: number;
}

/** The quarter bridge's response across the sensor's whole range, for plotting and auto-ranging. */
export function bridgeSweep(
  sensor: SensorModel,
  arm: BridgeArm,
  voltage: number,
  rg: number,
  count = 81
): BridgeSweep {
  const quantities = sampleQuantities(sensor, count);
  const resistances: number[] = [];
  const outputs: number[] = [];
  const currents: number[] = [];
  let maxCurrent = 0;
  for (const q of quantities) {
    const r = quarterBridgeArms(sensor, arm, q);
    const b = solveWheatstoneBridge(voltage, r.r1, r.r2, r.r3, r.r4, rg);
    resistances.push(sensor.resistance(q));
    outputs.push(b.vb - b.vc);
    currents.push(b.ig);
    maxCurrent = Math.max(maxCurrent, Math.abs(b.ig));
  }
  return { quantities, resistances, outputs, currents, maxCurrent };
}
