export function formatVoltage(volts: number): string {
  return `${volts.toFixed(2)} V`;
}

export function formatResistance(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(2)} kΩ` : `${ohms.toFixed(0)} Ω`;
}

export function formatCurrentMa(ma: number): string {
  return `${ma.toFixed(Math.abs(ma) < 10 ? 2 : 1)} mA`;
}

export function formatCurrentA(amps: number): string {
  return `${amps.toFixed(3)} A`;
}
