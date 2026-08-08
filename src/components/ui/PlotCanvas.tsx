'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { setupCanvasDPR, readPlotTheme, type PlotTheme } from '@/lib/plot';
import { useThemeVersion } from './useThemeWatcher';

export interface PlotPoint {
  readonly x: number;
  readonly y: number;
}

export interface PlotCanvasProps {
  readonly height: number;
  readonly ariaLabel: string;
  readonly onDraw: (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    theme: PlotTheme
  ) => void;
  /** Redraw triggers beyond size/theme changes. Must be a stable-length array at each call site. */
  readonly deps?: readonly unknown[];
  readonly interactive?: boolean;
  readonly onPointerDown?: (pos: PlotPoint, e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerMoveCanvas?: (pos: PlotPoint, e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerUpCanvas?: (pos: PlotPoint, e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onKeyDownCanvas?: (e: KeyboardEvent<HTMLCanvasElement>) => void;
  readonly className?: string;
}

/**
 * Thin React wrapper around the lib/plot primitives: owns the canvas
 * element, keeps its backing store sized for devicePixelRatio, redraws on
 * container resize / theme change / explicit deps, and translates pointer
 * events into CSS-pixel coordinates for hit-testing.
 */
export function PlotCanvas({
  height,
  ariaLabel,
  onDraw,
  deps = [],
  interactive = false,
  onPointerDown,
  onPointerMoveCanvas,
  onPointerUpCanvas,
  onKeyDownCanvas,
  className,
}: PlotCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const themeVersion = useThemeVersion();

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
    onDraw(ctx, { width, height }, theme);
    // Redraw whenever size, theme, or caller-supplied deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, themeVersion, ...deps]);

  function toLocal(e: PointerEvent<HTMLCanvasElement>): PlotPoint {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        role={interactive ? 'application' : 'img'}
        aria-label={ariaLabel}
        tabIndex={0}
        className="block w-full rounded-md"
        style={{ height }}
        onPointerDown={onPointerDown ? (e) => onPointerDown(toLocal(e), e) : undefined}
        onPointerMove={onPointerMoveCanvas ? (e) => onPointerMoveCanvas(toLocal(e), e) : undefined}
        onPointerUp={onPointerUpCanvas ? (e) => onPointerUpCanvas(toLocal(e), e) : undefined}
        onKeyDown={onKeyDownCanvas}
      />
    </div>
  );
}
