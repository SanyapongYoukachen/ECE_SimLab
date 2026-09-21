'use client';

import { useCallback } from 'react';
import {
  drawWire,
  drawResistor,
  drawBattery,
  drawCurrentArrow,
  drawNodeDot,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import type { CircuitMode, Topology } from '@/lib/state/schemas';
import { formatResistance, formatVoltage } from './format';

const HEIGHT = 220;
const MARGIN_LEFT = 58;
const MARGIN_RIGHT = 58;
const MARGIN_RIGHT_DIVIDER = 92;
const MARGIN_Y = 28;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(1)}k` : `${Math.round(ohms)}`;
}

interface Props {
  readonly mode: CircuitMode;
  readonly topology: Topology;
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
}

/**
 * The circuit half of each mode's linked pair: a hand-drawn schematic whose
 * colours reuse the app-wide legend (structure = wiring, input = the
 * voltage source, active = the resistor(s) under the student's control,
 * output = the current/tap the module is asking them to reason about).
 */
export function SchematicPanel({ mode, topology, voltage, r1, r2 }: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const marginRight = mode === 'divider' ? MARGIN_RIGHT_DIVIDER : MARGIN_RIGHT;
      const left = MARGIN_LEFT;
      const right = size.width - marginRight;
      const top = MARGIN_Y;
      const bottom = size.height - MARGIN_Y;

      const topLeft: Point = { x: left, y: top };
      const topRight: Point = { x: right, y: top };
      const bottomLeft: Point = { x: left, y: bottom };
      const bottomRight: Point = { x: right, y: bottom };

      ctx.font = '11px var(--font-mono, monospace)';
      ctx.textBaseline = 'middle';

      function label(
        text: string,
        x: number,
        y: number,
        color: string,
        align: CanvasTextAlign = 'left'
      ): void {
        ctx.save();
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
        ctx.restore();
      }

      if (mode === 'ohm') {
        drawBattery(ctx, { from: bottomLeft, to: topLeft, color: theme.input });
        drawWire(ctx, [topLeft, topRight], theme.structure);
        drawResistor(ctx, { from: topRight, to: bottomRight, color: theme.active });
        drawWire(ctx, [bottomRight, bottomLeft], theme.structure);

        drawCurrentArrow(ctx, {
          at: { x: (topLeft.x + topRight.x) / 2, y: top },
          angleRad: 0,
          color: theme.output,
        });
        drawCurrentArrow(ctx, {
          at: { x: (bottomLeft.x + bottomRight.x) / 2, y: bottom },
          angleRad: Math.PI,
          color: theme.output,
        });

        label(`V=${voltage.toFixed(1)}V`, left - 8, (top + bottom) / 2, theme.input, 'right');
        label(`R=${compactR(r1)}Ω`, right + 8, (top + bottom) / 2, theme.active, 'left');
        return;
      }

      if (mode === 'network' && topology === 'series') {
        const topMid: Point = { x: (left + right) / 2, y: top };
        drawBattery(ctx, { from: bottomLeft, to: topLeft, color: theme.input });
        drawResistor(ctx, { from: topLeft, to: topMid, color: theme.active });
        drawResistor(ctx, { from: topMid, to: topRight, color: theme.active });
        drawWire(ctx, [topRight, bottomRight], theme.structure);
        drawWire(ctx, [bottomRight, bottomLeft], theme.structure);
        drawCurrentArrow(ctx, {
          at: { x: (bottomLeft.x + bottomRight.x) / 2, y: bottom },
          angleRad: Math.PI,
          color: theme.output,
        });
        label('R1', (left + topMid.x) / 2, top - 14, theme.active, 'center');
        label('R2', (topMid.x + right) / 2, top - 14, theme.active, 'center');
        label(`V=${voltage.toFixed(1)}V`, left - 8, (top + bottom) / 2, theme.input, 'right');
        return;
      }

      if (mode === 'network' && topology === 'parallel') {
        const branch1X = left + (right - left) * 0.4;
        const branch2X = left + (right - left) * 0.78;
        drawBattery(ctx, { from: bottomLeft, to: topLeft, color: theme.input });
        drawWire(ctx, [topLeft, { x: right, y: top }], theme.structure);
        drawWire(ctx, [bottomLeft, { x: right, y: bottom }], theme.structure);
        drawResistor(ctx, {
          from: { x: branch1X, y: top },
          to: { x: branch1X, y: bottom },
          color: theme.active,
        });
        drawResistor(ctx, {
          from: { x: branch2X, y: top },
          to: { x: branch2X, y: bottom },
          color: theme.active,
        });
        for (const x of [branch1X, branch2X]) {
          drawNodeDot(ctx, { at: { x, y: top }, color: theme.structure });
          drawNodeDot(ctx, { at: { x, y: bottom }, color: theme.structure });
        }
        label('R1', branch1X, top - 14, theme.active, 'center');
        label('R2', branch2X, top - 14, theme.active, 'center');
        label(`V=${voltage.toFixed(1)}V`, left - 8, (top + bottom) / 2, theme.input, 'right');
        return;
      }

      // divider: R1 and R2 in series, tap position reflects their true ratio
      const ratio = Math.min(0.85, Math.max(0.15, r1 / Math.max(1, r1 + r2)));
      const tapY = top + (bottom - top) * ratio;
      const tap: Point = { x: right, y: tapY };
      const outTerminal: Point = { x: right + 22, y: tapY };

      drawBattery(ctx, { from: bottomLeft, to: topLeft, color: theme.input });
      drawWire(ctx, [topLeft, topRight], theme.structure);
      drawResistor(ctx, { from: topRight, to: tap, color: theme.active });
      drawResistor(ctx, { from: tap, to: bottomRight, color: theme.active });
      drawWire(ctx, [bottomRight, bottomLeft], theme.structure);
      drawWire(ctx, [tap, outTerminal], theme.output);
      drawNodeDot(ctx, { at: tap, color: theme.output, radius: 3.5 });

      ctx.save();
      ctx.strokeStyle = theme.output;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(outTerminal.x + 4, outTerminal.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      label('R1', right + 8, (top + tapY) / 2, theme.active, 'left');
      label('R2', right + 8, (tapY + bottom) / 2, theme.active, 'left');
      label('Vout', outTerminal.x + 10, outTerminal.y, theme.output, 'left');
      label(`V=${voltage.toFixed(1)}V`, left - 8, (top + bottom) / 2, theme.input, 'right');
    },
    [mode, topology, voltage, r1, r2]
  );

  const ariaLabel =
    mode === 'ohm'
      ? `Schematic: a ${formatVoltage(voltage)} source driving a ${formatResistance(r1)} resistor.`
      : mode === 'network'
        ? `Schematic: two resistors, ${formatResistance(r1)} and ${formatResistance(r2)}, in ${topology} across a ${formatVoltage(voltage)} source.`
        : `Schematic: a voltage divider — ${formatResistance(r1)} and ${formatResistance(r2)} in series across ${formatVoltage(voltage)}, tapped between them.`;

  return (
    <PlotCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[mode, topology, voltage, r1, r2]}
    />
  );
}
