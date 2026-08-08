'use client';

import { useCallback, useMemo } from 'react';
import {
  linearScale,
  autoscale,
  drawAxes,
  drawLine,
  drawVerticalLine,
  drawMarker,
  type PlotTheme,
} from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import { directConvOps, fftConvOps } from '@/lib/dsp';
import { MAX_LENGTH } from './constants';

const HEIGHT = 220;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;
const SAMPLE_COUNT = 100;
const MAX_N = MAX_LENGTH;

interface Props {
  readonly n: number;
}

export function CostChart({ n }: Props): React.JSX.Element {
  const { ns, directOps, fftOps } = useMemo(() => {
    const ns: number[] = [];
    const directOps: number[] = [];
    const fftOps: number[] = [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const sampleN = Math.round(4 + (i / (SAMPLE_COUNT - 1)) * (MAX_N - 4));
      ns.push(sampleN);
      directOps.push(directConvOps(sampleN, sampleN));
      fftOps.push(fftConvOps(sampleN, sampleN));
    }
    return { ns, directOps, fftOps };
  }, []);

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const xScale = linearScale([4, MAX_N], [PAD_LEFT, size.width - PAD_RIGHT]);
      const yScale = linearScale(autoscale(directOps, 0.08), [size.height - PAD_BOTTOM, PAD_TOP]);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
        yTickFormat: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v).toString()),
      });

      drawLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs: ns,
        ys: directOps,
        color: theme.active,
        lineWidth: 2,
      });
      drawLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        xs: ns,
        ys: fftOps,
        color: theme.output,
        lineWidth: 2,
      });

      drawVerticalLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        x: n,
        color: theme.structure,
      });
      drawMarker(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        x: n,
        y: directConvOps(n, n),
        color: theme.active,
        radius: 4,
      });
      drawMarker(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        x: n,
        y: fftConvOps(n, n),
        color: theme.output,
        radius: 4,
      });
    },
    [n, ns, directOps, fftOps]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-active)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">direct: O(N·M) operations</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-output)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">FFT-based: O(N log N) operations</span>
        </span>
      </div>
      <PlotCanvas
        height={HEIGHT}
        ariaLabel={`Operation count versus signal length, up to N=${MAX_N}. Direct convolution grows quadratically; the FFT path grows almost flat by comparison. Current length: ${n}.`}
        onDraw={handleDraw}
        deps={[n, ns, directOps, fftOps]}
      />
    </div>
  );
}
