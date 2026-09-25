export function formatVoltage(volts: number): string {
  return `${volts.toFixed(2)} V`;
}

export function formatResistance(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(2)} kΩ` : `${ohms.toFixed(0)} Ω`;
}

export function formatCurrent(amps: number): string {
  const milli = amps * 1000;
  return `${milli.toFixed(Math.abs(milli) < 10 ? 2 : 1)} mA`;
}
