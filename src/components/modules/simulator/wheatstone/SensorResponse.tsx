'use client';

import { useCallback, useMemo } from 'react';
import {
  linearScale,
  autoscale,
  autoscaleWithZero,
  drawAxes,
  drawLine,
  drawMarker,
  drawVerticalLine,
  type PlotTheme,
} from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import {
  BRIDGE_CONFIGS,
  SENSORS,
  type BridgeConfig,
  type BridgeSweep,
  type SensorId,
} from '@/lib/circuits/sensors';
import { useMessages } from '@/lib/i18n';
import { formatBridgeVoltage, formatQuantity, formatSensorResistance } from './format';

const HEIGHT = 140;
const PAD_LEFT = 50;
const PAD_RIGHT = 12;
const PAD_TOP = 10;
const PAD_BOTTOM = 20;

interface Props {
  readonly sensor: SensorId;
  readonly quantity: number;
  readonly resistance: number;
  readonly output: number;
  readonly config: BridgeConfig;
  /** One sweep per configuration: the output plot compares all three. */
  readonly sweeps: Readonly<Record<BridgeConfig, BridgeSweep>>;
}

interface Curve {
  readonly ys: number[];
  readonly color: string;
  readonly width: number;
  readonly opacity: number;
  readonly label?: string;
}

function compactOhms(ohms: number): string {
  if (ohms >= 1e6) return `${Number((ohms / 1e6).toFixed(1))}M`;
  if (ohms >= 1000) return `${Number((ohms / 1000).toFixed(1))}k`;
  return `${Number(ohms.toFixed(1))}`;
}

function compactLux(lux: number): string {
  return lux >= 1000 ? `${Number((lux / 1000).toFixed(1))}k` : `${Number(lux.toFixed(0))}`;
}

/**
 * The sensor's transfer curves: resistance vs. the physical quantity, and
 * the bridge output that resistance produces. Side by side they show the
 * lesson of each sensor — the LDR and NTC's steep non-linearity, the RTD and
 * strain gauge's near-straight lines — and how the sensor's arm sets the
 * output's polarity.
 */
