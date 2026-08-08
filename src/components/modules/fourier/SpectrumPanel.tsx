'use client';

import { useCallback } from 'react';
import { drawAxes, drawStems, drawLine, drawVerticalLine, type PlotTheme } from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';
import { spectrumScales, magnitudeToDb, THRESHOLD_DB } from './scales';
import type { MagnitudeSpectrum } from '@/lib/dsp';

const HEIGHT = 240;

interface Props {
  readonly spectrum: MagnitudeSpectrum;
  readonly referenceSpectrum: MagnitudeSpectrum;
  readonly showReference: boolean;
  readonly variableFreq: number;
  readonly maxFreq: number;
}

export function SpectrumPanel({
  spectrum,
  referenceSpectrum,
  showReference,
  variableFreq,
  maxFreq,
}: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const { xScale, yScale } = spectrumScales(size, maxFreq);

      drawAxes(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        structureColor: theme.structure,
        textColor: theme.text,
        yTickFormat: (v) => `${Math.round(v)}`,
        xTickFormat: (v) => `${Math.round(v)}`,
      });

      drawVerticalLine(ctx, {
        width: size.width,
        height: size.height,
        xScale,
        yScale,
        x: variableFreq,
        color: theme.active,
        lineWidth: 1.25,
      });

      if (showReference) {
        const idxLimit = referenceSpectrum.freqs.findIndex((f) => f > maxFreq);
        const limit = idxLimit === -1 ? referenceSpectrum.freqs.length : idxLimit;
        drawLine(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: Array.from(referenceSpectrum.freqs.subarray(0, limit)),
          ys: Array.from(referenceSpectrum.mag.subarray(0, limit)).map(magnitudeToDb),
          color: theme.structure,
          lineWidth: 1.25,
          dash: [3, 3],
          opacity: 0.8,
        });
      }

      const freqs: number[] = [];
      const magsDb: number[] = [];
      for (let i = 0; i < spectrum.freqs.length; i++) {
        if (spectrum.freqs[i] > maxFreq) break;
        freqs.push(spectrum.freqs[i]);
        magsDb.push(magnitudeToDb(spectrum.mag[i]));
      }

      // bins above threshold: full-strength output colour; below: faint structure colour
      const below = { xs: [] as number[], ys: [] as number[] };
      const above = { xs: [] as number[], ys: [] as number[] };
      freqs.forEach((f, i) => {
        if (magsDb[i] >= THRESHOLD_DB) {
          above.xs.push(f);
          above.ys.push(magsDb[i]);
        } else {
          below.xs.push(f);
          below.ys.push(magsDb[i]);
        }
      });

      if (below.xs.length > 0) {
        drawStems(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: below.xs,
          ys: below.ys,
          color: theme.structure,
          opacity: 0.5,
          radius: 2,
        });
      }
      if (above.xs.length > 0) {
        drawStems(ctx, {
          width: size.width,
          height: size.height,
          xScale,
          yScale,
          xs: above.xs,
          ys: above.ys,
          color: theme.output,
          radius: 3,
        });
      }
    },
    [spectrum, referenceSpectrum, showReference, variableFreq, maxFreq]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-[var(--foreground)]/50">vertical axis: dB, full scale = 0</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-output)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">bins above threshold</span>
        </span>
        {showReference && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-3 border-t-2 border-dashed border-[var(--plot-structure)]"
              aria-hidden="true"
            />
            <span className="text-[var(--foreground)]/70">rectangular-window reference</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full bg-[var(--plot-active)]"
            aria-hidden="true"
          />
          <span className="text-[var(--foreground)]/70">component 3&apos;s true frequency</span>
        </span>
      </div>
      <PlotCanvas
        height={HEIGHT}
        ariaLabel="Magnitude spectrum of the observed signal, in decibels relative to full scale, versus frequency in Hertz."
        onDraw={handleDraw}
        deps={[spectrum, referenceSpectrum, showReference, variableFreq, maxFreq]}
      />
    </div>
  );
}
