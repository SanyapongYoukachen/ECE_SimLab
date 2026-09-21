'use client';

import { useCallback } from 'react';
import {
  linearScale,
  autoscaleWithZero,
  drawAxes,
  drawLine,
  drawMarker,
  type PlotTheme,
} from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import type { CircuitMode } from '@/lib/state/schemas';
import { loadLine, type OhmResult } from '@/lib/circuits/ohm';
import type { NetworkResult } from '@/lib/circuits/network';
import type { DividerResult } from '@/lib/circuits/divider';
import { formatPower, formatVoltage } from './format';
import { MAX_VOLTAGE } from './constants';

const HEIGHT = 220;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

interface Props {
  readonly mode: CircuitMode;
  readonly ohm: OhmResult;
  readonly network: NetworkResult;
  readonly divider: DividerResult;
}

/** The linked, computed-side view: reacts to the same sliders as the schematic, in a different representation. */
export function ReadoutPanel({ mode, ohm, network, divider }: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);

      if (mode === 'ohm') {
        const line = loadLine(ohm.resistance, MAX_VOLTAGE, 2);
        const xScale = linearScale([0, MAX_VOLTAGE], [PAD_LEFT, size.width - PAD_RIGHT]);
        const yScale = linearScale(autoscaleWithZero([...line.is, ohm.current], 0.2), [
          size.height - PAD_BOTTOM,
          PAD_TOP,
        ]);
        drawAxes(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          structureColor: theme.structure,
          textColor: theme.text,
          xLabel: 'V',
          yTickFormat: (v) => (v * 1000).toFixed(0),
        });
        drawLine(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: line.vs,
          ys: line.is,
          color: theme.active,
          lineWidth: 2,
        });
        drawMarker(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          x: ohm.voltage,
          y: ohm.current,
          color: theme.output,
          radius: 5,
        });
        return;
      }

      if (mode === 'network') {
        drawPowerBars(ctx, size, theme, network.p1, network.p2);
        return;
      }

      drawVoltageLadder(ctx, size, theme, divider.voltage, divider.vR1, divider.vOut);
    },
    [mode, ohm, network, divider]
  );

  const ariaLabel =
    mode === 'ohm'
      ? `I-V load line for the resistor, with the operating point at ${formatVoltage(ohm.voltage)}, ${(ohm.current * 1000).toFixed(1)} milliamps.`
      : mode === 'network'
        ? `Power dissipated: R1 draws ${formatPower(network.p1)}, R2 draws ${formatPower(network.p2)}.`
        : `Voltage ladder: ${formatVoltage(divider.vR1)} dropped across R1, ${formatVoltage(divider.vOut)} across R2 as Vout.`;

  return (
    <PlotCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[mode, ohm, network, divider]}
    />
  );
}

function drawPowerBars(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number },
  theme: PlotTheme,
  p1: number,
  p2: number
): void {
  const maxP = Math.max(p1, p2, 1e-9);
  const top = 22;
  const bottom = size.height - 34;
  const usableH = bottom - top;
  const barWidth = Math.min(64, size.width * 0.2);
  const gap = Math.max(barWidth * 1.4, size.width * 0.18);
  const centerX = size.width / 2;
  const x1 = centerX - gap / 2 - barWidth / 2;
  const x2 = centerX + gap / 2 - barWidth / 2;

  function bar(x: number, value: number, color: string, label: string): void {
    const h = Math.max(1, (value / maxP) * usableH);
    const y = bottom - h;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.text;
    ctx.font = '11px var(--font-mono, monospace)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(formatPower(value), x + barWidth / 2, y - 4);
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + barWidth / 2, bottom + 6);
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = theme.structure;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, bottom + 0.5);
  ctx.lineTo(size.width, bottom + 0.5);
  ctx.stroke();
  ctx.restore();

  bar(x1, p1, theme.input, 'P(R1)');
  bar(x2, p2, theme.active, 'P(R2)');
}

function drawVoltageLadder(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number },
  theme: PlotTheme,
  voltage: number,
  vR1: number,
  vOut: number
): void {
  const top = 18;
  const bottom = size.height - 26;
  const usableH = bottom - top;
  const scale = voltage > 0 ? usableH / voltage : 0;
  const barWidth = Math.min(70, size.width * 0.22);
  const x = size.width / 2 - barWidth / 2;

  const vR1Height = vR1 * scale;
  const vOutHeight = vOut * scale;
  const tapY = top + vR1Height;

  ctx.save();
  ctx.fillStyle = theme.input;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x, top, barWidth, vR1Height);
  ctx.fillStyle = theme.output;
  ctx.fillRect(x, tapY, barWidth, vOutHeight);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = theme.structure;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, top, barWidth, vR1Height + vOutHeight);

  ctx.strokeStyle = theme.text;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x - 8, tapY);
  ctx.lineTo(x + barWidth + 8, tapY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = theme.text;
  ctx.font = '11px var(--font-mono, monospace)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${voltage.toFixed(1)}V`, x - 12, top + 4);
  ctx.fillText('0V', x - 12, bottom);

  ctx.textAlign = 'left';
  ctx.fillText(`R1: ${vR1.toFixed(2)}V`, x + barWidth + 12, top + vR1Height / 2);
  ctx.fillText(`Vout: ${vOut.toFixed(2)}V`, x + barWidth + 12, tapY + vOutHeight / 2);
  ctx.restore();
}
