import type { ConvStep } from '@/lib/dsp';

/** Renders the live arithmetic for a convolution step, e.g. "y[4] = 1.00x0.42 + 0.90x0.65 = 1.83". */
export function formatConvExpression(step: ConvStep | undefined): string {
  if (!step) return '';
  if (step.terms.length === 0) return `y[${step.n}] = 0  (no overlap yet)`;
  const parts = step.terms.map((t) => `${t.xVal.toFixed(2)}×${t.hVal.toFixed(2)}`);
  return `y[${step.n}] = ${parts.join(' + ')} = ${step.sum.toFixed(2)}`;
}
