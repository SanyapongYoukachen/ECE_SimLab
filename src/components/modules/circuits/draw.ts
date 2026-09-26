import type { Point } from '@/lib/plot';

/**
 * Schematic pieces the Thévenin/Norton and mesh/node sections need beyond
 * lib/plot's wire, resistor and battery: labels, a current source, ground,
 * open terminals, a dashed "black box" and mesh-current loop arrows.
 */

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left',
  font = '11px var(--font-mono, monospace)'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Ideal current source: a circle with an arrow pointing the way the current leaves its top. */
export function drawCurrentSource(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string
): void {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const r = 15;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(cx, cy + r);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Arrow from bottom to top (current delivered out of the top terminal).
  ctx.beginPath();
  ctx.moveTo(cx, cy + 9);
  ctx.lineTo(cx, cy - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx - 5, cy - 3);
  ctx.lineTo(cx + 5, cy - 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawGround(ctx: CanvasRenderingContext2D, at: Point, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  ctx.lineTo(at.x, at.y + 8);
  for (const [half, dy] of [
    [10, 8],
    [6, 12],
    [2, 16],
  ] as const) {
    ctx.moveTo(at.x - half, at.y + dy);
    ctx.lineTo(at.x + half, at.y + dy);
  }
  ctx.stroke();
  ctx.restore();
}

/** An open terminal: a small hollow circle on the wire, over a surface-coloured fill. */
export function drawTerminal(
  ctx: CanvasRenderingContext2D,
  at: Point,
  stroke: string,
  fill: string
): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(at.x, at.y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawDashedBox(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
  ctx.restore();
}

/** A mesh current: a ¾ circle, arrowhead showing clockwise (positive) or anticlockwise flow. */
export function drawLoopArrow(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  clockwise: boolean,
  color: string
): void {
  const start = -Math.PI * 0.75;
  const end = start + Math.PI * 1.5;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, start, end);
  ctx.stroke();
  // Arrowhead at the end the current is heading to.
  const at = clockwise ? end : start;
  const tip = { x: center.x + radius * Math.cos(at), y: center.y + radius * Math.sin(at) };
  // Tangent direction of travel.
  const dir = clockwise ? at + Math.PI / 2 : at - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(tip.x + 7 * Math.cos(dir), tip.y + 7 * Math.sin(dir));
  ctx.lineTo(tip.x + 5 * Math.cos(dir + 2.2), tip.y + 5 * Math.sin(dir + 2.2));
  ctx.lineTo(tip.x + 5 * Math.cos(dir - 2.2), tip.y + 5 * Math.sin(dir - 2.2));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A branch-current arrow beside a wire or resistor, pointing from `from` to `to` when current > 0. */
export function branchArrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  horizontal: boolean,
  current: number,
  color: string
): void {
  const sign = current >= 0 ? 1 : -1;
  const angle = horizontal ? (sign > 0 ? 0 : Math.PI) : sign > 0 ? Math.PI / 2 : -Math.PI / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(at.x, at.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(7, 0);
  ctx.lineTo(-5, 5);
  ctx.lineTo(-5, -5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
