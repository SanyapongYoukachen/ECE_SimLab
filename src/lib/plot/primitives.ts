import type { Scale } from './scale';
import { tickValues } from './scale';

export interface PlotArea {
  readonly width: number;
  readonly height: number;
  readonly xScale: Scale;
  readonly yScale: Scale;
}

export interface AxesOptions extends PlotArea {
  readonly structureColor: string;
  readonly textColor: string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly xTickFormat?: (v: number) => string;
  readonly yTickFormat?: (v: number) => string;
  readonly font?: string;
}

const defaultFormat = (v: number): string => {
  if (Object.is(v, -0)) v = 0;
  return Math.abs(v) < 1e-9 ? '0' : v.toFixed(Math.abs(v) < 10 ? 2 : 0);
};

/** Draws a zero baseline, light gridlines, and tick labels. Structure only — never carries data meaning. */
export function drawAxes(ctx: CanvasRenderingContext2D, opts: AxesOptions): void {
  const { width, height, xScale, yScale, structureColor, textColor } = opts;
  const font = opts.font ?? '11px var(--font-mono, monospace)';
  const xFmt = opts.xTickFormat ?? defaultFormat;
  const yFmt = opts.yTickFormat ?? defaultFormat;

  ctx.save();
  ctx.strokeStyle = structureColor;
  ctx.fillStyle = textColor;
  ctx.font = font;
  ctx.lineWidth = 1;

  // zero lines (emphasised)
  const zeroY = yScale.toPixel(0);
  const zeroX = xScale.toPixel(0);
  ctx.globalAlpha = 0.9;
  if (zeroY >= 0 && zeroY <= height) {
    ctx.beginPath();
    ctx.moveTo(0, Math.round(zeroY) + 0.5);
    ctx.lineTo(width, Math.round(zeroY) + 0.5);
    ctx.stroke();
  }
  if (zeroX >= 0 && zeroX <= width) {
    ctx.beginPath();
    ctx.moveTo(Math.round(zeroX) + 0.5, 0);
    ctx.lineTo(Math.round(zeroX) + 0.5, height);
    ctx.stroke();
  }

  // gridlines + labels
  ctx.globalAlpha = 0.35;
  ctx.textBaseline = 'top';
  const yTicks = tickValues(yScale.domain as [number, number], 4);
  for (const t of yTicks) {
    const py = yScale.toPixel(t);
    ctx.beginPath();
    ctx.moveTo(0, Math.round(py) + 0.5);
    ctx.lineTo(width, Math.round(py) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillText(yFmt(t), 4, Math.min(Math.max(py + 2, 0), height - 12));
    ctx.globalAlpha = 0.35;
  }

  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = 0.9;
  const xTicks = tickValues(xScale.domain as [number, number], Math.max(4, Math.floor(width / 60)));
  for (const t of xTicks) {
    const px = xScale.toPixel(t);
    const label = xFmt(t);
    const labelW = ctx.measureText(label).width;
    ctx.fillText(label, Math.min(Math.max(px - labelW / 2, 0), width - labelW), height - 2);
  }

  ctx.restore();
}

export interface StemsOptions extends PlotArea {
  readonly xs: readonly number[];
  readonly ys: readonly number[];
  readonly color: string;
  readonly radius?: number;
  readonly lineWidth?: number;
  readonly opacity?: number;
  readonly emphasizeIndex?: number;
}

/** Draws discrete-signal stems: a vertical line from zero to value, capped with a dot. */
export function drawStems(ctx: CanvasRenderingContext2D, opts: StemsOptions): void {
  const { xScale, yScale, xs, ys, color, radius = 3.5, lineWidth = 1.75, opacity = 1 } = opts;
  const zeroY = yScale.toPixel(0);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  for (let i = 0; i < xs.length; i++) {
    const px = xScale.toPixel(xs[i]);
    const py = yScale.toPixel(ys[i]);
    const emphasized = opts.emphasizeIndex === i;

    ctx.beginPath();
    ctx.moveTo(px, zeroY);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, emphasized ? radius * 1.6 : radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export interface LineOptions extends PlotArea {
  readonly xs: readonly number[];
  readonly ys: readonly number[];
  readonly color: string;
  readonly lineWidth?: number;
  readonly opacity?: number;
  readonly dash?: readonly number[];
}

export function drawLine(ctx: CanvasRenderingContext2D, opts: LineOptions): void {
  const { xScale, yScale, xs, ys, color, lineWidth = 2, opacity = 1, dash = [] } = opts;
  if (xs.length === 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash as number[]);
  ctx.beginPath();
  for (let i = 0; i < xs.length; i++) {
    const px = xScale.toPixel(xs[i]);
    const py = yScale.toPixel(ys[i]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** Shades the rectangle spanning a single overlapping (x[k], h[n-k]) product — the pointwise-multiply cue. */
export function drawProductShade(
  ctx: CanvasRenderingContext2D,
  opts: PlotArea & { x: number; color: string; halfWidthPx?: number; opacity?: number }
): void {
  const { xScale, x, color, halfWidthPx = 10, opacity = 0.15, height } = opts;
  const px = xScale.toPixel(x);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fillRect(px - halfWidthPx, 0, halfWidthPx * 2, height);
  ctx.restore();
}

export function drawMarker(
  ctx: CanvasRenderingContext2D,
  opts: PlotArea & { x: number; y: number; color: string; radius?: number }
): void {
  const { xScale, yScale, x, y, color, radius = 5 } = opts;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(xScale.toPixel(x), yScale.toPixel(y), radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawVerticalLine(
  ctx: CanvasRenderingContext2D,
  opts: PlotArea & { x: number; color: string; lineWidth?: number; dash?: readonly number[] }
): void {
  const { xScale, x, color, lineWidth = 1.5, dash = [4, 3], height } = opts;
  const px = xScale.toPixel(x);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash as number[]);
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, height);
  ctx.stroke();
  ctx.restore();
}
