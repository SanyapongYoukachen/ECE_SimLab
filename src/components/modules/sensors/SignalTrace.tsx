'use client';

import { useCallback, useRef } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas } from '@/components/ui';
import { RANGES, SUPPLY_V, type TransducerId } from '@/lib/circuits/transducer';

const HEIGHT = 260;
const WINDOW_S = 12;
const SAMPLE_S = 1 / 30;
const PAD_LEFT = 44;
const PAD_RIGHT = 10;

interface Sample {
  readonly t: number;
  readonly q: number;
  readonly v: number;
}

interface Props {
  readonly sensor: TransducerId;
  readonly quantity: number;
  readonly vout: number;
  readonly physicalTitle: string;
  readonly electricalTitle: string;
  readonly timeLabel: string;
  readonly ariaLabel: string;
}

function label(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '11px var(--font-mono, monospace)';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/**
 * A two-channel "oscilloscope": the physical signal going in (light or
 * temperature) above the electrical signal coming out (Vout), scrolling over
 * the last 12 s. Drag the slider or press Play and the two traces move
 * together — the sensor turning one kind of signal into the other.
 */
export function SignalTrace({
  sensor,
  quantity,
  vout,
  physicalTitle,
  electricalTitle,
  timeLabel,
  ariaLabel,
}: Props): React.JSX.Element {
  const samplesRef = useRef<{ sensor: TransducerId; list: Sample[] }>({ sensor, list: [] });

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now() / 1000;

      const store = samplesRef.current;
      if (store.sensor !== sensor) {
        store.sensor = sensor;
        store.list = [];
      }
      const last = store.list[store.list.length - 1];
      if (!last || now - last.t >= SAMPLE_S) store.list.push({ t: now, q: quantity, v: vout });
      while (store.list.length > 0 && now - store.list[0].t > WINDOW_S + 1) store.list.shift();

      const range = RANGES[sensor];
      const qNorm = (q: number): number =>
        range.log
          ? (Math.log10(q) - Math.log10(range.min)) /
            (Math.log10(range.max) - Math.log10(range.min))
          : (q - range.min) / (range.max - range.min);
      const x = (t: number): number =>
        w - PAD_RIGHT - ((now - t) / WINDOW_S) * (w - PAD_LEFT - PAD_RIGHT);

      const panels = [
        {
          top: 22,
          bottom: h / 2 - 16,
          title: physicalTitle,
          color: theme.active,
          y: (s: Sample) => qNorm(s.q),
          ticks: range.log
            ? [
                { f: 0, s: '1' },
                { f: 0.5, s: '100' },
                { f: 1, s: '10k' },
              ]
            : [
                { f: 0, s: `${range.min}` },
                { f: (25 - range.min) / (range.max - range.min), s: '25' },
                { f: 1, s: `${range.max}` },
              ],
        },
        {
          top: h / 2 + 18,
          bottom: h - 24,
          title: electricalTitle,
          color: theme.output,
          y: (s: Sample) => s.v / SUPPLY_V,
          ticks: [
            { f: 0, s: '0' },
            { f: 0.5, s: '2.5' },
            { f: 1, s: '5' },
          ],
        },
      ];

      for (const p of panels) {
        const py = (f: number): number => p.bottom - f * (p.bottom - p.top);
        label(ctx, p.title, PAD_LEFT, p.top - 12, p.color);
        ctx.save();
        ctx.strokeStyle = theme.structureFaint;
        ctx.lineWidth = 1;
        for (const tick of p.ticks) {
          const yy = Math.round(py(tick.f)) + 0.5;
          ctx.beginPath();
          ctx.moveTo(PAD_LEFT, yy);
          ctx.lineTo(w - PAD_RIGHT, yy);
          ctx.stroke();
          label(ctx, tick.s, PAD_LEFT - 6, yy, theme.text, 'right');
        }
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(PAD_LEFT, p.top - 4, w - PAD_LEFT - PAD_RIGHT, p.bottom - p.top + 8);
        ctx.clip();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        store.list.forEach((s, i) => {
          const xx = x(s.t);
          const yy = py(Math.min(1, Math.max(0, p.y(s))));
          if (i === 0) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        });
        // Hold the latest value to the right edge.
        if (store.list.length > 0)
          ctx.lineTo(
            w - PAD_RIGHT,
            py(Math.min(1, Math.max(0, p.y(store.list[store.list.length - 1]))))
          );
        ctx.stroke();
        ctx.restore();
      }
      label(ctx, timeLabel, w - PAD_RIGHT, h - 8, theme.text, 'right');
    },
    [sensor, quantity, vout, physicalTitle, electricalTitle, timeLabel]
  );

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      // Under reduced motion each change adds one sample and redraws.
      deps={[sensor, quantity, vout]}
    />
  );
}
