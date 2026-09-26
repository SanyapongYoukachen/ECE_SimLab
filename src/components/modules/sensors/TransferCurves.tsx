'use client';

import { useCallback } from 'react';
import {
  drawAxes,
  drawLine,
  drawMarker,
  drawVerticalLine,
  linearScale,
  type PlotTheme,
} from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import { RANGES, SUPPLY_V, type ChainSweep, type TransducerId } from '@/lib/circuits/transducer';

const HEIGHT = 170;
const PAD_LEFT = 46;
const PAD_RIGHT = 10;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;

interface Props {
  readonly sensor: TransducerId;
  readonly sweep: ChainSweep;
  readonly quantity: number;
  readonly resistance: number;
  readonly vout: number;
  readonly resistanceTitle: string;
  readonly voutTitle: string;
  readonly resistanceAria: string;
  readonly voutAria: string;
}

function compactOhms(ohms: number): string {
  if (ohms >= 1e6) return `${Number((ohms / 1e6).toFixed(1))}M`;
  if (ohms >= 1000) return `${Number((ohms / 1000).toFixed(1))}k`;
  return `${Math.round(ohms)}`;
}

function compactLux(lux: number): string {
  return lux >= 1000 ? `${Number((lux / 1000).toFixed(1))}k` : `${Number(lux.toFixed(0))}`;
}

/**
 * The calibration curves a datasheet would give: resistance against the
 * physical quantity (a log axis — both sensors change by orders of
 * magnitude), and the divider's Vout against it. The dot is where the
 * sensor is now.
 */
export function TransferCurves({
  sensor,
  sweep,
  quantity,
  resistance,
  vout,
  resistanceTitle,
  voutTitle,
  resistanceAria,
  voutAria,
}: Props): React.JSX.Element {
  const log = RANGES[sensor].log;
  const qx = useCallback((q: number) => (log ? Math.log10(q) : q), [log]);
  const xTick = useCallback(
    (v: number) => (log ? compactLux(Math.pow(10, v)) : `${Math.round(v)}`),
    [log]
  );

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      ys: readonly number[],
      yDomain: readonly [number, number],
      point: number,
      color: string,
      yTick: (v: number) => string
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const xs = sweep.quantities.map(qx);
      const xScale = linearScale([xs[0], xs[xs.length - 1]], [PAD_LEFT, size.width - PAD_RIGHT]);
      const yScale = linearScale(yDomain, [size.height - PAD_BOTTOM, PAD_TOP]);
      const area = { width: size.width, height: size.height, xScale, yScale };
      drawAxes(ctx, {
        ...area,
        structureColor: theme.structure,
        textColor: theme.text,
        xTickFormat: xTick,
        yTickFormat: yTick,
      });
      drawVerticalLine(ctx, { ...area, x: qx(quantity), color: theme.structure });
      drawLine(ctx, { ...area, xs, ys, color, lineWidth: 2 });
      drawMarker(ctx, { ...area, x: qx(quantity), y: point, color, radius: 5.5 });
    },
    [sweep, qx, xTick, quantity]
  );

  const logR = sweep.resistances.map(Math.log10);
  const rDomain: [number, number] = [
    Math.floor(Math.min(...logR) * 2) / 2,
    Math.ceil(Math.max(...logR) * 2) / 2,
  ];

  const drawR = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) =>
      draw(ctx, size, theme, logR, rDomain, Math.log10(resistance), theme.active, (v) =>
        compactOhms(Math.pow(10, v))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draw, resistance, sweep]
  );
  const drawV = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) =>
      draw(ctx, size, theme, sweep.vouts, [0, SUPPLY_V], vout, theme.output, (v) => `${v} V`),
    [draw, vout, sweep]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <figure className="flex flex-col gap-1">
        <figcaption className="text-xs text-[var(--foreground)]/70">{resistanceTitle}</figcaption>
        <PlotCanvas
          height={HEIGHT}
          ariaLabel={resistanceAria}
          onDraw={drawR}
          deps={[sensor, quantity, resistance, sweep]}
        />
      </figure>
      <figure className="flex flex-col gap-1">
        <figcaption className="text-xs text-[var(--foreground)]/70">{voutTitle}</figcaption>
        <PlotCanvas
          height={HEIGHT}
          ariaLabel={voutAria}
          onDraw={drawV}
          deps={[sensor, quantity, vout, sweep]}
        />
      </figure>
    </div>
  );
}
