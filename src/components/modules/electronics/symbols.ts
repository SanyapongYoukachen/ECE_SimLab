import type { Point } from '@/lib/plot';

/**
 * Schematic symbols lib/plot doesn't have: a diode (optionally an LED with
 * its emission arrows), an NPN transistor and a capacitor.
 */

/** Diode from anode to cathode: triangle pointing along the current, bar at the cathode. */
export function drawDiode(
  ctx: CanvasRenderingContext2D,
  anode: Point,
  cathode: Point,
  color: string,
  led?: { readonly glow: string; readonly intensity: number }
): void {
  const dx = cathode.x - anode.x;
  const dy = cathode.y - anode.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const mid = { x: (anode.x + cathode.x) / 2, y: (anode.y + cathode.y) / 2 };
  const s = 11;
  const back = { x: mid.x - ux * s, y: mid.y - uy * s };
  const tip = { x: mid.x + ux * s * 0.8, y: mid.y + uy * s * 0.8 };

  if (led && led.intensity > 0.01) {
    ctx.save();
    const g = ctx.createRadialGradient(mid.x, mid.y, 2, mid.x, mid.y, 46);
    g.addColorStop(0, led.glow);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(1, led.intensity);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mid.x, mid.y, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(anode.x, anode.y);
  ctx.lineTo(back.x, back.y);
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(cathode.x, cathode.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(back.x + px * s, back.y + py * s);
  ctx.lineTo(back.x - px * s, back.y - py * s);
  ctx.lineTo(tip.x, tip.y);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tip.x + px * s, tip.y + py * s);
  ctx.lineTo(tip.x - px * s, tip.y - py * s);
  ctx.stroke();
  if (led) {
    // Two arrows leaving the diode: light out.
    ctx.strokeStyle = led.intensity > 0.01 ? led.glow : color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.5;
    for (const k of [-0.4, 0.4]) {
      const sx = mid.x + px * (s + 6) + ux * k * 14;
      const sy = mid.y + py * (s + 6) + uy * k * 14;
      const ex = sx + px * 14 + ux * 6;
      const ey = sy + py * 14 + uy * 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      const a = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 6 * Math.cos(a - 0.45), ey - 6 * Math.sin(a - 0.45));
      ctx.lineTo(ex - 6 * Math.cos(a + 0.45), ey - 6 * Math.sin(a + 0.45));
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * NPN transistor, base on the left: a circle with the base bar, collector
 * leaving up and emitter down, the emitter arrow pointing out (NPN).
 * Returns the three terminal points.
 */
export function drawNpn(
  ctx: CanvasRenderingContext2D,
  center: Point,
  color: string,
  r = 22
): { base: Point; collector: Point; emitter: Point } {
  const barX = center.x - r * 0.35;
  const base = { x: center.x - r - 14, y: center.y };
  const collector = { x: center.x + r * 0.5, y: center.y - r - 14 };
  const emitter = { x: center.x + r * 0.5, y: center.y + r + 14 };
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(barX, center.y);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(barX, center.y - r * 0.55);
  ctx.lineTo(barX, center.y + r * 0.55);
  ctx.stroke();
  ctx.lineWidth = 2;
  const cIn = { x: barX, y: center.y - r * 0.25 };
  const eIn = { x: barX, y: center.y + r * 0.25 };
  const cOut = { x: collector.x, y: center.y - r * 0.75 };
  const eOut = { x: emitter.x, y: center.y + r * 0.75 };
  ctx.beginPath();
  ctx.moveTo(cIn.x, cIn.y);
  ctx.lineTo(cOut.x, cOut.y);
  ctx.lineTo(collector.x, collector.y);
  ctx.moveTo(eIn.x, eIn.y);
  ctx.lineTo(eOut.x, eOut.y);
  ctx.lineTo(emitter.x, emitter.y);
  ctx.stroke();
  // Emitter arrow, pointing away from the base.
  const a = Math.atan2(eOut.y - eIn.y, eOut.x - eIn.x);
  const t = { x: eIn.x + (eOut.x - eIn.x) * 0.8, y: eIn.y + (eOut.y - eIn.y) * 0.8 };
  ctx.beginPath();
  ctx.moveTo(t.x, t.y);
  ctx.lineTo(t.x - 8 * Math.cos(a - 0.45), t.y - 8 * Math.sin(a - 0.45));
  ctx.lineTo(t.x - 8 * Math.cos(a + 0.45), t.y - 8 * Math.sin(a + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  return { base, collector, emitter };
}

/** A capacitor across a gap from `a` to `b`: two plates, faded when `active` is false. */
export function drawCapacitor(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  color: string,
  active = true
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const gap = 4;
  const plate = 11;
  ctx.save();
  ctx.globalAlpha = active ? 1 : 0.3;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(mid.x - ux * gap, mid.y - uy * gap);
  ctx.moveTo(mid.x + ux * gap, mid.y + uy * gap);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  for (const s of [-gap, gap]) {
    ctx.beginPath();
    ctx.moveTo(mid.x + ux * s + px * plate, mid.y + uy * s + py * plate);
    ctx.lineTo(mid.x + ux * s - px * plate, mid.y + uy * s - py * plate);
    ctx.stroke();
  }
  ctx.restore();
}
