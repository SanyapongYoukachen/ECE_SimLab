import { LDR_GAMMA, LDR_LUX_REF, LDR_R_REF, NTC_BETA, NTC_R25, SENSORS } from './sensors';

/**
 * A sensor as a measurement chain, end to end:
 *
 *   physical quantity → free charge carriers in the material → resistance
 *     → voltage (a divider) → ADC code → the quantity, measured back.
 *
 * The resistance models are the Wheatstone module's (lib/circuits/sensors),
 * so both modules agree on what an LDR or thermistor does. What this adds is
 * the physics underneath (why the resistance changes) and the electronics
 * after it (how a microcontroller turns it back into a number).
 */

export type TransducerId = 'ldr' | 'ntc';

export const TRANSDUCER_IDS: readonly TransducerId[] = ['ldr', 'ntc'];

/** Elementary charge, C. */
export const ELECTRON_CHARGE = 1.602176634e-19;
/** Boltzmann constant, eV/K. */
export const BOLTZMANN_EV = 8.617333262e-5;
/** h·c in eV·nm: a photon of wavelength λ nm carries 1239.84/λ eV. */
export const HC_EV_NM = 1239.84193;
export const KELVIN = 273.15;

// ---------------------------------------------------------------------------
// LDR: a CdS/CdSe photoconductor
// ---------------------------------------------------------------------------

/**
 * Band gap of the LDR's CdS/CdSe film. A photon frees an electron only if it
 * carries at least this much energy; the ~690 nm cut-off it implies is why
 * an LDR sees red light but is blind to a TV remote's infrared.
 */
export const LDR_BANDGAP_EV = 1.8;
/** Resistance in total darkness (GL55xx-class parts: ≥ 1 MΩ). */
export const LDR_R_DARK = 1_000_000;
/** Light-sensitive area: a 5 mm LDR's serpentine track covers roughly 20 mm². */
export const LDR_AREA_M2 = 20e-6;
/**
 * Photons per second per m² per lux, for 555 nm light (1 W = 683 lm, and one
 * 555 nm photon is 3.58e-19 J). The level slider sets this photon rate; the
 * colour sets each photon's energy.
 */
export const PHOTONS_PER_LUX_M2 = 4.09e15;

export type LightColor = 'blue' | 'green' | 'red' | 'ir';

export const LIGHT_COLORS: readonly LightColor[] = ['blue', 'green', 'red', 'ir'];

export const WAVELENGTH_NM: Readonly<Record<LightColor, number>> = {
  blue: 450,
  green: 555,
  red: 650,
  ir: 940,
};

export function photonEnergyEv(color: LightColor): number {
  return HC_EV_NM / WAVELENGTH_NM[color];
}

/** Does the film absorb this colour, i.e. is hν ≥ Eg? */
export function isAbsorbed(color: LightColor): boolean {
  return photonEnergyEv(color) >= LDR_BANDGAP_EV;
}

/** Photons landing on the sensor each second. */
export function photonRate(lux: number): number {
  return lux * PHOTONS_PER_LUX_M2 * LDR_AREA_M2;
}

/**
 * LDR resistance: the dark conductance plus the light-generated one, which
 * follows the usual power law R_light = R_ref·(E/E_ref)^−γ. Light the film
 * cannot absorb adds nothing, however bright.
 */
export function ldrResistance(lux: number, color: LightColor): number {
  const dark = 1 / LDR_R_DARK;
  const light = isAbsorbed(color) ? 1 / SENSORS.ldr.resistance(lux) : 0;
  return 1 / (dark + light);
}

/** The light level an LDR resistance implies (inverse of ldrResistance for absorbed light); 0 if no light-generated conductance is left. */
export function ldrLuxFromResistance(ohms: number): number {
  const light = 1 / ohms - 1 / LDR_R_DARK;
  if (light <= 0) return 0;
  return LDR_LUX_REF * Math.pow(light * LDR_R_REF, 1 / LDR_GAMMA);
}

// ---------------------------------------------------------------------------
// NTC thermistor: a metal-oxide semiconductor
// ---------------------------------------------------------------------------

/**
 * Activation energy implied by the beta model: R ∝ exp(B/T) = exp(Ea/kT)
 * with Ea = k·B. For B = 3950 K that's about 0.34 eV — thirteen times the
 * thermal energy kT ≈ 26 meV at room temperature, which is why only a tiny,
 * steeply temperature-dependent fraction of electrons break free.
 */
export const NTC_ACTIVATION_EV = BOLTZMANN_EV * NTC_BETA;

export function ntcResistance(celsius: number): number {
  return SENSORS.ntc.resistance(celsius);
}

/** Inverse beta model: 1/T = 1/T25 + ln(R/R25)/B. */
export function ntcCelsiusFromResistance(ohms: number): number {
  const invT = 1 / (25 + KELVIN) + Math.log(ohms / NTC_R25) / NTC_BETA;
  return 1 / invT - KELVIN;
}

/** Thermal energy kT at a temperature, in eV. */
export function thermalEnergyEv(celsius: number): number {
  return BOLTZMANN_EV * (celsius + KELVIN);
}

/** exp(−Ea/kT): the Boltzmann factor setting how many electrons have enough energy to break free. */
export function boltzmannFactor(celsius: number): number {
  return Math.exp(-NTC_ACTIVATION_EV / thermalEnergyEv(celsius));
}

// ---------------------------------------------------------------------------
// The chain
// ---------------------------------------------------------------------------

