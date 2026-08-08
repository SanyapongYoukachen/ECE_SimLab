'use client';

import { useCallback } from 'react';
import { linearScale, autoscaleWithZero, drawAxes, drawLine, type PlotTheme } from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';

const HEIGHT = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 14;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;

interface Props {
  readonly direct: readonly number[];
  readonly viaFft: readonly number[];
}

export function OverlayPanel({ direct, viaFft }: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const xScale = linearScale(
        [0, Math.max(1, direct.length - 1)],
        [PAD_LEFT, size.width - PAD_RIGHT]
      );
      const yScale = linearScale(autoscaleWithZero(direct, 0.25), [
        size.height - PAD_BOTTOM,
        PAD_TOP,
      ]);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
      });

      const xs = direct.map((_, i) => i);
      drawLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs,
        ys: direct as number[],
        color: theme.input,
        lineWidth: 2.5,
      });
      drawLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs,
        ys: viaFft as number[],
        color: theme.output,
        lineWidth: 1.25,
        dash: [5, 4],
      });
    },
    [direct, viaFft]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-input)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">x * h, computed directly</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-output)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">
            IFFT(FFT(x) · FFT(h)) — dashed, should trace the same curve
          </span>
        </span>
      </div>
      <PlotCanvas
        height={HEIGHT}
        ariaLabel="Direct convolution and FFT-based convolution results overlaid — they should be visually indistinguishable."
        onDraw={handleDraw}
        deps={[direct, viaFft]}
      />
    </div>
  );
}
