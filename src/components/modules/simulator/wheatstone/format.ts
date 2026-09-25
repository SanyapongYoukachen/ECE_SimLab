import type { SensorId } from '@/lib/circuits/sensors';

export function formatVoltage(volts: number): string {
  return `${volts.toFixed(2)} V`;
}

/** Bridge output: millivolts below 1 V, since a strain gauge's whole signal is a few mV. */
export function formatBridgeVoltage(volts: number): string {
  if (Math.abs(volts) >= 1) return `${volts.toFixed(3)} V`;
  const mV = volts * 1000;
  return `${mV.toFixed(Math.abs(mV) < 10 ? 3 : 2)} mV`;
}

export function formatResistance(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(2)} kΩ` : `${ohms.toFixed(0)} Ω`;
}

/** Enough digits to see a strain gauge's 0.2 % change (350.00 → 350.70 Ω). */
export function formatSensorResistance(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(3)} MΩ`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(3)} kΩ`;
  return `${ohms.toFixed(2)} Ω`;
}

/** Microamps below 1 mA, so the small currents of sensing mode stay readable. */
export function formatCurrent(amps: number): string {
  const milli = amps * 1000;
  if (Math.abs(milli) >= 1) return `${milli.toFixed(Math.abs(milli) < 10 ? 2 : 1)} mA`;
  const micro = amps * 1e6;
  // A balanced bridge's current is ~1e-18 A of float noise; don't print "-0.00".
  if (Math.abs(micro) < 0.005) return '0.00 µA';
  return `${micro.toFixed(Math.abs(micro) < 10 ? 2 : 1)} µA`;
}

export function formatQuantity(sensor: SensorId, value: number): string {
  switch (sensor) {
    case 'ldr':
      return `${value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString('en-US')} lx`;
    case 'ntc':
    case 'rtd':
      return `${value.toFixed(0)} °C`;
    case 'strain':
      return `${value > 0 ? '+' : ''}${value.toFixed(0)} µε`;
    case 'pot':
      return formatResistance(value);
  }
}
