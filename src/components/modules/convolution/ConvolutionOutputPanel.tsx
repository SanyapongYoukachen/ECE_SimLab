'use client';

import { useCallback } from 'react';
import { drawAxes, drawStems, type PlotTheme } from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import { useMessages } from '@/lib/i18n';
import { bottomScales } from './scales';

const HEIGHT = 200;

interface Props {
  readonly y: readonly number[];
  readonly n: number;
}

export function ConvolutionOutputPanel({ y, n }: Props): React.JSX.Element {
  const t = useMessages().convolution;
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const { xScale, yScale } = bottomScales(size, y);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
        xLabel: 'n',
      });

      const doneXs = [];
      const doneYs = [];
      const futureXs = [];
      const futureYs = [];
      for (let i = 0; i < y.length; i++) {
        if (i <= n) {
          doneXs.push(i);
          doneYs.push(y[i]);
        } else {
          futureXs.push(i);
          futureYs.push(y[i]);
        }
      }

      if (futureXs.length > 0) {
        drawStems(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: futureXs,
          ys: futureYs,
          color: theme.structure,
          opacity: 0.3,
        });
      }

      if (doneXs.length > 0) {
        drawStems(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: doneXs,
          ys: doneYs,
          color: theme.output,
          emphasizeIndex: doneXs.length - 1,
        });
      }
    },
    [y, n]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-output)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">{t.legendY}</span>
        </span>
        <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono tabular-nums text-[var(--foreground)]/80">
          {t.outputLength(y.length)}
        </span>
      </div>
      <PlotCanvas
        height={HEIGHT}
        ariaLabel={t.outputAria(y.length, n, (y[n] ?? 0).toFixed(2))}
        onDraw={handleDraw}
        deps={[y, n]}
      />
    </div>
  );
}
