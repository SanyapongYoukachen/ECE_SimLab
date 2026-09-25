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
import type { BridgeArm, SensorId } from '@/lib/circuits/sensors';
import { useMessages, type Messages } from '@/lib/i18n';
import { formatCurrent } from './format';

const HEIGHT = 300;
const PAD_TOP = 44;
const PAD_BOTTOM = 44;
const MARGIN_LEFT = 24;
/** Wider than the left margin: R3/R4 labels grow rightward past vertex C. */
const MARGIN_RIGHT = 40;
/** Horizontal run from the source to the diamond's left vertex B. */
const SOURCE_GAP = 80;
const GALVO_RADIUS = 18;
/** Needle swing at full deflection, either side of the centre zero. */
const NEEDLE_MAX_RAD = (55 * Math.PI) / 180;
// Underdamped on purpose: a real moving-coil needle overshoots and settles.
const NEEDLE_OMEGA = 14;
const NEEDLE_ZETA = 0.35;

function compactR(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)}M`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(1)}k`;
  // Decimals only when they carry information (a strain gauge's 351.05 Ω).
  return `${Number(ohms.toFixed(2))}`;
}

function needleDescription(
  ig: number,
  sensitivity: number,
  t: Messages['simulator']['wheatstone']
): string {
  const d = galvanometerDeflection(ig, sensitivity);
  if (Math.abs(d) < 0.02) return t.needleRest;
  return Math.abs(d) > 0.95 ? t.needlePinned(d > 0) : t.needleDeflects(d > 0);
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
  /** Sensing mode: which arm holds the sensor, and what kind (drawn with its circuit symbol). */
  readonly sensing?: { readonly arm: BridgeArm; readonly sensor: SensorId };
  /** Needle current scale (see galvanometerDeflection); sensing mode auto-ranges it per sensor. */
  readonly needleSensitivity?: number;
}

/** Arrowhead at `tip`, pointing along (dx, dy). */
function arrowhead(ctx: CanvasRenderingContext2D, tip: Point, dx: number, dy: number): void {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const s = 4.5;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - ux * s * 1.6 - uy * s, tip.y - uy * s * 1.6 + ux * s);
  ctx.lineTo(tip.x - ux * s * 1.6 + uy * s, tip.y - uy * s * 1.6 - ux * s);
  ctx.closePath();
  ctx.fill();
}

/**
 * Overlays the standard schematic mark for a sensor on its arm's zigzag:
 * light arrows for an LDR, the hooked diagonal of a thermistor (−t° for NTC,
 * +t° for an RTD), and the variable-resistor arrow for a strain gauge (ε) or
 * a plain variable resistor. `n` is the arm's outward normal.
 */
function drawSensorMark(
  ctx: CanvasRenderingContext2D,
  sensor: SensorId,
  mid: Point,
  u: Point,
  n: Point,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.font = '10px var(--font-mono, monospace)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (sensor === 'ldr') {
    for (const offset of [-7, 7]) {
      const start = {
        x: mid.x + n.x * 30 + u.x * (offset - 8),
        y: mid.y + n.y * 30 + u.y * (offset - 8),
      };
      const tip = { x: mid.x + n.x * 11 + u.x * offset, y: mid.y + n.y * 11 + u.y * offset };
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      arrowhead(ctx, tip, tip.x - start.x, tip.y - start.y);
    }
    ctx.restore();
    return;
  }

  // A diagonal across the zigzag, 45° between the arm and its normal.
  const d = { x: (u.x + n.x) / Math.SQRT2, y: (u.y + n.y) / Math.SQRT2 };
  const half = 17;
  const start = { x: mid.x - d.x * half, y: mid.y - d.y * half };
  const end = { x: mid.x + d.x * half, y: mid.y + d.y * half };
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  if (sensor === 'ntc' || sensor === 'rtd') {
    // Thermistor hook: a short tail parallel to the arm at the inner end.
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x - u.x * 8, start.y - u.y * 8);
    ctx.stroke();
    ctx.fillText(sensor === 'ntc' ? '−t°' : '+t°', end.x + n.x * 9, end.y + n.y * 9);
  } else {
    arrowhead(ctx, end, d.x, d.y);
    if (sensor === 'strain') ctx.fillText('ε', end.x + n.x * 9, end.y + n.y * 9);
  }
  ctx.restore();
}