/** Supply and ADC reference (an Arduino-style 5 V, 10-bit input). */
export const SUPPLY_V = 5;
export const ADC_BITS = 10;
export const ADC_LEVELS = 2 ** ADC_BITS;
/** Divider's fixed resistor: equal to both sensors' reference resistance, so Vout ≈ V/2 there. */
export const R_FIXED = 10_000;

export interface Stimulus {
  readonly sensor: TransducerId;
  /** Lux for the LDR, °C for the thermistor. */
  readonly quantity: number;
  /** The LDR's light colour; ignored by the thermistor. */
  readonly color: LightColor;
}

/** Reference points: 100 lx green light, and 25 °C. */
export const REFERENCE: Readonly<Record<TransducerId, number>> = {
  ldr: LDR_LUX_REF,
  ntc: 25,
};

export function sensorResistance(s: Stimulus): number {
  return s.sensor === 'ldr' ? ldrResistance(s.quantity, s.color) : ntcResistance(s.quantity);
}

/** Resistance at the reference point, with light the film absorbs. */
export function referenceResistanceOf(sensor: TransducerId): number {
  return sensorResistance({ sensor, quantity: REFERENCE[sensor], color: 'green' });
}

/** Sensor on top, fixed resistor to ground, Vout across the fixed resistor: more light or heat → higher Vout. */
export function dividerOut(rSensor: number): number {
  return (SUPPLY_V * R_FIXED) / (rSensor + R_FIXED);
}

/** An ideal ADC: floor(V/Vref · 2^N), clamped to the top code. */
export function adcCode(volts: number): number {
  const code = Math.floor((volts / SUPPLY_V) * ADC_LEVELS);
  return Math.min(ADC_LEVELS - 1, Math.max(0, code));
}

/** The voltage a code stands for: the centre of its step. */
export function codeVoltage(code: number): number {
  return ((code + 0.5) / ADC_LEVELS) * SUPPLY_V;
}

/** What firmware computes from a code: back through the divider, then through the sensor's model. */
export function quantityFromCode(sensor: TransducerId, code: number): number {
  const v = codeVoltage(code);
  const rSensor = (R_FIXED * (SUPPLY_V - v)) / v;
  return sensor === 'ldr' ? ldrLuxFromResistance(rSensor) : ntcCelsiusFromResistance(rSensor);
}

export interface ChainReading {
  readonly resistance: number;
  /** Free-carrier density relative to the reference point (conductance ratio, mobility taken as constant). */
  readonly carriers: number;
  readonly current: number;
  /** Electrons passing any point of the circuit each second: I / e. */
  readonly electronsPerSecond: number;
  readonly sensorVoltage: number;
  readonly vout: number;
  readonly code: number;
  readonly measured: number;
  /** How far the measured value moves for one ADC step, here: the resolution at this operating point. */
  readonly resolution: number;
}

export function readChain(s: Stimulus): ChainReading {
  const resistance = sensorResistance(s);
  const current = SUPPLY_V / (resistance + R_FIXED);
  const vout = current * R_FIXED;
  const code = adcCode(vout);
  const measured = quantityFromCode(s.sensor, code);
  const neighbour = code < ADC_LEVELS - 1 ? code + 1 : code - 1;
  return {
    resistance,
    carriers: referenceResistanceOf(s.sensor) / resistance,
    current,
    electronsPerSecond: current / ELECTRON_CHARGE,
    sensorVoltage: SUPPLY_V - vout,
    vout,
    code,
    measured,
    resolution: Math.abs(quantityFromCode(s.sensor, neighbour) - measured),
  };
}

// ---------------------------------------------------------------------------
// Ranges, sweeps and the demo scenario
// ---------------------------------------------------------------------------

export interface QuantityRange {
  readonly min: number;
  readonly max: number;
  /** Slider on a log10 axis (light spans four decades). */
  readonly log: boolean;
}

export const RANGES: Readonly<Record<TransducerId, QuantityRange>> = {
  ldr: { min: SENSORS.ldr.min, max: SENSORS.ldr.max, log: true },
  ntc: { min: SENSORS.ntc.min, max: SENSORS.ntc.max, log: false },
};

export interface ChainSweep {
  readonly quantities: number[];
  readonly resistances: number[];
  readonly vouts: number[];
}

export function sweepChain(sensor: TransducerId, color: LightColor, count = 121): ChainSweep {
  const { min, max, log } = RANGES[sensor];
  const quantities: number[] = [];
  const resistances: number[] = [];
  const vouts: number[] = [];
  for (let i = 0; i < count; i++) {
    const f = i / (count - 1);
    const q = log
      ? Math.pow(10, Math.log10(min) + f * (Math.log10(max) - Math.log10(min)))
      : min + f * (max - min);
    const r = sensorResistance({ sensor, quantity: q, color });
    quantities.push(q);
    resistances.push(r);
    vouts.push(dividerOut(r));
  }
  return { quantities, resistances, vouts };
}

/** Length of one scenario cycle, in seconds. */
export const SCENARIO_PERIOD = 16;

/**
 * A physical signal that changes by itself, so the electrical signal can be
 * watched following it: dawn to noon to night for the LDR (1 lx to 10 klx,
 * even on a log scale), and a heat-then-cool cycle for the thermistor.
 */
export function scenarioQuantity(sensor: TransducerId, seconds: number): number {
  const wave = -Math.cos((2 * Math.PI * seconds) / SCENARIO_PERIOD); // −1 → +1 → −1
  if (sensor === 'ldr') return Math.pow(10, 2 + 2 * wave);
  return 35 + 45 * wave; // −10 °C → 80 °C
}
