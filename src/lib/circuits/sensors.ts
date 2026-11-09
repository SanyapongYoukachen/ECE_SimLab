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
    // Symmetric about the 1 kΩ reference, so a half/full bridge's mirrored arm stays in range.
    max: 1990,
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

/** How many arms are active sensors: one, two (push-pull), or all four. */
export type BridgeConfig = 'quarter' | 'half' | 'full';

export const BRIDGE_CONFIGS: readonly BridgeConfig[] = ['quarter', 'half', 'full'];

/**
 * What an arm does in a given configuration: 'fixed' (a completion resistor
 * at the reference value), 'plus' (a sensor seeing the reading), or 'minus'
 * (a sensor seeing the mirrored reading — the gauge in compression while
 * its partner is in tension).
 */
export type ArmRole = 'fixed' | 'plus' | 'minus';

/** The other arm in the same divider: R1–R2 on the left, R3–R4 on the right. */
const ADJACENT: Readonly<Record<BridgeArm, BridgeArm>> = { r1: 'r2', r2: 'r1', r3: 'r4', r4: 'r3' };
/** The diagonally opposite arm: R1–R4 and R2–R3 pull the output the same way. */
const OPPOSITE: Readonly<Record<BridgeArm, BridgeArm>> = { r1: 'r4', r4: 'r1', r2: 'r3', r3: 'r2' };

/**
 * Arm roles for each configuration, built so every active arm's change adds
 * to the output rather than cancelling. `arm` is the primary sensor's arm.
 *  - quarter: only `arm` is active.
 *  - half: `arm` plus its divider partner, changing oppositely.
 *  - full: `arm` and its opposite arm change together; the other two oppositely.
 */
export function armRoles(
  config: BridgeConfig,
  arm: BridgeArm
): Readonly<Record<BridgeArm, ArmRole>> {
  const roles: Record<BridgeArm, ArmRole> = { r1: 'fixed', r2: 'fixed', r3: 'fixed', r4: 'fixed' };
  roles[arm] = 'plus';
  if (config === 'half' || config === 'full') roles[ADJACENT[arm]] = 'minus';
  if (config === 'full') {
    roles[OPPOSITE[arm]] = 'plus';
    roles[OPPOSITE[ADJACENT[arm]]] = 'minus';
  }
  return roles;
}

/**
 * The reading a 'minus' arm sees: reflected about the reference. Linear
 * quantities mirror arithmetically (−ε, or 2·T_ref − T); light mirrors on
 * its log axis (E_ref² / E), the way a differential pair of LDRs splits a
 * light change between them.
 */
export function mirroredQuantity(sensor: SensorModel, quantity: number): number {
  return sensor.logQuantity
    ? (sensor.reference * sensor.reference) / Math.max(quantity, 1e-9)
    : 2 * sensor.reference - quantity;
}

/** The four arm resistances: active arms follow the sensor, fixed arms sit at its reference value. */
export function bridgeArms(
  sensor: SensorModel,
  config: BridgeConfig,
  arm: BridgeArm,
  quantity: number
): Readonly<Record<BridgeArm, number>> {
  const roles = armRoles(config, arm);
  const plus = sensor.resistance(quantity);
  const minus = sensor.resistance(mirroredQuantity(sensor, quantity));
  const fixed = referenceResistance(sensor);
  const pick = (a: BridgeArm): number =>
    roles[a] === 'plus' ? plus : roles[a] === 'minus' ? minus : fixed;
  return { r1: pick('r1'), r2: pick('r2'), r3: pick('r3'), r4: pick('r4') };
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
  /** The primary ('plus') sensor's resistance at each quantity. */
  readonly resistances: number[];
  /** Bridge output VB − VC at each quantity. */
  readonly outputs: number[];
  readonly currents: number[];
  /** Largest |Ig| anywhere in the range — sets the meter's auto-range. */
  readonly maxCurrent: number;
}

/** A bridge configuration's response across the sensor's whole range, for plotting and auto-ranging. */
export function bridgeSweep(
  sensor: SensorModel,
  config: BridgeConfig,
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
    const r = bridgeArms(sensor, config, arm, q);
    const b = solveWheatstoneBridge(voltage, r.r1, r.r2, r.r3, r.r4, rg);
    resistances.push(sensor.resistance(q));
    outputs.push(b.vb - b.vc);
    currents.push(b.ig);
    maxCurrent = Math.max(maxCurrent, Math.abs(b.ig));
  }
  return { quantities, resistances, outputs, currents, maxCurrent };
}

/**
 * Small-signal sensitivity relative to the quarter bridge, from the output's
 * slope at the reference point: ideally 1, 2 and 4 for quarter, half and
 * full; the galvanometer's loading pulls the real ratios slightly off that.
 */
export function relativeSensitivity(
  sensor: SensorModel,
  config: BridgeConfig,
  arm: BridgeArm,
  voltage: number,
  rg: number
): number {
  const h = sensor.logQuantity ? sensor.reference * 1e-3 : (sensor.max - sensor.min) * 1e-4;
  const slope = (c: BridgeConfig): number => {
    const out = (q: number): number => {
      const r = bridgeArms(sensor, c, arm, q);
      const b = solveWheatstoneBridge(voltage, r.r1, r.r2, r.r3, r.r4, rg);
      return b.vb - b.vc;
    };
    return (out(sensor.reference + h) - out(sensor.reference - h)) / (2 * h);
  };
  const quarter = slope('quarter');
  return quarter === 0 ? 0 : slope(config) / quarter;
}
