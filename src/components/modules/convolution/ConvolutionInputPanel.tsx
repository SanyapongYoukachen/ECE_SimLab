'use client';

import { useCallback, useRef } from 'react';
import type { ConvStep } from '@/lib/dsp';
import { drawAxes, drawStems, drawProductShade, type PlotTheme } from '@/lib/plot';
import { PlotCanvas, type PlotPoint } from '@/components/ui';
import { clamp, nearestSampleIndex } from '@/lib/plot/hitTest';
import { topScales } from './scales';

const HEIGHT = 220;
const X_MIN = -2;
const X_MAX = 2;

interface Props {
  readonly x: readonly number[];
  readonly kernelValues: readonly number[];
  readonly n: number;
  readonly step: ConvStep | undefined;
  readonly onEditSample: (index: number, value: number) => void;
  readonly selectedIndex: number | null;
  readonly onSelectIndex: (index: number | null) => void;
}

export function ConvolutionInputPanel({
  x,
  kernelValues,
  n,
  step,
  onEditSample,
  selectedIndex,
  onSelectIndex,
}: Props): React.JSX.Element {
  const draggingRef = useRef<number | null>(null);

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const { xScale, yScale } = topScales(size, x, kernelValues);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
        xLabel: 'k',
      });

      if (step) {
        for (const term of step.terms) {
          drawProductShade(ctx, {
            width: size.width,
            height: size.height,
            xScale,
            yScale,
            x: term.i,
            color: theme.active,
            opacity: 0.14,
            halfWidthPx: 12,
          });
        }
      }

      drawStems(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs: x.map((_, i) => i),
        ys: x as number[],
        color: theme.input,
        emphasizeIndex: selectedIndex ?? undefined,
      });

      const kernelXs = kernelValues.map((_, j) => n - j);
      drawStems(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs: kernelXs,
        ys: kernelValues as number[],
        color: theme.active,
        radius: 3,
      });
    },
    [x, kernelValues, n, step, selectedIndex]
  );

  function commitDrag(pos: PlotPoint, size: { width: number; height: number }): void {
    const { yScale } = topScales(size, x, kernelValues);
    const index = draggingRef.current;
    if (index === null) return;
    const value = clamp(yScale.toValue(pos.y), X_MIN, X_MAX);
    onEditSample(index, Math.round(value * 100) / 100);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-input)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">x[k] — drag a stem to edit it</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-active)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">
            h[n−k] — the kernel, flipped and shifted
          </span>
        </span>
      </div>
      <PlotCanvas
        height={HEIGHT}
        interactive
        ariaLabel={`Input signal and flipped kernel at shift n=${n}. Use arrow keys to select and edit a sample.`}
        onDraw={handleDraw}
        deps={[x, kernelValues, n, step, selectedIndex]}
        onPointerDown={(pos, e) => {
          const canvas = e.currentTarget;
          const size = { width: canvas.clientWidth, height: canvas.clientHeight };
          const { xScale } = topScales(size, x, kernelValues);
          const idx = nearestSampleIndex(
            x.map((_, i) => i),
            xScale,
            pos.x,
            18
          );
          if (idx !== null) {
            draggingRef.current = idx;
            onSelectIndex(idx);
            canvas.setPointerCapture(e.pointerId);
            commitDrag(pos, size);
          }
        }}
        onPointerMoveCanvas={(pos, e) => {
          if (draggingRef.current === null) return;
          const canvas = e.currentTarget;
          commitDrag(pos, { width: canvas.clientWidth, height: canvas.clientHeight });
        }}
        onPointerUpCanvas={() => {
          draggingRef.current = null;
        }}
        onKeyDownCanvas={(e) => {
          if (x.length === 0) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSelectIndex(Math.min(x.length - 1, (selectedIndex ?? -1) + 1));
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSelectIndex(Math.max(0, (selectedIndex ?? 1) - 1));
          } else if (e.key === 'ArrowUp' && selectedIndex !== null) {
            e.preventDefault();
            onEditSample(
              selectedIndex,
              Math.round(clamp(x[selectedIndex] + 0.1, X_MIN, X_MAX) * 100) / 100
            );
          } else if (e.key === 'ArrowDown' && selectedIndex !== null) {
            e.preventDefault();
            onEditSample(
              selectedIndex,
              Math.round(clamp(x[selectedIndex] - 0.1, X_MIN, X_MAX) * 100) / 100
            );
          }
        }}
      />
    </div>
  );
}
