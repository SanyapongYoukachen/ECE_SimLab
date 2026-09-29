'use client';

import { useCallback } from 'react';
import { linearScale, type PlotTheme, type Scale } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import { generatorInstant, type GeneratorResult } from '@/lib/circuits/generator';
import type { RotorClock } from './rotorClock';

const HEIGHT = 330;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const SPAN = 4 * Math.PI;
const TICKS = ['0', 'π/2', 'π', '3π/2', '2π', '5π/2', '3π', '7π/2', '4π'];

interface Props {
  readonly result: GeneratorResult;
  readonly clock: RotorClock;
  readonly axisLabel: string;
  readonly ariaLabel: string;
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '10px var(--font-mono, monospace)';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/**
 * Two cycles of the generator's output against electrical angle ωt: the
 * generated EMF e and terminal voltage v (volts), and the load current i
 * (amps) below, each on its own axis. The marker is "now" — the rotor's
 * angle — with the instantaneous values beside it, and the inset phasor is
 * the same angle drawn as a rotating arrow.
 */
export function GeneratorWave({ result, clock, axisLabel, ariaLabel }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const xScale = linearScale([0, SPAN], [PAD_LEFT, w - PAD_RIGHT]);
      const vMax = niceMax(result.ePeak * 1.12);
      const iMax = niceMax(result.iPeak * 1.12);
      const panels: { top: number; bottom: number; max: number; unit: string }[] = [
        { top: 12, bottom: 196, max: vMax, unit: 'V' },
        { top: 218, bottom: h - 34, max: iMax, unit: 'A' },
      ];
      const scales: Scale[] = panels.map((p) => linearScale([-p.max, p.max], [p.bottom, p.top]));

      // Grid, zero line and y ticks.
      panels.forEach((p, k) => {
        const ys = scales[k];
        ctx.save();
        ctx.strokeStyle = theme.structureFaint;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
          const x = Math.round(xScale.toPixel((i * Math.PI) / 2)) + 0.5;
          ctx.beginPath();
          ctx.moveTo(x, p.top);
          ctx.lineTo(x, p.bottom);
          ctx.stroke();
        }
        for (const f of [-1, -0.5, 0, 0.5, 1]) {
          const y = Math.round(ys.toPixel(f * p.max)) + 0.5;
          ctx.strokeStyle = f === 0 ? theme.structure : theme.structureFaint;
          ctx.beginPath();
          ctx.moveTo(PAD_LEFT, y);
          ctx.lineTo(w - PAD_RIGHT, y);
          ctx.stroke();
          text(ctx, fmt(f * p.max), PAD_LEFT - 6, y, theme.text, 'right');
        }
        ctx.restore();
        text(ctx, p.unit, 8, (p.top + p.bottom) / 2, theme.text);
      });
      TICKS.forEach((s, i) =>
        text(ctx, s, xScale.toPixel((i * Math.PI) / 2), h - 22, theme.text, 'center')
      );
      text(ctx, axisLabel, (PAD_LEFT + w - PAD_RIGHT) / 2, h - 7, theme.text, 'center');

      // ±Vrms band on the volts panel.
      const vs = scales[0];
      ctx.save();
      ctx.fillStyle = theme.input;
      ctx.globalAlpha = 0.07;
      ctx.fillRect(
        PAD_LEFT,
        vs.toPixel(result.vRms),
        w - PAD_LEFT - PAD_RIGHT,
        vs.toPixel(-result.vRms) - vs.toPixel(result.vRms)
      );
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = theme.input;
      ctx.setLineDash([5, 4]);
      for (const y of [result.vRms, -result.vRms]) {
        ctx.beginPath();
        ctx.moveTo(PAD_LEFT, vs.toPixel(y));
        ctx.lineTo(w - PAD_RIGHT, vs.toPixel(y));
        ctx.stroke();
      }
      ctx.restore();
      text(
        ctx,
        `V_rms ${fmt(result.vRms)}`,
        PAD_LEFT + 6,
        vs.toPixel(result.vRms) - 8,
        theme.input
      );

      // Curves.
      const N = 360;
      const curve = (
        k: number,
        pick: (th: number) => number,
        color: string,
        width: number,
        dash: number[] = []
      ): void => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        for (let j = 0; j <= N; j++) {
          const th = (j / N) * SPAN;
          const x = xScale.toPixel(th);
          const y = scales[k].toPixel(pick(th));
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };
      // v first, then e dashed on top: with a small Ra they nearly coincide.
      curve(0, (th) => generatorInstant(result, th).v, theme.input, 2.4);
      curve(0, (th) => generatorInstant(result, th).e, theme.active, 2, [6, 4]);
      curve(1, (th) => generatorInstant(result, th).i, theme.output, 2.4);

      // "Now" marker.
      const theta = clock.angle();
      const th = ((theta % SPAN) + SPAN) % SPAN;
      const now = generatorInstant(result, theta);
      const xc = xScale.toPixel(th);
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xc, panels[0].top);
      ctx.lineTo(xc, panels[1].bottom);
      ctx.stroke();
      ctx.restore();
      for (const [k, val, color] of [
        [0, now.e, theme.active],
        [0, now.v, theme.input],
        [1, now.i, theme.output],
      ] as const) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = theme.surface;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xc, scales[k].toPixel(val), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Readout plate beside the marker, flipped to stay on the canvas.
      const lines: [string, string][] = [
        [`e = ${fmt(now.e)} V`, theme.active],
        [`v = ${fmt(now.v)} V`, theme.input],
        [`i = ${fmt(now.i)} A`, theme.output],
      ];
      const boxW = 104;
      const bx = xc + 10 + boxW > w - PAD_RIGHT ? xc - 10 - boxW : xc + 10;
      const by = panels[0].top + 4;
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.structure;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, 50, 5);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();
      lines.forEach(([s, c], i) => {
        ctx.save();
        ctx.fillStyle = c;
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textBaseline = 'middle';
        ctx.fillText(s, bx + 8, by + 11 + i * 14);
        ctx.restore();
      });

      // Phasor inset: e as a rotating arrow, its height the instantaneous value.
      const pr = 22;
      const pcx = PAD_LEFT + pr + 10;
      const pcy = panels[0].bottom - pr - 10;
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
      ctx.moveTo(pcx - pr, pcy);
      ctx.lineTo(pcx + pr, pcy);
      ctx.stroke();
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pcx, pcy);
      ctx.lineTo(pcx + pr * Math.cos(theta), pcy - pr * Math.sin(theta));
      ctx.stroke();
      ctx.restore();
      text(ctx, 'phasor', pcx, pcy + pr + 12, theme.text, 'center');
    },
    [result, clock, axisLabel]
  );

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[reducedMotion ? `${result.ePeak}|${result.iPeak}|${clock.version}` : 0]}
    />
  );
}
