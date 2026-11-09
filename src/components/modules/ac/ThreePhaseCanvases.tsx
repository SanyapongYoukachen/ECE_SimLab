'use client';

import { useCallback } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import { PHASES, PHASE_SHIFT, type Phase, type ThreePhaseResult } from '@/lib/circuits/generator';
import { animationAngle } from './clock';
import { PHASE_COLOR, PHASE_LABEL } from './phaseColors';

const NORTH = '#3b82d6';
const SOUTH = '#d9483b';

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'center',
  font = '11px var(--font-mono, monospace)'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  width = 2.5,
  dash: number[] = []
): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 2) return;
  const head = Math.min(9, len * 0.5);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
  ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Coil axis of each phase: a at 0°, b at 120°, c at 240° (so b lags a, c lags b). */
const AXIS: Readonly<Record<Phase, number>> = { a: 0, b: (2 * Math.PI) / 3, c: (4 * Math.PI) / 3 };

/**
 * A real generator turned inside out: the magnet spins, and three fixed
 * stator coils 120° apart pick up three EMFs 120° apart. Each coil's two
 * slots show its current direction (⊙ out, ⊗ in), fading through zero.
 */
export function ThreePhaseMachine({
  ariaLabel,
}: {
  readonly ariaLabel: string;
}): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const rOuter = Math.min(w, h) / 2 - 18;
      const rSlot = rOuter - 18;
      const rMag = rOuter * 0.5;
      const theta = animationAngle(reducedMotion);

      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Rotor: a bar magnet, N end at θ.
      const ux = Math.cos(theta);
      const uy = -Math.sin(theta);
      const bw = rMag * 0.42;
      for (const [sign, color, label] of [
        [1, NORTH, 'N'],
        [-1, SOUTH, 'S'],
      ] as const) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-theta);
        ctx.fillStyle = color;
        ctx.fillRect(sign > 0 ? 0 : -rMag, -bw / 2, rMag, bw);
        ctx.restore();
        text(
          ctx,
          label,
          cx + sign * ux * rMag * 0.6,
          cy + sign * uy * rMag * 0.6,
          '#ffffff',
          'center',
          'bold 14px sans-serif'
        );
      }
      ctx.save();
      ctx.fillStyle = theme.structure;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Stator slots. Coil k's EMF ∝ sin(θ − axis): its sides sit 90° either side of its axis.
      for (const k of PHASES) {
        const e = Math.sin(theta + PHASE_SHIFT[k]);
        const color = PHASE_COLOR[k];
        for (const [offset, sign, prime] of [
          [Math.PI / 2, 1, ''],
          [-Math.PI / 2, -1, "'"],
        ] as const) {
          const a = AXIS[k] + offset;
          const x = cx + rSlot * Math.cos(a);
          const y = cy - rSlot * Math.sin(a);
          ctx.save();
          ctx.fillStyle = theme.surface;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          const dir = e * sign;
          ctx.globalAlpha = Math.min(1, Math.abs(e) * 1.4);
          ctx.fillStyle = color;
          if (dir > 0.05) {
            ctx.beginPath();
            ctx.arc(x, y, 3.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (dir < -0.05) {
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.stroke();
          }
          ctx.restore();
          const lr = rOuter + 8;
          text(
            ctx,
            `${PHASE_LABEL[k].toLowerCase()}${prime}`,
            cx + lr * Math.cos(a),
            cy - lr * Math.sin(a),
            color,
            'center',
            'bold 12px var(--font-mono, monospace)'
          );
        }
      }
    },
    [reducedMotion]
  );

  return <AnimatedCanvas height={260} ariaLabel={ariaLabel} onDraw={handleDraw} />;
}

/**
 * Three voltage phasors 120° apart, turning together, with the line
 * voltage Vab (from Vb's tip to Va's: √3 longer, 30° ahead) and the phase
 * currents lagging by the load angle. An unbalanced load's neutral current
 * appears as a grey arrow.
 */
export function ThreePhasePhasors({
  result,
  ariaLabel,
}: {
  readonly result: ThreePhaseResult;
  readonly ariaLabel: string;
}): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2 - 30;
      const theta = animationAngle(reducedMotion);
      const vScale = r / Math.max(result.vPhase.a.mag, 1e-9);
      const iMax = Math.max(...PHASES.map((k) => result.iLine[k].mag), result.iNeutral.mag, 1e-9);
      const iScale = (r * 0.6) / iMax;
      const tip = (mag: number, ang: number, scale: number): { x: number; y: number } => ({
        x: cx + mag * scale * Math.cos(theta + ang),
        y: cy - mag * scale * Math.sin(theta + ang),
      });

      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.moveTo(cx - r - 8, cy);
      ctx.lineTo(cx + r + 8, cy);
      ctx.moveTo(cx, cy - r - 8);
      ctx.lineTo(cx, cy + r + 8);
      ctx.stroke();
      ctx.restore();

      const vt: Record<Phase, { x: number; y: number }> = {
        a: tip(result.vPhase.a.mag, result.vPhase.a.angle, vScale),
        b: tip(result.vPhase.b.mag, result.vPhase.b.angle, vScale),
        c: tip(result.vPhase.c.mag, result.vPhase.c.angle, vScale),
      };
      // Line voltage Vab = Va − Vb: from Vb's tip to Va's.
      arrow(ctx, vt.b.x, vt.b.y, vt.a.x, vt.a.y, theme.text, 1.5, [5, 4]);
      text(ctx, 'Vab', (vt.a.x + vt.b.x) / 2 + 14, (vt.a.y + vt.b.y) / 2, theme.text);

      for (const k of PHASES) {
        arrow(ctx, cx, cy, vt[k].x, vt[k].y, PHASE_COLOR[k], 2.8);
        text(
          ctx,
          `V${k}`,
          cx + (vt[k].x - cx) * 1.14,
          cy + (vt[k].y - cy) * 1.14,
          PHASE_COLOR[k],
          'center',
          'bold 11px var(--font-mono, monospace)'
        );
        const it = tip(result.iLine[k].mag, result.iLine[k].angle, iScale);
        arrow(ctx, cx, cy, it.x, it.y, PHASE_COLOR[k], 1.6, [2, 2]);
        text(ctx, `I${k}`, cx + (it.x - cx) * 1.2, cy + (it.y - cy) * 1.2, PHASE_COLOR[k]);
      }
      if (result.iNeutral.mag > iMax * 0.01) {
        const nt = tip(result.iNeutral.mag, result.iNeutral.angle, iScale);
        arrow(ctx, cx, cy, nt.x, nt.y, theme.structure, 2);
        text(ctx, 'In', cx + (nt.x - cx) * 1.25, cy + (nt.y - cy) * 1.25, theme.text);
      }
    },
    [result, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={260}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[reducedMotion ? result : null]}
    />
  );
}
