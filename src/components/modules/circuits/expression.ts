import type { CircuitMode, Topology } from '@/lib/state/schemas';
import type { OhmResult } from '@/lib/circuits/ohm';
import type { NetworkResult } from '@/lib/circuits/network';
import type { DividerResult } from '@/lib/circuits/divider';
import { formatCurrent, formatResistance, formatVoltage } from './format';

/** Renders the live governing equation for the active mode, arithmetic filled in. */
export function formatCircuitExpression(
  mode: CircuitMode,
  topology: Topology,
  ohm: OhmResult,
  network: NetworkResult,
  divider: DividerResult
): string {
  if (mode === 'ohm') {
    return `I = V / R = ${formatVoltage(ohm.voltage)} / ${formatResistance(ohm.resistance)} = ${formatCurrent(ohm.current)}`;
  }
  if (mode === 'network') {
    const formula =
      topology === 'series'
        ? `Req = R1 + R2 = ${formatResistance(network.r1)} + ${formatResistance(network.r2)} = ${formatResistance(network.equivalent)}`
        : `Req = (R1×R2) / (R1+R2) = ${formatResistance(network.equivalent)}`;
    return `${formula}, I = V / Req = ${formatCurrent(network.totalCurrent)}`;
  }
  return `Vout = V × R2 / (R1 + R2) = ${formatVoltage(divider.voltage)} × ${formatResistance(divider.r2)} / ${formatResistance(divider.r1 + divider.r2)} = ${formatVoltage(divider.vOut)}`;
}
