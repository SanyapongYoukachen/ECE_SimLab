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