/**
 * The Wheatstone bridge diamond: source on the left driving two parallel
 * dividers (R1/R2 and R3/R4), a galvanometer (Rg) bridging their midpoints.
 * Current direction/magnitude in every branch is animated as moving dots
 * (falling back to static arrows under prefers-reduced-motion) — the
 * galvanometer branch visibly slows to a stop as the bridge balances.
 */
export function WheatstoneSchematic({
  result,
  sensing,
  needleSensitivity,
}: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const t = useMessages().simulator.wheatstone;
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
      // A true 45° diamond (half-width = half-height) whenever the canvas is
      // wide enough, narrowing only on very small screens. Source plus diamond
      // are centred as one group, so extra width becomes margin, not
      // stretched arms or long source wires.
      const halfHeight = (bottom - top) / 2;
      const usable = size.width - MARGIN_LEFT - MARGIN_RIGHT;
      const halfWidth = Math.max(40, Math.min(halfHeight, (usable - SOURCE_GAP) / 2));
      const groupLeft = MARGIN_LEFT + Math.max(0, (usable - SOURCE_GAP - 2 * halfWidth) / 2);
      const batteryX = groupLeft;
      const left = groupLeft + SOURCE_GAP;
      const right = left + 2 * halfWidth;
      const centerX = left + halfWidth;
      const midY = top + halfHeight;

      const A: Point = { x: centerX, y: top };
      const B: Point = { x: left, y: midY };
      const C: Point = { x: right, y: midY };
      const D: Point = { x: centerX, y: bottom };
      const batteryTop: Point = { x: batteryX, y: top };
      const batteryBottom: Point = { x: batteryX, y: bottom };
      const galvo: Point = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };

      drawWire(ctx, [batteryTop, A], theme.structure);
      drawWire(ctx, [batteryBottom, D], theme.structure);
      drawBattery(ctx, { from: batteryBottom, to: batteryTop, color: theme.input });
      const arms: Readonly<Record<BridgeArm, { from: Point; to: Point }>> = {
        r1: { from: A, to: B },
        r2: { from: B, to: D },
        r3: { from: A, to: C },
        r4: { from: C, to: D },
      };
      // In sensing mode the three fixed arms recede to wiring grey; only the
      // sensor keeps the "under your control" colour.
      const armColor = (arm: BridgeArm): string =>
        !sensing || sensing.arm === arm ? theme.active : theme.structure;
      for (const arm of ['r1', 'r2', 'r3', 'r4'] as const) {
        drawResistor(ctx, { ...arms[arm], color: armColor(arm) });
      }
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
      stepNeedle(
        needle,
        galvanometerDeflection(result.ig, needleSensitivity),
        phase,
        !reducedMotion
      );
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
      function armLabel(text: string, arm: BridgeArm): void {
        const { from, to } = arms[arm];
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
        const u = { x: (to.x - from.x) / len, y: (to.y - from.y) / len };
        let nx = -u.y;
        let ny = u.x;
        if (nx * (mid.x - centerX) + ny * (mid.y - midY) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const isSensor = sensing?.arm === arm;
        if (sensing && isSensor) {
          drawSensorMark(ctx, sensing.sensor, mid, u, { x: nx, y: ny }, theme.active);
        }
        // The sensor's label steps further out, clear of its symbol.
        const gap = isSensor ? 36 : 14;
        label(
          text,
          { x: mid.x + nx * gap, y: mid.y + ny * gap },
          armColor(arm),
          mid.x < centerX ? 'right' : 'left'
        );
      }

      label(
        `V=${result.voltage.toFixed(1)}V`,
        { x: batteryX + 10, y: midY - 20 },
        theme.input,
        'left'
      );
      armLabel(`R1=${compactR(result.r1)}Ω`, 'r1');
      armLabel(`R2=${compactR(result.r2)}Ω`, 'r2');
      armLabel(`R3=${compactR(result.r3)}Ω`, 'r3');
      armLabel(`R4=${compactR(result.r4)}Ω`, 'r4');
      label(
        `Ig=${formatCurrent(result.ig)}`,
        { x: galvo.x, y: galvo.y + GALVO_RADIUS + 14 },
        theme.output,
        'center'
      );
    },
    [result, reducedMotion, sensing, needleSensitivity]
  );

  const ariaLabel = t.schematicAria(
    formatCurrent(result.ig),
    result.balanced,
    needleDescription(result.ig, needleSensitivity ?? 2e-3, t)
  );

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[result, sensing?.arm, sensing?.sensor, needleSensitivity]}
    />
  );
}
