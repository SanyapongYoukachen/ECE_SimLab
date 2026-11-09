'use client';

import {
  drawBattery,
  drawCurrentArrow,
  drawCurrentFlowDots,
  drawNodeDot,
  drawResistor,
  drawWire,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import type { TransducerId } from '@/lib/circuits/transducer';

const HEIGHT = 260;

export interface CircuitLabels {
  readonly sensorName: string;
  readonly sensorValue: string;
  readonly fixedName: string;
  readonly fixedValue: string;
  readonly supply: string;
  readonly vout: string;
  readonly adcTitle: string;
  readonly adcCode: string;
  readonly adcBinary: string;
  readonly flow: string;
  readonly current: string;
}

interface Props {
  readonly sensor: TransducerId;
  readonly current: number;
  /** Largest current across the sensor's range: sets the dots' top speed. */
  readonly maxCurrent: number;
  readonly flow: 'electron' | 'conventional';
  readonly labels: CircuitLabels;
  readonly ariaLabel: string;
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left',
  font = '12px var(--font-mono, monospace)'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** The sensor's schematic mark: incoming light arrows (LDR) or a diagonal slash with −t° (NTC). */
function sensorMark(
  ctx: CanvasRenderingContext2D,
  sensor: TransducerId,
  at: Point,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  if (sensor === 'ldr') {
    for (const dy of [-10, 6]) {
      const x0 = at.x + 34;
      const y0 = at.y + dy - 14;
      const x1 = at.x + 14;
      const y1 = at.y + dy;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - 7 * Math.cos(a - 0.4), y1 - 7 * Math.sin(a - 0.4));
      ctx.lineTo(x1 - 7 * Math.cos(a + 0.4), y1 - 7 * Math.sin(a + 0.4));
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(at.x - 16, at.y + 18);
    ctx.lineTo(at.x + 12, at.y - 18);
    ctx.lineTo(at.x + 20, at.y - 18);
    ctx.stroke();
    ctx.restore();
    text(ctx, '−t°', at.x + 22, at.y - 26, color, 'left', '11px var(--font-mono, monospace)');
    return;
  }
  ctx.restore();
}

/**
 * The sensor in its circuit: a voltage divider across 5 V, the sensor on
 * top and a fixed 10 kΩ resistor below, feeding a 10-bit ADC. Moving dots
 * show the charge flowing — as electrons (out of the battery's − terminal,
 * the way they really move) or as conventional current (out of +).
 */
export function DividerCircuit({
  sensor,
  current,
  maxCurrent,
  flow,
  labels,
  ariaLabel,
}: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  // AnimatedCanvas reads onDraw through a ref, so a fresh function each render is fine.
  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    theme: PlotTheme,
    phase: number
  ) => {
    const { width: w, height: h } = size;
    ctx.clearRect(0, 0, w, h);

    const top = 52;
    const bottom = h - 26;
    const mid = (top + bottom) / 2;
    const bx = 40;
    const adcW = Math.min(132, Math.max(104, w * 0.3));
    const adcRight = w - 8;
    const adcLeft = adcRight - adcW;
    const cx = bx + Math.max(60, (adcLeft - bx) * 0.42);

    const batTop: Point = { x: bx, y: top };
    const batBottom: Point = { x: bx, y: bottom };
    const railTop: Point = { x: cx, y: top };
    const node: Point = { x: cx, y: mid };
    const railBottom: Point = { x: cx, y: bottom };
    const adcIn: Point = { x: adcLeft, y: mid };

    drawWire(ctx, [batTop, railTop], theme.structure);
    drawWire(ctx, [batBottom, railBottom], theme.structure);
    drawWire(ctx, [node, adcIn], theme.structure, 1.5);
    drawBattery(ctx, { from: batBottom, to: batTop, color: theme.input });
    drawResistor(ctx, { from: railTop, to: node, color: theme.active, lineWidth: 2.4 });
    drawResistor(ctx, { from: node, to: railBottom, color: theme.structure });
    sensorMark(ctx, sensor, { x: cx, y: (top + mid) / 2 }, theme.active);
    drawNodeDot(ctx, { at: node, color: theme.output, radius: 4 });

    text(ctx, labels.supply, bx - 8, (top + bottom) / 2 - 22, theme.text, 'right');
    text(ctx, '+', bx + 14, (top + bottom) / 2 - 12, theme.text, 'left', '13px sans-serif');
    text(ctx, '−', bx + 14, (top + bottom) / 2 + 14, theme.text, 'left', '13px sans-serif');
    text(ctx, '0 V', bx + 6, bottom + 14, theme.text);

    text(ctx, labels.sensorName, cx - 14, (top + mid) / 2 - 8, theme.active, 'right');
    text(ctx, labels.sensorValue, cx - 14, (top + mid) / 2 + 8, theme.text, 'right');
    text(ctx, labels.fixedName, cx - 14, (mid + bottom) / 2 - 8, theme.text, 'right');
    text(ctx, labels.fixedValue, cx - 14, (mid + bottom) / 2 + 8, theme.text, 'right');

    text(ctx, labels.vout, (cx + adcLeft) / 2, mid - 12, theme.output, 'center');

    // The ADC: a box turning Vout into a number.
    ctx.save();
    ctx.strokeStyle = theme.output;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = theme.surface;
    ctx.beginPath();
    ctx.roundRect(adcLeft, mid - 34, adcW, 68, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    text(
      ctx,
      labels.adcTitle,
      adcLeft + adcW / 2,
      mid - 20,
      theme.text,
      'center',
      '11px var(--font-mono, monospace)'
    );
    text(
      ctx,
      labels.adcCode,
      adcLeft + adcW / 2,
      mid + 2,
      theme.output,
      'center',
      'bold 18px var(--font-mono, monospace)'
    );
    text(
      ctx,
      labels.adcBinary,
      adcLeft + adcW / 2,
      mid + 22,
      theme.text,
      'center',
      '10px var(--font-mono, monospace)'
    );

    // One loop, one current. Conventional current runs + → sensor → fixed → −;
    // electrons run the other way round.
    const loop: { from: Point; to: Point }[] = [
      { from: batTop, to: railTop },
      { from: railTop, to: node },
      { from: node, to: railBottom },
      { from: railBottom, to: batBottom },
    ];
    const sign = flow === 'electron' ? -1 : 1;
    const color = flow === 'electron' ? theme.input : theme.active;
    for (const seg of loop) {
      if (reducedMotion) {
        const dir = sign > 0 ? seg : { from: seg.to, to: seg.from };
        const angle = Math.atan2(dir.to.y - dir.from.y, dir.to.x - dir.from.x);
        const at = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
        // Resistor segments carry the arrow beside the zigzag, not on it.
        const offset = seg.from.x === seg.to.x && seg.from.x === cx ? 18 : 0;
        drawCurrentArrow(ctx, { at: { x: at.x + offset, y: at.y }, angleRad: angle, color });
      } else {
        drawCurrentFlowDots(
          ctx,
          { ...seg, current: sign * current },
          {
            color,
            phase,
            maxCurrent,
            dotRadius: flow === 'electron' ? 2.8 : 2.2,
            maxSpeedPxPerSec: 90,
          }
        );
      }
    }

    text(ctx, labels.flow, 8, 14, color);
    text(ctx, labels.current, 8, 32, theme.text);
  };

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[reducedMotion ? `${current}|${flow}|${labels.adcCode}` : 0]}
    />
  );
}
