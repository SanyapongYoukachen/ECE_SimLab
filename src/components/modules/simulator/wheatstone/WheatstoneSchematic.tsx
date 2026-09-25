'use client';

import { useCallback } from 'react';
import {
  drawWire,
  drawResistor,
  drawBattery,
  drawCurrentArrow,
  drawCurrentFlowDots,
  drawNodeDot,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import type { WheatstoneResult } from '@/lib/circuits/wheatstone';

const HEIGHT = 300;
const PAD_TOP = 44;
const PAD_BOTTOM = 44;
const BATTERY_X = 30;
const DIAMOND_LEFT = 118;
const DIAMOND_RIGHT_INSET = 78;
const GALVO_RADIUS = 13;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(1)}k` : `${Math.round(ohms)}`;
}

function compactI(amps: number): string {
  const mA = amps * 1000;
  return `${mA.toFixed(Math.abs(mA) < 10 ? 2 : 1)} mA`;
}

interface FlowSegment {
  readonly from: Point;
  readonly to: Point;
  readonly current: number;
}

interface Props {
  readonly result: WheatstoneResult;
}

/**
 * The Wheatstone bridge diamond: source on the left driving two parallel
 * dividers (R1/R2 and R3/R4), a galvanometer (Rg) bridging their midpoints.
 * Current direction/magnitude in every branch is animated as moving dots
 * (falling back to static arrows under prefers-reduced-motion) — the
 * galvanometer branch visibly slows to a stop as the bridge balances.
 */
export function WheatstoneSchematic({ result }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const top = PAD_TOP;
      const bottom = size.height - PAD_BOTTOM;
      // Margins shrink on narrow (mobile) canvases so the diamond keeps a
      // usable width instead of collapsing toward a sliver.
      const left = Math.max(64, Math.min(DIAMOND_LEFT, size.width * 0.24));
      const right = size.width - Math.max(48, Math.min(DIAMOND_RIGHT_INSET, size.width * 0.16));
      const centerX = (left + right) / 2;
      const midY = (top + bottom) / 2;

      const A: Point = { x: centerX, y: top };
      const B: Point = { x: left, y: midY };
      const C: Point = { x: right, y: midY };
      const D: Point = { x: centerX, y: bottom };
      const batteryTop: Point = { x: BATTERY_X, y: top };
      const batteryBottom: Point = { x: BATTERY_X, y: bottom };
      const galvo: Point = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };

      drawWire(ctx, [batteryTop, A], theme.structure);
      drawWire(ctx, [batteryBottom, D], theme.structure);
      drawBattery(ctx, { from: batteryBottom, to: batteryTop, color: theme.input });
      drawResistor(ctx, { from: A, to: B, color: theme.active });
      drawResistor(ctx, { from: B, to: D, color: theme.active });
      drawResistor(ctx, { from: A, to: C, color: theme.active });
      drawResistor(ctx, { from: C, to: D, color: theme.active });
      drawWire(ctx, [B, C], theme.structure, 1.5);

      for (const node of [A, B, C, D]) {
        drawNodeDot(ctx, { at: node, color: theme.structure, radius: 2.5 });
      }

      const supplyCurrent = result.i1 + result.i3;
      const maxCurrent = Math.max(Math.abs(supplyCurrent), 1e-9);
      const segments: readonly FlowSegment[] = [
        { from: batteryTop, to: A, current: supplyCurrent },
        { from: A, to: B, current: result.i1 },
        { from: A, to: C, current: result.i3 },
        { from: B, to: D, current: result.i2 },
        { from: C, to: D, current: result.i4 },
        { from: D, to: batteryBottom, current: supplyCurrent },
        { from: B, to: C, current: result.ig },
      ];

      if (reducedMotion) {
        for (const seg of segments) {
          const magnitude = Math.min(1, Math.abs(seg.current) / maxCurrent);
          if (magnitude < 0.02) continue;
          const mid = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
          const angle =
            Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) +
            (seg.current < 0 ? Math.PI : 0);
          drawCurrentArrow(ctx, {
            at: mid,
            angleRad: angle,
            color: theme.output,
            size: 5 + magnitude * 4,
            opacity: 0.3 + magnitude * 0.7,
          });
        }
      } else {
        for (const seg of segments) {
          drawCurrentFlowDots(ctx, seg, { color: theme.output, phase, maxCurrent });
        }
      }

      // Galvanometer symbol, painted over the B-C wire and its flow dots.
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(galvo.x, galvo.y, GALVO_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.active;
      ctx.font = 'bold 11px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', galvo.x, galvo.y + 0.5);
      ctx.restore();

      ctx.font = '11px var(--font-mono, monospace)';
      ctx.textBaseline = 'middle';
      function label(text: string, at: Point, color: string, align: CanvasTextAlign): void {
        ctx.save();
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, at.x, at.y);
        ctx.restore();
      }

      // Anchored 62% of the way toward each arm's outer vertex (B or C)
      // rather than dead-center, so the R1/R3 pair (sharing vertex A) and
      // the R2/R4 pair (sharing vertex D) don't collide on narrow canvases.
      const nearOuter = 0.62;
      label(`V=${result.voltage.toFixed(1)}V`, { x: BATTERY_X - 8, y: midY }, theme.input, 'right');
      label(
        `R1=${compactR(result.r1)}Ω`,
        { x: A.x + (B.x - A.x) * nearOuter, y: A.y + (B.y - A.y) * nearOuter - 12 },
        theme.active,
        'center'
      );
      label(
        `R2=${compactR(result.r2)}Ω`,
        { x: D.x + (B.x - D.x) * nearOuter, y: D.y + (B.y - D.y) * nearOuter + 12 },
        theme.active,
        'center'
      );
      label(
        `R3=${compactR(result.r3)}Ω`,
        { x: A.x + (C.x - A.x) * nearOuter, y: A.y + (C.y - A.y) * nearOuter - 12 },
        theme.active,
        'center'
      );
      label(
        `R4=${compactR(result.r4)}Ω`,
        { x: D.x + (C.x - D.x) * nearOuter, y: D.y + (C.y - D.y) * nearOuter + 12 },
        theme.active,
        'center'
      );
      label(
        `Ig=${compactI(result.ig)}`,
        { x: galvo.x, y: galvo.y + GALVO_RADIUS + 14 },
        theme.output,
        'center'
      );
    },
    [result, reducedMotion]
  );

  const ariaLabel = `Wheatstone bridge schematic. Galvanometer current ${compactI(result.ig)}, bridge is ${
    result.balanced ? 'balanced' : 'unbalanced'
  }. Current flow is animated through every branch, direction and speed reflecting each branch's current.`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
