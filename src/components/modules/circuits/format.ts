export function formatVoltage(volts: number): string {
  return `${volts.toFixed(2)} V`;
}

export function formatResistance(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(2)} kΩ` : `${ohms.toFixed(0)} Ω`;
}

export function formatCurrent(amps: number): string {
  const milli = amps * 1000;
  return Math.abs(milli) < 1000 ? `${milli.toFixed(1)} mA` : `${amps.toFixed(2)} A`;
}

export function formatPower(watts: number): string {
  const milli = watts * 1000;
  return Math.abs(milli) < 1000 ? `${milli.toFixed(1)} mW` : `${watts.toFixed(2)} W`;
}

/** Two decimals of mA: mesh and load currents are a few milliamps and can be negative. */
export function formatMilliamps(amps: number): string {
  const ma = amps * 1000;
  return `${Math.abs(ma) < 0.005 ? '0.00' : ma.toFixed(2)} mA`;
}

/** Resistance with one decimal, for derived values like R1‖R2 = 149.9 Ω. */
export function formatOhmsPrecise(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(3)} kΩ` : `${ohms.toFixed(1)} Ω`;
}