export function SensorResponse({
  sensor,
  quantity,
  resistance,
  output,
  config,
  sweeps,
}: Props): React.JSX.Element {
  const t = useMessages().simulator.wheatstone;
  const model = SENSORS[sensor];
  const sweep = sweeps[config];

  // Light spans four decades, so it (and exponential resistances) plot on log10 axes.
  const qx = useCallback((q: number) => (model.logQuantity ? Math.log10(q) : q), [model]);
  const xTick = useCallback(
    (v: number) =>
      sensor === 'ldr'
        ? compactLux(Math.pow(10, v))
        : sensor === 'pot'
          ? compactOhms(v)
          : `${Math.round(v)}`,
    [sensor]
  );
  // mV unless the swing reaches volts, so a strain gauge's output isn't a flat
  // line at "0.00". Scaled by the full bridge, the largest of the three.
  const outputScale = Math.max(...sweeps.full.outputs.map(Math.abs)) >= 1 ? 1 : 1000;
  const outputUnit = outputScale === 1 ? 'V' : 'mV';

  const drawCurve = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      curves: readonly Curve[],
      current: number,
      yTick: (v: number) => string,
      withZero: boolean,
      padRight = PAD_RIGHT
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const xs = sweep.quantities.map(qx);
      const xScale = linearScale([xs[0], xs[xs.length - 1]], [PAD_LEFT, size.width - padRight]);
      const all = curves.flatMap((c) => c.ys);
      const yDomain = withZero ? autoscaleWithZero(all, 0.12) : autoscale(all, 0.12);
      const yScale = linearScale(yDomain, [size.height - PAD_BOTTOM, PAD_TOP]);
      const area = { width: size.width, height: size.height, xScale, yScale };

      drawAxes(ctx, {
        ...area,
        structureColor: theme.structure,
        textColor: theme.text,
        xTickFormat: xTick,
        yTickFormat: yTick,
      });
      drawVerticalLine(ctx, { ...area, x: qx(model.reference), color: theme.structure });
      for (const c of curves) {
        drawLine(ctx, {
          ...area,
          xs,
          ys: c.ys,
          color: c.color,
          lineWidth: c.width,
          opacity: c.opacity,
        });
      }

      // Name each curve at its right-hand end, nudged apart where curves end
      // close together (quarter and half often do) so labels never overlap.
      const labelled = curves
        .filter((c) => c.label)
        .map((c) => ({ c, y: yScale.toPixel(c.ys[c.ys.length - 1]) }))
        .sort((a, b) => a.y - b.y);
      const minGap = 13;
      for (let i = 1; i < labelled.length; i++) {
        labelled[i].y = Math.max(labelled[i].y, labelled[i - 1].y + minGap);
      }
      const overflow = labelled.length ? labelled[labelled.length - 1].y - (size.height - 6) : 0;
      if (overflow > 0) for (const l of labelled) l.y -= overflow;
      ctx.save();
      ctx.font = '10px var(--font-mono, monospace)';
      ctx.textBaseline = 'middle';
      for (const { c, y } of labelled) {
        ctx.globalAlpha = Math.max(c.opacity, 0.6);
        ctx.fillStyle = c.color;
        ctx.fillText(c.label ?? '', size.width - padRight + 4, y);
      }
      ctx.restore();
      drawMarker(ctx, { ...area, x: qx(quantity), y: current, color: theme.text, radius: 4.5 });
    },
    [sweep, qx, xTick, model, quantity]
  );

  const rValues = useMemo(
    () => sweep.resistances.map((r) => (model.logResistance ? Math.log10(r) : r)),
    [sweep, model]
  );
  const rCurrent = model.logResistance ? Math.log10(resistance) : resistance;
  const drawResistance = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) =>
      drawCurve(
        ctx,
        size,
        theme,
        [{ ys: rValues, color: theme.active, width: 2, opacity: 1 }],
        rCurrent,
        (v) => compactOhms(model.logResistance ? Math.pow(10, v) : v),
        false
      ),
    [drawCurve, rValues, rCurrent, model]
  );

  const vValues = useMemo(
    () =>
      Object.fromEntries(
        BRIDGE_CONFIGS.map((c) => [c, sweeps[c].outputs.map((v) => v * outputScale)])
      ) as Record<BridgeConfig, number[]>,
    [sweeps, outputScale]
  );
  const drawOutput = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) =>
      drawCurve(
        ctx,
        size,
        theme,
        // The selected configuration bold, the other two faint, for comparison.
        BRIDGE_CONFIGS.map((c) => ({
          ys: vValues[c],
          color: theme.output,
          width: c === config ? 2.5 : 1.25,
          opacity: c === config ? 1 : 0.35,
          label: t.configShort[c],
        })),
        output * outputScale,
        (v) => `${Number(v.toFixed(Math.abs(v) < 10 ? 1 : 0))}`,
        true,
        58
      ),
    [drawCurve, vValues, config, output, outputScale, t]
  );

  const reading = formatQuantity(sensor, quantity);
  const ariaLabel = t.responseAria(
    t.sensors[sensor].name,
    reading,
    formatSensorResistance(resistance),
    formatBridgeVoltage(output)
  );

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={ariaLabel}>
      <PanelTitle
        title={`${t.responseR} (Ω)`}
        note={model.logResistance ? t.logScale : undefined}
        reference={`${t.referenceLegend}: ${formatQuantity(sensor, model.reference)}`}
      />
      <PlotCanvas
        height={HEIGHT}
        ariaLabel={`${t.responseR}: ${formatSensorResistance(resistance)} @ ${reading}`}
        onDraw={drawResistance}
        deps={[drawResistance]}
      />
      <PanelTitle title={`${t.responseV} (${outputUnit})`} note={t.compareLegend} />
      <PlotCanvas
        height={HEIGHT}
        ariaLabel={`${t.responseV}: ${formatBridgeVoltage(output)} @ ${reading}`}
        onDraw={drawOutput}
        deps={[drawOutput]}
      />
    </div>
  );
}

function PanelTitle({
  title,
  note,
  reference,
}: {
  readonly title: string;
  readonly note?: string;
  readonly reference?: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="text-[var(--foreground)]/70">
        {title}
        {note && <span className="ml-1.5 text-[var(--foreground)]/50">· {note}</span>}
      </span>
      {reference && (
        <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]/60">
          <span
            className="inline-block h-2 w-3 border-t-2 border-dashed border-[var(--plot-structure)]"
            aria-hidden="true"
          />
          {reference}
        </span>
      )}
    </div>
  );
}
