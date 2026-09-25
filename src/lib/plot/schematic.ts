/**
 * Hand-drawn schematic primitives (US convention) for the circuits module.
 * Unlike lib/plot's other drawing functions, these work in raw CSS-pixel
 * canvas coordinates rather than through a data Scale — a schematic's
 * layout is fixed geometry, not plotted data.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function drawWire(
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  color: string,
  lineWidth = 2
): void {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
  ctx.restore();
}

export interface ResistorOptions {
  readonly from: Point;
  readonly to: Point;
  readonly color: string;
  readonly lineWidth?: number;
  readonly peaks?: number;
  readonly bodyRatio?: number;
  readonly ampPx?: number;
}

/** Draws a resistor as lead-zigzag-lead between two points. */
export function drawResistor(ctx: CanvasRenderingContext2D, opts: ResistorOptions): void {
  const { from, to, color, lineWidth = 2, peaks = 6, bodyRatio = 0.6, ampPx = 8 } = opts;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;

  const bodyStart = lerp(from, to, (1 - bodyRatio) / 2);
  const bodyEnd = lerp(from, to, 1 - (1 - bodyRatio) / 2);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(bodyStart.x, bodyStart.y);
  ctx.moveTo(bodyEnd.x, bodyEnd.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bodyStart.x, bodyStart.y);
  const segments = peaks * 2;
  for (let k = 1; k <= segments; k++) {
    const base = lerp(bodyStart, bodyEnd, k / segments);
    const offset = k === segments ? 0 : ampPx * (k % 2 === 1 ? 1 : -1);
    ctx.lineTo(base.x + px * offset, base.y + py * offset);
  }
  ctx.stroke();
  ctx.restore();
}

export interface BatteryOptions {
  readonly from: Point;
  readonly to: Point;
  readonly color: string;
  readonly lineWidth?: number;
  readonly gapPx?: number;
  readonly longBarLenPx?: number;
  readonly shortBarLenPx?: number;
}

/** Draws a DC source: a long thin bar (+) and a short thick bar (−) between two leads. */
export function drawBattery(ctx: CanvasRenderingContext2D, opts: BatteryOptions): void {
  const { from, to, color, lineWidth = 2, gapPx = 7, longBarLenPx = 18, shortBarLenPx = 9 } = opts;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const mid = lerp(from, to, 0.5);
  const longBarCenter = { x: mid.x - (ux * gapPx) / 2, y: mid.y - (uy * gapPx) / 2 };
  const shortBarCenter = { x: mid.x + (ux * gapPx) / 2, y: mid.y + (uy * gapPx) / 2 };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';

  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(longBarCenter.x, longBarCenter.y);
  ctx.moveTo(shortBarCenter.x, shortBarCenter.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(longBarCenter.x + (px * longBarLenPx) / 2, longBarCenter.y + (py * longBarLenPx) / 2);
  ctx.lineTo(longBarCenter.x - (px * longBarLenPx) / 2, longBarCenter.y - (py * longBarLenPx) / 2);
  ctx.stroke();

  ctx.lineWidth = lineWidth * 2.5;
  ctx.beginPath();
  ctx.moveTo(
    shortBarCenter.x + (px * shortBarLenPx) / 2,
    shortBarCenter.y + (py * shortBarLenPx) / 2
  );
  ctx.lineTo(
    shortBarCenter.x - (px * shortBarLenPx) / 2,
    shortBarCenter.y - (py * shortBarLenPx) / 2
  );
  ctx.stroke();
  ctx.restore();
}

export interface CurrentArrowOptions {
  readonly at: Point;
  readonly angleRad: number;
  readonly color: string;
  readonly size?: number;
  readonly opacity?: number;
}

/** Draws a small filled triangle indicating conventional current direction. */
export function drawCurrentArrow(ctx: CanvasRenderingContext2D, opts: CurrentArrowOptions): void {
  const { at, angleRad, color, size = 7, opacity = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.translate(at.x, at.y);
  ctx.rotate(angleRad);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.6, size * 0.55);
  ctx.lineTo(-size * 0.6, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawNodeDot(
  ctx: CanvasRenderingContext2D,
  opts: { at: Point; color: string; radius?: number }
): void {
  const { at, color, radius = 3 } = opts;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export interface FlowDotsOptions {
  readonly color: string;
  /** Elapsed seconds, monotonically increasing — drives dot position each frame. */
  readonly phase: number;
  /** Current (amps) at the top of the visual speed/opacity scale, shared across a schematic's segments so branches are comparable. */
  readonly maxCurrent: number;
  readonly dotSpacingPx?: number;
  readonly dotRadius?: number;
  readonly maxSpeedPxPerSec?: number;
}

/**
 * Draws small moving dots along a wire segment — conventional current flow.
 * Direction follows the sign of `current` (positive = from -> to); speed and
 * opacity scale with |current| / maxCurrent, so a near-zero branch reads as
 * faint and nearly still rather than just "a dimmer version of moving."
 * Respect prefers-reduced-motion by not calling this at all (draw a static
 * drawCurrentArrow instead) — this function itself has no reduced-motion
 * awareness since it doesn't own the animation loop driving `phase`.
 */
export function drawCurrentFlowDots(
  ctx: CanvasRenderingContext2D,
  segment: { from: Point; to: Point; current: number },
  opts: FlowDotsOptions
): void {
  const { from, to, current } = segment;
  const {
    color,
    phase,
    maxCurrent,
    dotSpacingPx = 16,
    dotRadius = 2.2,
    maxSpeedPxPerSec = 70,
  } = opts;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;

  const magnitude = Math.min(1, Math.abs(current) / Math.max(maxCurrent, 1e-9));
  const dir = current >= 0 ? 1 : -1;
  const traveled = phase * magnitude * maxSpeedPxPerSec * dir;
  const offset = ((traveled % dotSpacingPx) + dotSpacingPx) % dotSpacingPx;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.22 + magnitude * 0.68;
  for (let d = offset; d < len; d += dotSpacingPx) {
    const t = d / len;
    ctx.beginPath();
    ctx.arc(from.x + dx * t, from.y + dy * t, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
