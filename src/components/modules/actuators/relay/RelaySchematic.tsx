'use client';

import { useCallback } from 'react';
import {
  drawWire,
  drawResistor,
  drawBattery,
  drawCoil,
  drawCurrentArrow,
  drawCurrentFlowDots,
  drawNodeDot,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import type { RelayResult } from '@/lib/actuators/relay';

const HEIGHT = 380;
const PAD = 26;
const LEFT = 58;
const RIGHT_INSET = 96;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(1)}k` : `${Math.round(ohms)}`;
}

interface FlowSegment {
  readonly from: Point;
  readonly to: Point;
  readonly current: number;
}

interface Props {
  readonly result: RelayResult;
}

/**
 * Two electrically independent loops stacked vertically: the coil driver on
 * top, the switched load circuit on the bottom. They're only coupled
 * mechanically — coil current decides whether the armature (common pole)
 * closes onto NO, completing the load loop — so each loop's current-flow
 * animation scales against its own magnitude, not a shared one (their
 * currents can be wildly different: milliamps on the coil, amps on the
 * load). The load is wired through NO only; NC is just a dead-end stub
 * showing where the armature rests when de-energized.
 */
export function RelaySchematic({ result }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const left = LEFT;
      const right = size.width - RIGHT_INSET;
      const coilTop = PAD;
      const coilBottom = size.height * 0.4;
      const loadTop = size.height * 0.56;
      const loadBottom = size.height - PAD;

      // --- Coil driver loop ---
      const cTopLeft: Point = { x: left, y: coilTop };
      const cTopRight: Point = { x: right, y: coilTop };
      const cBottomRight: Point = { x: right, y: coilBottom };
      const cBottomLeft: Point = { x: left, y: coilBottom };

      drawBattery(ctx, { from: cBottomLeft, to: cTopLeft, color: theme.input });
      drawWire(ctx, [cTopLeft, cTopRight], theme.structure);
      drawCoil(ctx, { from: cTopRight, to: cBottomRight, color: theme.active });
      drawWire(ctx, [cBottomRight, cBottomLeft], theme.structure);

      const coilSegments: readonly FlowSegment[] = [
        { from: cBottomLeft, to: cTopLeft, current: result.coilCurrent },
        { from: cTopLeft, to: cTopRight, current: result.coilCurrent },
        { from: cTopRight, to: cBottomRight, current: result.coilCurrent },
        { from: cBottomRight, to: cBottomLeft, current: result.coilCurrent },
      ];

      // --- Switched load loop: a rectangle like the coil loop, with a
      // switch spliced into the left part of the top rail. NO continues
      // the rail; NC is a short dead-end stub poking up from the pole. ---
      const lTopLeft: Point = { x: left, y: loadTop };
      const lTopRight: Point = { x: right, y: loadTop };
      const lBottomRight: Point = { x: right, y: loadBottom };
      const lBottomLeft: Point = { x: left, y: loadBottom };
      const pole: Point = { x: left + 90, y: loadTop };
      const no: Point = { x: left + 170, y: loadTop };
      const nc: Point = { x: left + 90, y: loadTop - 26 };

      drawBattery(ctx, { from: lBottomLeft, to: lTopLeft, color: theme.input });
      drawWire(ctx, [lTopLeft, pole], theme.structure);
      drawWire(ctx, [no, lTopRight], theme.structure);
      drawResistor(ctx, { from: lTopRight, to: lBottomRight, color: theme.active });
      drawWire(ctx, [lBottomRight, lBottomLeft], theme.structure);

      // The armature: solid when it closes the NO contact (completing the
      // rail), a faint dashed gap in its place when it's open.
      if (result.energized) {
        drawWire(ctx, [pole, no], theme.output, 2.5);
      } else {
        ctx.save();
        ctx.strokeStyle = theme.structureFaint;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pole.x, pole.y);
        ctx.lineTo(no.x, no.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      // NC: always just a short dead-end, solid when it's where the
      // armature currently rests.
      drawWire(ctx, [pole, nc], result.energized ? theme.structureFaint : theme.active, 2);

      for (const node of [pole, nc, no]) {
        drawNodeDot(ctx, { at: node, color: theme.structure, radius: 2.5 });
      }
      drawNodeDot(ctx, {
        at: result.energized ? no : nc,
        color: theme.output,
        radius: 3.5,
      });

      const loadSegments: readonly FlowSegment[] = [
        { from: lTopLeft, to: pole, current: result.loadCurrent },
        { from: pole, to: no, current: result.loadCurrent },
        { from: no, to: lTopRight, current: result.loadCurrent },
        { from: lTopRight, to: lBottomRight, current: result.loadCurrent },
        { from: lBottomRight, to: lBottomLeft, current: result.loadCurrent },
        { from: lBottomLeft, to: lTopLeft, current: result.loadCurrent },
      ];

      if (reducedMotion) {
        for (const seg of [...coilSegments, ...loadSegments]) {
          if (Math.abs(seg.current) < 1e-9) continue;
          const mid = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
          const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
          drawCurrentArrow(ctx, { at: mid, angleRad: angle, color: theme.output, size: 6 });
        }
      } else {
        for (const seg of coilSegments) {
          drawCurrentFlowDots(ctx, seg, {
            color: theme.output,
            phase,
            maxCurrent: result.coilCurrent,
          });
        }
        for (const seg of loadSegments) {
          drawCurrentFlowDots(ctx, seg, {
            color: theme.output,
            phase,
            maxCurrent: result.loadCurrent,
          });
        }
      }

      ctx.font = '11px var(--font-mono, monospace)';
      ctx.textBaseline = 'middle';
      function label(text: string, at: Point, color: string, align: CanvasTextAlign): void {
        ctx.save();
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, at.x, at.y);
        ctx.restore();
      }

      label(
        `Vcoil=${result.coilVoltage.toFixed(1)}V`,
        { x: left - 8, y: (coilTop + coilBottom) / 2 },
        theme.input,
        'right'
      );
      label(
        `Rcoil=${compactR(result.coilResistance)}Ω`,
        { x: right + 8, y: (coilTop + coilBottom) / 2 },
        theme.active,
        'left'
      );
      label(
        result.energized ? 'ENERGIZED' : 'de-energized',
        { x: (left + right) / 2, y: coilBottom + 12 },
        result.energized ? theme.output : theme.structure,
        'center'
      );
      label('NC', { x: nc.x, y: nc.y - 10 }, theme.structure, 'center');
      label('NO', { x: no.x, y: no.y - 10 }, theme.structure, 'center');
      label(
        `Vload=${result.loadVoltage.toFixed(1)}V`,
        { x: left - 8, y: (loadTop + loadBottom) / 2 },
        theme.input,
        'right'
      );
      label(
        `Rload=${compactR(result.loadResistance)}Ω`,
        { x: right + 8, y: (loadTop + loadBottom) / 2 },
        theme.active,
        'left'
      );
    },
    [result, reducedMotion]
  );

  const ariaLabel = `Relay schematic. Coil is ${result.energized ? 'energized, resting on NO' : 'de-energized, resting on NC'}. Load current ${(result.loadCurrent * 1000).toFixed(1)} milliamps.`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
