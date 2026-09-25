'use client';

import { useCallback } from 'react';
import { linearScale, drawAxes, drawLine, type PlotTheme, type Scale } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import { animationAngle, cursorTime } from './clock';

const PANEL_HEIGHT = 118;
const GAP = 14;
const PAD_LEFT = 54;
const PAD_RIGHT = 12;
const PAD_TOP = 18;
const PAD_BOTTOM = 18;
const SAMPLES = 360;

type ThemeColor = 'input' | 'active' | 'output' | 'structure';

export interface StackSeries {
  readonly f: (t: number) => number;
  readonly color: ThemeColor;
  /** Shade the area between the curve and zero. */
  readonly fill?: boolean;
}

export interface StackLine {
  readonly y: number;
  readonly label: string;
  readonly color: ThemeColor;
}

export interface StackPanel {
  readonly title: string;
  readonly series: readonly StackSeries[];
  readonly lines?: readonly StackLine[];
  readonly format: (v: number) => string;
  /** A bracket between two times, drawn near the top of this panel. */
  readonly bracket?: { readonly from: number; readonly to: number; readonly label: string };
}

interface Props {
  readonly panels: readonly StackPanel[];
  /** One period, in seconds; the plots span two. */
  readonly period: number;
  /** Times to mark with a vertical guide through every panel (e.g. zero crossings). */
  readonly guides?: readonly { readonly t: number; readonly color: ThemeColor }[];
  readonly ariaLabel: string;
}

/**
 * Stacked small multiples on one shared time axis: each quantity keeps its
 * own panel and y-scale (never two units on one axis), and a cursor synced
 * to the phasor sweeps all of them together.
 */
export function TimeStack({ panels, period, guides, ariaLabel }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const height = panels.length * PANEL_HEIGHT + (panels.length - 1) * GAP;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const span = 2 * period;
      const ts = Array.from({ length: SAMPLES + 1 }, (_, k) => (k / SAMPLES) * span);
      const xScale = linearScale([0, span], [PAD_LEFT, size.width - PAD_RIGHT]);
      const tCursor = cursorTime(animationAngle(reducedMotion), period);
      const color = (c: ThemeColor): string => theme[c];

      panels.forEach((panel, index) => {
        const top = index * (PANEL_HEIGHT + GAP);
        const values = panel.series.map((s) => ts.map((t) => s.f(t)));
        const all = [...values.flat(), ...(panel.lines ?? []).map((l) => l.y), 0];
        const lo = Math.min(...all);
        const hi = Math.max(...all);
        const pad = (hi - lo || 1) * 0.14;
        const yScale: Scale = linearScale(
          [lo - pad, hi + pad],
          [PANEL_HEIGHT - PAD_BOTTOM, PAD_TOP]
        );
        const area = { width: size.width, height: PANEL_HEIGHT, xScale, yScale };
        const isLast = index === panels.length - 1;

        ctx.save();
        ctx.translate(0, top);
        drawAxes(ctx, {
          ...area,
          structureColor: theme.structure,
          textColor: theme.text,
          // Only the bottom panel labels time; the others share its axis.
          xTickFormat: (v) => (isLast ? `${Number((v * 1000).toFixed(1))}` : ''),
          yTickFormat: panel.format,
        });

        panel.series.forEach((s, si) => {
          if (s.fill) {
            ctx.save();
            ctx.fillStyle = color(s.color);
            ctx.globalAlpha = 0.16;
            ctx.beginPath();
            ctx.moveTo(xScale.toPixel(0), yScale.toPixel(0));
            ts.forEach((t, k) => ctx.lineTo(xScale.toPixel(t), yScale.toPixel(values[si][k])));
            ctx.lineTo(xScale.toPixel(span), yScale.toPixel(0));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          drawLine(ctx, { ...area, xs: ts, ys: values[si], color: color(s.color), lineWidth: 2 });
        });

        for (const line of panel.lines ?? []) {
          const y = yScale.toPixel(line.y);
          ctx.save();
          ctx.strokeStyle = color(line.color);
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(PAD_LEFT, y);
          ctx.lineTo(size.width - PAD_RIGHT, y);
          ctx.stroke();
          ctx.setLineDash([]);
          // Label on a surface plate so the curve beneath never garbles it.
          ctx.font = '10px var(--font-mono, monospace)';
          const labelW = ctx.measureText(line.label).width;
          const lx = size.width - PAD_RIGHT - 2 - labelW;
          ctx.fillStyle = theme.surface;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(lx - 3, y - 15, labelW + 6, 13);
          ctx.globalAlpha = 1;
          ctx.fillStyle = theme.text;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(line.label, lx, y - 3);
          ctx.restore();
        }

        if (panel.bracket) {
          const x0 = xScale.toPixel(panel.bracket.from);
          const x1 = xScale.toPixel(panel.bracket.to);
          const y = PAD_TOP - 6;
          ctx.save();
          ctx.strokeStyle = theme.text;
          ctx.fillStyle = theme.text;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(x0, y - 4);
          ctx.lineTo(x0, y + 4);
          ctx.moveTo(x0, y);
          ctx.lineTo(x1, y);
          ctx.moveTo(x1, y - 4);
          ctx.lineTo(x1, y + 4);
          ctx.stroke();
          ctx.font = '10px var(--font-mono, monospace)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(panel.bracket.label, Math.max(x0, x1) + 6, y);
          ctx.restore();
        }

        // Cursor dot on each curve.
        const xc = xScale.toPixel(tCursor);
        panel.series.forEach((s) => {
          ctx.save();
          ctx.fillStyle = color(s.color);
          ctx.strokeStyle = theme.surface;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(xc, yScale.toPixel(s.f(tCursor)), 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        ctx.save();
        ctx.fillStyle = theme.text;
        ctx.font = '11px var(--font-mono, monospace)';
        ctx.textBaseline = 'top';
        ctx.fillText(panel.title, PAD_LEFT + 4, 0);
        ctx.restore();
        ctx.restore();
      });

      // Guides and cursor run through the whole stack.
      for (const g of guides ?? []) {
        const x = xScale.toPixel(g.t);
        ctx.save();
        ctx.strokeStyle = color(g.color);
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.height - PAD_BOTTOM);
        ctx.stroke();
        ctx.restore();
      }
      const xc = xScale.toPixel(tCursor);
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(xc, 0);
      ctx.lineTo(xc, size.height - PAD_BOTTOM);
      ctx.stroke();
      ctx.restore();
    },
    [panels, period, guides, reducedMotion]
  );

  return (
    <div className="flex flex-col gap-1">
      <AnimatedCanvas
        height={height}
        ariaLabel={ariaLabel}
        onDraw={handleDraw}
        // The loop reads the latest draw function each frame, so data changes
        // needn't restart it; only reduced motion's single still frame must
        // be redrawn when the data changes.
        deps={[reducedMotion ? handleDraw : null]}
      />
      <div className="text-right font-mono text-xs text-[var(--foreground)]/50">t (ms)</div>
    </div>
  );
}
