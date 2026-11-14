'use client';

import { useCallback } from 'react';
import {
  drawWire,
  drawResistor,
  drawBattery,
  drawCurrentArrow,
  drawCurrentFlowDots,
  drawNodeDot,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import type { RelayResult } from '@/lib/actuators/relay';

const HEIGHT = 360;
const PAD = 30;
const LEFT = 58;
const RIGHT_INSET = 96;
const COIL_BOX = { width: 46, height: 24 };
const CONTACT_SPREAD = 38;
const NC_RISE = 26;

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
 * The relay as a circuit diagram draws it: a coil (the rectangle, terminals
 * A1/A2) and a changeover contact (COM switching between NC and NO), joined
 * by a dashed line that stands for the mechanical link between them. The
 * dashed outline marks what is inside the one part.
 *
 * The two loops are electrically independent, so each loop's current-flow
 * animation scales against its own magnitude (milliamps on the coil, amps
 * on the load). The load is wired through NO only; NC is a dead end showing
 * where the contact rests when de-energized.
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
      const mid = (left + right) / 2;
      const coilTop = PAD;
      const coilBottom = size.height * 0.38;
      const loadTop = size.height * 0.6;
      const loadBottom = size.height - PAD;

      // --- Control loop: the coil sits on its bottom rail, right above the contact ---
      const cTopLeft: Point = { x: left, y: coilTop };
      const cTopRight: Point = { x: right, y: coilTop };
      const cBottomRight: Point = { x: right, y: coilBottom };
      const cBottomLeft: Point = { x: left, y: coilBottom };
      const coilRight: Point = { x: mid + COIL_BOX.width / 2, y: coilBottom };
      const coilLeft: Point = { x: mid - COIL_BOX.width / 2, y: coilBottom };

      drawBattery(ctx, { from: cBottomLeft, to: cTopLeft, color: theme.input });
      drawWire(ctx, [cTopLeft, cTopRight, cBottomRight, coilRight], theme.structure);
      drawWire(ctx, [coilLeft, cBottomLeft], theme.structure);

      const coilSegments: readonly FlowSegment[] = [
        { from: cBottomLeft, to: cTopLeft, current: result.coilCurrent },
        { from: cTopLeft, to: cTopRight, current: result.coilCurrent },
        { from: cTopRight, to: cBottomRight, current: result.coilCurrent },
        { from: cBottomRight, to: coilRight, current: result.coilCurrent },
        { from: coilLeft, to: cBottomLeft, current: result.coilCurrent },
      ];

      // --- Load loop: the changeover contact is spliced into its top rail ---
      const lTopLeft: Point = { x: left, y: loadTop };
      const lTopRight: Point = { x: right, y: loadTop };
      const lBottomRight: Point = { x: right, y: loadBottom };
      const lBottomLeft: Point = { x: left, y: loadBottom };
      const com: Point = { x: mid - CONTACT_SPREAD, y: loadTop };
      const no: Point = { x: mid + CONTACT_SPREAD, y: loadTop };
      const nc: Point = { x: mid + CONTACT_SPREAD, y: loadTop - NC_RISE };

      drawBattery(ctx, { from: lBottomLeft, to: lTopLeft, color: theme.input });
      drawWire(ctx, [lTopLeft, com], theme.structure);
      drawWire(ctx, [no, lTopRight], theme.structure);
      drawResistor(ctx, { from: lTopRight, to: lBottomRight, color: theme.active });
      drawWire(ctx, [lBottomRight, lBottomLeft], theme.structure);

      const loadSegments: readonly FlowSegment[] = [
        { from: lTopLeft, to: com, current: result.loadCurrent },
        { from: com, to: no, current: result.loadCurrent },
        { from: no, to: lTopRight, current: result.loadCurrent },
        { from: lTopRight, to: lBottomRight, current: result.loadCurrent },
        { from: lBottomRight, to: lBottomLeft, current: result.loadCurrent },
        { from: lBottomLeft, to: lTopLeft, current: result.loadCurrent },
      ];

      // The moving contact: on NO when energized, back on NC otherwise.
      const restingOn = result.energized ? no : nc;
      drawWire(ctx, [com, restingOn], result.energized ? theme.output : theme.text, 2.5);

      if (reducedMotion) {
        for (const seg of [...coilSegments, ...loadSegments]) {
          if (Math.abs(seg.current) < 1e-9) continue;
          const at = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
          const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
          drawCurrentArrow(ctx, { at, angleRad: angle, color: theme.output, size: 6 });
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

      // --- The relay symbol itself ---
      const coilColor = result.coilCurrent > 0 ? theme.active : theme.structure;
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = coilColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(
        mid - COIL_BOX.width / 2,
        coilBottom - COIL_BOX.height / 2,
        COIL_BOX.width,
        COIL_BOX.height
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Mechanical link from the coil to the moving contact.
      ctx.save();
      ctx.strokeStyle = result.energized ? theme.output : theme.structure;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(mid, coilBottom + COIL_BOX.height / 2);
      ctx.lineTo(mid, (com.y + restingOn.y) / 2);
      ctx.stroke();
      ctx.restore();

      // Outline: everything inside is the one component.
      const box = {
        x: mid - CONTACT_SPREAD - 28,
        y: coilBottom - COIL_BOX.height / 2 - 12,
        width: 2 * CONTACT_SPREAD + 60,
        height: loadTop + 24 - (coilBottom - COIL_BOX.height / 2 - 12),
      };
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.restore();

      for (const node of [com, nc, no]) {
        drawNodeDot(ctx, { at: node, color: theme.surface, radius: 3.5 });
        drawNodeDot(ctx, { at: node, color: theme.text, radius: 2.5 });
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

      label('K1', { x: mid, y: coilBottom + 0.5 }, coilColor, 'center');
      label('A2', { x: coilLeft.x - 4, y: coilBottom - 9 }, theme.text, 'right');
      label('A1', { x: coilRight.x + 4, y: coilBottom - 9 }, theme.text, 'left');
      label('RELAY', { x: box.x, y: box.y - 8 }, theme.structure, 'left');
      label('COM', { x: com.x, y: com.y + 12 }, theme.text, 'center');
      label('NO', { x: no.x, y: no.y + 12 }, theme.text, 'center');
      label('NC', { x: nc.x + 8, y: nc.y }, theme.text, 'left');

      const coilMidY = (coilTop + box.y) / 2;
      label(
        `Icoil ${result.coilCurrentMa.toFixed(result.coilCurrentMa < 10 ? 2 : 1)} mA`,
        { x: mid, y: coilMidY - 7 },
        theme.text,
        'center'
      );
      label(
        result.energized ? 'ENERGIZED' : 'de-energized',
        { x: mid, y: coilMidY + 8 },
        result.energized ? theme.output : theme.structure,
        'center'
      );
      label(
        `Iload ${result.loadCurrent.toFixed(3)} A`,
        { x: mid, y: (box.y + box.height + loadBottom) / 2 },
        result.loadCurrent > 0 ? theme.output : theme.structure,
        'center'
      );

      label(
        `${result.coilVoltage.toFixed(1)}V`,
        { x: left - 8, y: (coilTop + coilBottom) / 2 },
        theme.input,
        'right'
      );
      label(
        `${result.loadVoltage.toFixed(1)}V`,
        { x: left - 8, y: (loadTop + loadBottom) / 2 },
        theme.input,
        'right'
      );
      label(
        `coil ${compactR(result.coilResistance)}Ω`,
        { x: right + 14, y: (coilTop + coilBottom) / 2 },
        theme.active,
        'left'
      );
      label(
        `load ${compactR(result.loadResistance)}Ω`,
        { x: right + 14, y: (loadTop + loadBottom) / 2 },
        theme.active,
        'left'
      );
    },
    [result, reducedMotion]
  );

  const ariaLabel = `Relay schematic: coil K1 linked to a changeover contact. Coil is ${result.energized ? 'energized, COM closed onto NO' : 'de-energized, COM resting on NC'}. Load current ${(result.loadCurrent * 1000).toFixed(1)} milliamps.`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
