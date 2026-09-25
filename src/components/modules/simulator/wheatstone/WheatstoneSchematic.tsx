'use client';

import { useCallback, useRef } from 'react';
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
import { galvanometerDeflection, type WheatstoneResult } from '@/lib/circuits/wheatstone';

const HEIGHT = 300;
const PAD_TOP = 44;
const PAD_BOTTOM = 44;
const BATTERY_X = 30;
const DIAMOND_LEFT = 118;
const DIAMOND_RIGHT_INSET = 78;
const GALVO_RADIUS = 18;
/** Max diamond half-width as a multiple of its full height. */
const DIAMOND_MAX_ASPECT = 1.1;
/** Needle swing at full deflection, either side of the centre zero. */
const NEEDLE_MAX_RAD = (55 * Math.PI) / 180;
// Underdamped on purpose: a real moving-coil needle overshoots and settles.
const NEEDLE_OMEGA = 14;
const NEEDLE_ZETA = 0.35;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(1)}k` : `${Math.round(ohms)}`;
}

function compactI(amps: number): string {
  const mA = amps * 1000;
  return `${mA.toFixed(Math.abs(mA) < 10 ? 2 : 1)} mA`;
}

function needleDescription(ig: number): string {
  const d = galvanometerDeflection(ig);
  if (Math.abs(d) < 0.02) return 'rests at centre zero';
  const side = d > 0 ? 'right' : 'left';
  return Math.abs(d) > 0.95 ? `is pinned hard ${side}` : `deflects ${side}`;
}

interface FlowSegment {
  readonly from: Point;
  readonly to: Point;
  readonly current: number;
}

interface NeedleState {
  position: number;
  velocity: number;
  lastPhase: number;
}

/** Advances the needle's spring one frame toward `target`; snaps under reduced motion. */
function stepNeedle(needle: NeedleState, target: number, phase: number, animate: boolean): void {
  if (!animate) {
    needle.position = target;
    needle.velocity = 0;
    return;
  }
  // AnimatedCanvas restarts phase at 0 whenever the circuit changes, so a
  // backwards step means "new loop", not negative time.
  const raw = phase >= needle.lastPhase ? phase - needle.lastPhase : phase;
  needle.lastPhase = phase;
  const dt = Math.min(raw, 1 / 30);
  const accel =
    NEEDLE_OMEGA * NEEDLE_OMEGA * (target - needle.position) -
    2 * NEEDLE_ZETA * NEEDLE_OMEGA * needle.velocity;
  needle.velocity += accel * dt;
  needle.position += needle.velocity * dt;
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
  const needleRef = useRef<NeedleState>({ position: 0, velocity: 0, lastPhase: 0 });

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
      const availLeft = Math.max(64, Math.min(DIAMOND_LEFT, size.width * 0.24));
      const availRight =
        size.width - Math.max(48, Math.min(DIAMOND_RIGHT_INSET, size.width * 0.16));
      // Cap the aspect ratio so a wide desktop canvas keeps a diamond rather
      // than stretching it into a flat lens; extra width goes to the source wires.
      const halfWidth = Math.min((availRight - availLeft) / 2, (bottom - top) * DIAMOND_MAX_ASPECT);
      const centerX = (availLeft + availRight) / 2;
      const left = centerX - halfWidth;
      const right = centerX + halfWidth;
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

      // Galvanometer: a centre-zero meter face painted over the B-C wire and
      // its flow dots, needle deflecting right for current B -> C.
      const needle = needleRef.current;
      stepNeedle(needle, galvanometerDeflection(result.ig), phase, !reducedMotion);
      const pivot: Point = { x: galvo.x, y: galvo.y + 8 };
      const scaleR = 14;
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(galvo.x, galvo.y, GALVO_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.lineCap = 'round';
      for (const t of [-1, -0.5, 0, 0.5, 1]) {
        const a = t * NEEDLE_MAX_RAD;
        const inner = t === 0 ? scaleR - 5 : scaleR - 3;
        ctx.strokeStyle = t === 0 && result.balanced ? theme.output : theme.structure;
        ctx.lineWidth = t === 0 ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(pivot.x + inner * Math.sin(a), pivot.y - inner * Math.cos(a));
        ctx.lineTo(pivot.x + scaleR * Math.sin(a), pivot.y - scaleR * Math.cos(a));
        ctx.stroke();
      }

      const clamped = Math.max(-1.1, Math.min(1.1, needle.position));
      const needleAngle = clamped * NEEDLE_MAX_RAD;
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pivot.x, pivot.y);
      ctx.lineTo(
        pivot.x + (scaleR - 1) * Math.sin(needleAngle),
        pivot.y - (scaleR - 1) * Math.cos(needleAngle)
      );
      ctx.stroke();
      ctx.fillStyle = theme.active;
      ctx.beginPath();
      ctx.arc(pivot.x, pivot.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 7px var(--font-mono, monospace)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', galvo.x, pivot.y + 5.5);
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

      // Each arm's label sits just off its midpoint on the side away from the
      // diamond's centre, and grows outward from there (right-aligned on the
      // left arms, left-aligned on the right), so it never crosses the zigzag
      // whatever the arm's slope.
      function armLabel(text: string, from: Point, to: Point): void {
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
        let nx = -(to.y - from.y) / len;
        let ny = (to.x - from.x) / len;
        if (nx * (mid.x - centerX) + ny * (mid.y - midY) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const gap = 14;
        label(
          text,
          { x: mid.x + nx * gap, y: mid.y + ny * gap },
          theme.active,
          mid.x < centerX ? 'right' : 'left'
        );
      }

      label(
        `V=${result.voltage.toFixed(1)}V`,
        { x: BATTERY_X + 10, y: midY - 20 },
        theme.input,
        'left'
      );
      armLabel(`R1=${compactR(result.r1)}Ω`, A, B);
      armLabel(`R2=${compactR(result.r2)}Ω`, B, D);
      armLabel(`R3=${compactR(result.r3)}Ω`, A, C);
      armLabel(`R4=${compactR(result.r4)}Ω`, C, D);
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
  }. Current flow is animated through every branch, direction and speed reflecting each branch's current. The galvanometer needle ${needleDescription(result.ig)}.`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
