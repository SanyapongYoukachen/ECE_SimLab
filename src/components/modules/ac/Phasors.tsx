'use client';

import { useCallback } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas, PlotCanvas, usePrefersReducedMotion } from '@/components/ui';
import { animationAngle } from './clock';

const PHASOR_HEIGHT = 240;
const TRIANGLE_HEIGHT = 190;

function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  width = 2.5
): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const head = 9;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
  ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
  ctx.font = '11px var(--font-mono, monospace)';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

function faintCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  theme: PlotTheme
): void {
  ctx.save();
  ctx.strokeStyle = theme.structure;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.moveTo(cx - r - 8, cy);
  ctx.lineTo(cx + r + 8, cy);
  ctx.moveTo(cx, cy - r - 8);
  ctx.lineTo(cx, cy + r + 8);
  ctx.stroke();
  ctx.restore();
}

/**
 * The classic picture: an arrow of length Vp rotating anticlockwise at ω,
 * its vertical projection drawing the sine wave beside it. The phase φ is
 * the arrow's head start at t = 0.
 */
export function SinePhasor({
  phase,
  ariaLabel,
}: {
  readonly phase: number;
  readonly ariaLabel: string;
}): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const r = Math.min(h / 2 - 24, w * 0.2);
      const cx = r + 24;
      const cy = h / 2;
      const angle = animationAngle(reducedMotion) + phase;
      const tipX = cx + r * Math.cos(angle);
      const tipY = cy - r * Math.sin(angle);

      faintCircle(ctx, cx, cy, r, theme);

      // The trace: one full cycle, positioned so the current angle sits at its left end.
      const x0 = cx + r + 28;
      const x1 = w - 10;
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(x0, cy);
      ctx.lineTo(x1, cy);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = theme.input;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 120;
      for (let k = 0; k <= steps; k++) {
        // Moving right = further back in time, like a pen trace scrolling away.
        const back = (k / steps) * 2 * Math.PI;
        const x = x0 + (k / steps) * (x1 - x0);
        const y = cy - r * Math.sin(angle - back);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Projection from the arrow tip to the pen.
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(x0, tipY);
      ctx.stroke();
      ctx.restore();

      arrow(ctx, cx, cy, tipX, tipY, theme.input);
      ctx.save();
      ctx.fillStyle = theme.input;
      ctx.beginPath();
      ctx.arc(x0, tipY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // The phase: the arrow's position at t = 0.
      if (Math.abs(phase) > 1e-6) {
        arrow(
          ctx,
          cx,
          cy,
          cx + r * 0.55 * Math.cos(phase),
          cy - r * 0.55 * Math.sin(phase),
          theme.structure,
          1.5
        );
        text(ctx, 'φ', cx + r * 0.3, cy - (phase > 0 ? 10 : -10), theme.text);
      }
      text(ctx, 'Vp', tipX + 6 * Math.cos(angle), tipY - 10 * Math.sin(angle) - 6, theme.input);
    },
    [phase, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={PHASOR_HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[reducedMotion ? phase : null]}
    />
  );
}

/**
 * V and I as rotating phasors, the angle θ between them marked. Voltage is
 * the reference; the current sits θ behind it (lagging, inductive) or ahead
 * (leading, capacitive) in the anticlockwise direction of rotation.
 */
export function LoadPhasor({
  theta,
  ariaLabel,
}: {
  readonly theta: number;
  readonly ariaLabel: string;
}): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const r = Math.min(h / 2 - 22, w / 2 - 40);
      const cx = w / 2;
      const cy = h / 2;
      const a = animationAngle(reducedMotion);
      faintCircle(ctx, cx, cy, r, theme);

      // θ arc from I round to V.
      if (Math.abs(theta) > 1e-6) {
        ctx.save();
        ctx.strokeStyle = theme.active;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const from = -a;
        const to = -(a - theta);
        ctx.arc(cx, cy, r * 0.32, Math.min(from, to), Math.max(from, to));
        ctx.stroke();
        ctx.restore();
        const mid = a - theta / 2;
        text(
          ctx,
          'θ',
          cx + r * 0.44 * Math.cos(mid),
          cy - r * 0.44 * Math.sin(mid),
          theme.active,
          'center'
        );
      }

      const vx = cx + r * Math.cos(a);
      const vy = cy - r * Math.sin(a);
      const ix = cx + r * 0.68 * Math.cos(a - theta);
      const iy = cy - r * 0.68 * Math.sin(a - theta);
      arrow(ctx, cx, cy, vx, vy, theme.input);
      arrow(ctx, cx, cy, ix, iy, theme.output);
      text(ctx, 'V', vx + 10 * Math.cos(a), vy - 10 * Math.sin(a), theme.input, 'center');
      text(
        ctx,
        'I',
        ix + 10 * Math.cos(a - theta),
        iy - 10 * Math.sin(a - theta),
        theme.output,
        'center'
      );

      // Direction of rotation.
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 12, -0.35, -0.05);
      ctx.stroke();
      ctx.restore();
      text(ctx, 'ω ↺', cx + r + 16, cy - r * 0.18, theme.structure);
    },
    [theta, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={PHASOR_HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[reducedMotion ? theta : null]}
    />
  );
}

/** P along the base, Q up (lagging) or down (leading), S on the hypotenuse, θ at the origin. */
export function PowerTriangle({
  p,
  q,
  s,
  labels,
  ariaLabel,
}: {
  readonly p: number;
  readonly q: number;
  readonly s: number;
  readonly labels: { readonly p: string; readonly q: string; readonly s: string };
  readonly ariaLabel: string;
}): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      if (s <= 0) return;
      const pad = 24;
      // Scale S to fit whichever dimension is tighter; the triangle keeps its true shape.
      const scale = Math.min(
        (w - 2 * pad - 110) / Math.max(Math.abs(p), 1e-9),
        (h - 2 * pad) / Math.max(Math.abs(q), 1e-9),
        (Math.min(w, h * 1.8) - 2 * pad) / s
      );
      const ox = pad;
      const oy = q >= 0 ? h - pad : pad;
      const px = ox + p * scale;
      const qy = oy - q * scale;

      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = theme.output;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(px, oy);
      ctx.stroke();
      ctx.strokeStyle = theme.active;
      ctx.beginPath();
      ctx.moveTo(px, oy);
      ctx.lineTo(px, qy);
      ctx.stroke();
      ctx.strokeStyle = theme.text;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(px, qy);
      ctx.stroke();
      ctx.restore();

      if (Math.abs(q) > 1e-9 && p > 1e-9) {
        const th = Math.atan2(q, p);
        ctx.save();
        ctx.strokeStyle = theme.structure;
        ctx.beginPath();
        ctx.arc(ox, oy, 26, Math.min(0, -th), Math.max(0, -th));
        ctx.stroke();
        ctx.restore();
        text(ctx, 'θ', ox + 32 * Math.cos(-th / 2), oy + 32 * Math.sin(-th / 2), theme.text);
      }
      text(ctx, labels.p, (ox + px) / 2, oy + (q >= 0 ? 12 : -12), theme.text, 'center');
      text(ctx, labels.q, px + 8, (oy + qy) / 2, theme.text, 'left');
      const sx = (ox + px) / 2 - 8;
      const sy = (oy + qy) / 2 + (q >= 0 ? -10 : 10);
      text(ctx, labels.s, sx, sy, theme.text, 'right');
    },
    [p, q, s, labels]
  );

  return (
    <PlotCanvas
      height={TRIANGLE_HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[p, q, s, labels.p]}
    />
  );
}
