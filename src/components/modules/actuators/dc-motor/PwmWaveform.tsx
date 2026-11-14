'use client';

import { useCallback } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { PlotCanvas } from '@/components/ui';

const HEIGHT = 150;
const PERIODS = 3;
const MARGIN = { left: 50, right: 14, top: 22, bottom: 30 };

interface Props {
  readonly supplyVoltage: number;
  /** 0–1. */
  readonly duty: number;
}

/**
 * The voltage the PWM switch actually applies to the armature: full supply
 * for the on-time, zero for the rest of each period. The dashed line is its
 * average, duty × supply, which is what sets the motor's speed.
 */
export function PwmWaveform({ supplyVoltage, duty }: Props): React.JSX.Element {
  const average = supplyVoltage * duty;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const left = MARGIN.left;
      const right = size.width - MARGIN.right;
      const high = MARGIN.top;
      const low = size.height - MARGIN.bottom;
      const period = (right - left) / PERIODS;
      const onWidth = period * duty;
      const averageY = low - (low - high) * duty;

      ctx.font = '11px var(--font-mono, monospace)';
      ctx.textBaseline = 'middle';

      // Baseline and the supply level.
      ctx.save();
      ctx.strokeStyle = theme.structureFaint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, high);
      ctx.lineTo(right, high);
      ctx.moveTo(left, low);
      ctx.lineTo(right, low);
      ctx.stroke();
      ctx.restore();

      // On-time pulses.
      ctx.save();
      ctx.fillStyle = theme.input;
      ctx.globalAlpha = 0.16;
      for (let i = 0; i < PERIODS; i++) {
        ctx.fillRect(left + i * period, high, onWidth, low - high);
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = theme.input;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      ctx.moveTo(left, duty > 0 ? high : low);
      for (let i = 0; i < PERIODS; i++) {
        const start = left + i * period;
        if (duty > 0) {
          ctx.lineTo(start, high);
          ctx.lineTo(start + onWidth, high);
        }
        if (duty < 1) {
          ctx.lineTo(start + onWidth, low);
          ctx.lineTo(start + period, low);
        }
      }
      ctx.stroke();
      ctx.restore();

      // The average the motor responds to.
      ctx.save();
      ctx.strokeStyle = theme.output;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(left, averageY);
      ctx.lineTo(right, averageY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      const averageLabel = `Vavg = ${average.toFixed(2)} V`;
      // Keep the label clear of the supply line when the two nearly coincide.
      const labelY = duty > 0.8 ? averageY + 11 : averageY - 10;
      const labelWidth = ctx.measureText(averageLabel).width;
      ctx.fillStyle = theme.surface;
      ctx.fillRect(right - labelWidth - 7, labelY - 7, labelWidth + 7, 14);
      ctx.fillStyle = theme.output;
      ctx.textAlign = 'right';
      ctx.fillText(averageLabel, right - 3, labelY);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'right';
      ctx.fillText(`${supplyVoltage.toFixed(1)} V`, left - 6, high);
      ctx.fillText('0 V', left - 6, low);
      ctx.restore();

      // Dimension marks under the first period: on-time and the whole period.
      function span(from: number, to: number, y: number, text: string, color: string): void {
        if (to - from < 2) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(from, y - 3);
        ctx.lineTo(from, y + 3);
        ctx.moveTo(to, y - 3);
        ctx.lineTo(to, y + 3);
        ctx.moveTo(from, y);
        ctx.lineTo(to, y);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText(text, (from + to) / 2, y + 10);
        ctx.restore();
      }
      span(left, left + onWidth, low + 7, 'on', theme.input);
      span(left + period, left + 2 * period, low + 7, 'period T', theme.structure);
    },
    [supplyVoltage, duty, average]
  );

  const ariaLabel = `PWM waveform: the armature voltage switches between ${supplyVoltage.toFixed(1)} volts and zero, on for ${(duty * 100).toFixed(0)} percent of each period. Average ${average.toFixed(2)} volts.`;

  return (
    <PlotCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[supplyVoltage, duty]}
    />
  );
}
