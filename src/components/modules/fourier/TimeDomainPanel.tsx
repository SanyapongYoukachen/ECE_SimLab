'use client';

import { useCallback } from 'react';
import { drawAxes, drawLine, type PlotTheme } from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import { timeScales } from './scales';
import type { WindowType } from '@/lib/dsp';
import { makeWindow } from '@/lib/dsp';

const HEIGHT = 200;

interface Props {
  readonly signal: readonly number[];
  readonly window: WindowType;
}

export function TimeDomainPanel({ signal, window }: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const { xScale, yScale } = timeScales(size, signal.length, signal);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
      });

      const xs = signal.map((_, i) => i);
      drawLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs,
        ys: signal as number[],
        color: theme.input,
        lineWidth: 1.75,
      });

      if (window !== 'rect') {
        const w = makeWindow(window, signal.length);
        const windowed = signal.map((v, i) => v * w[i]);
        drawLine(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs,
          ys: windowed,
          color: theme.active,
          lineWidth: 2,
        });
      }
    },
    [signal, window]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-input)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">observed signal (sum of 3 components)</span>
        </span>
        {window !== 'rect' && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--plot-active)]"
              aria-hidden="true"
            />
            <span className="text-[var(--foreground)]/70">
              after windowing — tapered at the edges
            </span>
          </span>
        )}
      </div>
      <PlotCanvas
        height={HEIGHT}
        ariaLabel={`Time-domain signal, ${signal.length} samples, built from three sinusoidal components.`}
        onDraw={handleDraw}
        deps={[signal, window]}
      />
    </div>
  );
}
