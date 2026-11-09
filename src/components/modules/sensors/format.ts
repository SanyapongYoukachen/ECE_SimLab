import type { TransducerId } from '@/lib/circuits/transducer';

export function formatLux(lux: number): string {
  if (lux < 0.01) return '0.00 lx';
  if (lux < 10) return `${lux.toFixed(2)} lx`;
  return `${Math.round(lux).toLocaleString('en-US')} lx`;
}

export function formatCelsius(c: number, digits = 1): string {
  return `${c.toFixed(digits)} °C`;
}

export function formatQuantity(sensor: TransducerId, q: number): string {
  return sensor === 'ldr' ? formatLux(q) : formatCelsius(q);
}

export function formatOhms(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)} MΩ`;
  if (ohms >= 1000)
    return `${(ohms / 1000).toFixed(ohms >= 100_000 ? 0 : ohms >= 10_000 ? 1 : 2)} kΩ`;
  return `${ohms.toFixed(0)} Ω`;
}

export function formatVolts(v: number): string {
  return v < 0.1 ? `${(v * 1000).toFixed(1)} mV` : `${v.toFixed(3)} V`;
}

export function formatMicroamps(amps: number): string {
  const ua = amps * 1e6;
  return `${ua.toFixed(ua < 10 ? 2 : ua < 100 ? 1 : 0)} µA`;
}

/** 1.56 × 10¹⁵ — scientific notation with superscript exponent. */
export function formatScientific(x: number): string {
  if (x === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const mant = x / Math.pow(10, exp);
  const sup = String(exp)
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? (d === '-' ? '⁻' : d))
    .join('');
  return `${mant.toFixed(2)} × 10${sup}`;
}

/** Ratio against the reference: ×0.05, ×1.00, ×24.6. */
export function formatRatio(r: number): string {
  return `×${r < 0.1 ? r.toFixed(3) : r < 10 ? r.toFixed(2) : r.toFixed(1)}`;
}

export function formatResolution(sensor: TransducerId, step: number): string {
  if (sensor === 'ntc') return `${step < 1 ? step.toFixed(2) : step.toFixed(1)} °C`;
  return step < 1
    ? `${step.toFixed(3)} lx`
    : step < 100
      ? `${step.toFixed(1)} lx`
      : `${Math.round(step)} lx`;
}
