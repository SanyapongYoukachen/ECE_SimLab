'use client';

import { useEffect, useRef, useState } from 'react';
import { setupCanvasDPR, readPlotTheme, type PlotTheme } from '@/lib/plot';
import { useThemeVersion } from './useThemeWatcher';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface AnimatedCanvasProps {
  readonly height: number;
  readonly ariaLabel: string;
  readonly onDraw: (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    theme: PlotTheme,
    /** Seconds elapsed since this draw loop (re)started; 0 and frozen under prefers-reduced-motion. */
    phase: number
  ) => void;
  /** Redraw-loop restart triggers beyond size/theme changes. Must be a stable-length array at each call site. */
  readonly deps?: readonly unknown[];
  readonly className?: string;
}

/**
 * Like PlotCanvas, but drives its own requestAnimationFrame loop instead of
 * redrawing only when `deps` change — for schematics with continuous motion
 * (moving current-flow dots). Respects prefers-reduced-motion by rendering a
 * single static frame at phase=0 instead of looping, matching how the
 * convolution module falls back to a manual Step button.
 */
export function AnimatedCanvas({
  height,
  ariaLabel,
  onDraw,
  deps = [],
  className,
}: AnimatedCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const themeVersion = useThemeVersion();
  const reducedMotion = usePrefersReducedMotion();

  // Read through a ref so a fresh onDraw identity each render doesn't tear
  // down and restart the animation loop (and its elapsed-time origin).
  // Updated post-render (not during) so it stays a plain ref write, not a
  // render-time mutation.
  const onDrawRef = useRef(onDraw);
  useEffect(() => {
    onDrawRef.current = onDraw;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && Math.abs(w - width) > 0.5) setWidth(Math.round(w));
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const { ctx } = setupCanvasDPR(canvas, width, height);
    const theme = readPlotTheme();

    if (reducedMotion) {
      onDrawRef.current(ctx, { width, height }, theme, 0);
      return;
    }

    let raf = 0;
    const start = performance.now();
    function frame(now: number): void {
      onDrawRef.current(ctx, { width, height }, theme, (now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, themeVersion, reducedMotion, ...deps]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className="block w-full rounded-md"
        style={{ height }}
      />
    </div>
  );
}
