'use client';

import { useCallback, useRef, type PointerEvent } from 'react';
import {
  drawCurrentFlowDots,
  drawResistor,
  drawWire,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import { generatorInstant, type GeneratorResult } from '@/lib/circuits/generator';
import type { RotorClock } from './rotorClock';

const MACHINE_HEIGHT = 300;
const CIRCUIT_HEIGHT = 128;
/** Pole colours: blue N, red S, the usual magnet convention in both themes. */
const NORTH = '#3b82d6';
const SOUTH = '#d9483b';

interface Props {
  readonly result: GeneratorResult;
  readonly poles: number;
  readonly rLoad: number;
  readonly ra: number;
  readonly clock: RotorClock;
  readonly labels: {
    readonly angle: (thetaE: number, thetaM: number) => string;
    readonly drag: string;
    readonly circuit: string;
  };
  readonly ariaLabel: string;
  readonly circuitAria: string;
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'center',
  font = '11px var(--font-mono, monospace)'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

function arrowHead(ctx: CanvasRenderingContext2D, tip: Point, angle: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - 9 * Math.cos(angle - 0.4), tip.y - 9 * Math.sin(angle - 0.4));
  ctx.lineTo(tip.x - 9 * Math.cos(angle + 0.4), tip.y - 9 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Geometry shared by drawing and pointer hit-testing. */
function layout(w: number, h: number): { cx: number; cy: number; rOuter: number; rRotor: number } {
  const rOuter = Math.min(w / 2 - 20, h / 2 - 34);
  return { cx: w / 2, cy: h / 2 - 8, rOuter, rRotor: rOuter * 0.5 };
}

const wrap = (a: number): number => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

/**
 * End view along the shaft: P stator poles, alternately N and S, and a
 * rotor carrying one coil. The coil's two sides show the current direction
 * (⊙ out of the page, ⊗ into it) whenever it cuts flux; n is the coil's
 * normal and θ its angle from the field, so the flux through it is B·A·cos θ.
 * Drag the rotor to turn it by hand.
 */
export function GeneratorMachine({
  result,
  poles,
  rLoad,
  ra,
  clock,
  labels,
  ariaLabel,
  circuitAria,
}: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pairs = poles / 2;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const { cx, cy, rOuter, rRotor } = layout(w, h);
      const thetaE = clock.angle();
      const thetaM = thetaE / pairs;
      const now = generatorInstant(result, thetaE);
      const rPoleIn = rRotor + 12;

      // Stator yoke.
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Poles: pole k centred at 180° + k·360°/P (so a 2-pole machine has N on the left).
      const pitch = (2 * Math.PI) / poles;
      for (let k = 0; k < poles; k++) {
        const c = Math.PI + k * pitch;
        const half = pitch * 0.36;
        const north = k % 2 === 0;
        ctx.save();
        ctx.fillStyle = north ? NORTH : SOUTH;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        // Canvas angles run clockwise with y down; negate to keep maths orientation.
        ctx.arc(cx, cy, rOuter - 4, -(c - half), -(c + half), true);
        ctx.arc(cx, cy, rPoleIn, -(c + half), -(c - half), false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const lr = (rOuter + rPoleIn) / 2;
        text(
          ctx,
          north ? 'N' : 'S',
          cx + lr * Math.cos(c),
          cy - lr * Math.sin(c),
          '#ffffff',
          'center',
          'bold 15px sans-serif'
        );
        // Field direction at the pole face: out of N, into S.
        const r0 = rPoleIn - 2;
        const r1 = rPoleIn - 10;
        const [from, to] = north ? [r0, r1] : [r1, r0];
        const a = { x: cx + from * Math.cos(c), y: cy - from * Math.sin(c) };
        const b = { x: cx + to * Math.cos(c), y: cy - to * Math.sin(c) };
        ctx.save();
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }

      // Two-pole machines get the textbook field lines straight across, behind the rotor.
      if (poles === 2) {
        ctx.save();
        ctx.strokeStyle = theme.structure;
        ctx.globalAlpha = 0.28;
        ctx.setLineDash([4, 4]);
        for (const dy of [-0.6, -0.3, 0, 0.3, 0.6]) {
          const y = cy + dy * rRotor * 1.4;
          ctx.beginPath();
          ctx.moveTo(cx - rPoleIn, y);
          ctx.lineTo(cx + rPoleIn, y);
          ctx.stroke();
        }
        ctx.restore();
        text(
          ctx,
          'B →',
          cx,
          cy + rRotor + 4,
          theme.text,
          'center',
          '10px var(--font-mono, monospace)'
        );
      }

      // Rotor.
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rRotor, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // The coil spans one pole pitch: sides at θm ± 90°/pairs, its normal n along θm.
      const span = Math.PI / 2 / pairs;
      const sideR = rRotor - 12;
      const s1 = {
        x: cx + sideR * Math.cos(thetaM + span),
        y: cy - sideR * Math.sin(thetaM + span),
      };
      const s2 = {
        x: cx + sideR * Math.cos(thetaM - span),
        y: cy - sideR * Math.sin(thetaM - span),
      };
      ctx.save();
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.restore();

      // Normal n and the angle θ it makes with the field at θ = 0.
      const nLen = rRotor * 0.78;
      const nTip = { x: cx + nLen * Math.cos(thetaM), y: cy - nLen * Math.sin(thetaM) };
      ctx.save();
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nTip.x, nTip.y);
      ctx.stroke();
      ctx.restore();
      arrowHead(ctx, nTip, Math.atan2(nTip.y - cy, nTip.x - cx), theme.active);
      text(
        ctx,
        'n',
        nTip.x + 10 * Math.cos(thetaM + 0.35),
        nTip.y - 10 * Math.sin(thetaM + 0.35),
        theme.active
      );
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rRotor * 0.32, 0, -wrap(thetaM), true);
      ctx.stroke();
      ctx.restore();
      text(
        ctx,
        'θ',
        cx + rRotor * 0.42 * Math.cos(wrap(thetaM) / 2),
        cy - rRotor * 0.42 * Math.sin(wrap(thetaM) / 2),
        theme.text
      );

      // Coil sides: ⊙ current out of the page, ⊗ into it. Blank near zero crossings.
      const strength = result.ePeak > 0 ? now.e / result.ePeak : 0;
      for (const [side, sign] of [
        [s1, 1],
        [s2, -1],
      ] as const) {
        ctx.save();
        ctx.fillStyle = theme.surface;
        ctx.strokeStyle = theme.output;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(side.x, side.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const dir = strength * sign;
        ctx.globalAlpha = Math.min(1, Math.abs(strength) * 1.4);
        if (dir > 0.05) {
          ctx.fillStyle = theme.output;
          ctx.beginPath();
          ctx.arc(side.x, side.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (dir < -0.05) {
          ctx.beginPath();
          ctx.moveTo(side.x - 5, side.y - 5);
          ctx.lineTo(side.x + 5, side.y + 5);
          ctx.moveTo(side.x + 5, side.y - 5);
          ctx.lineTo(side.x - 5, side.y + 5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Shaft.
      ctx.save();
      ctx.fillStyle = theme.structure;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ω: anticlockwise rotation arrow outside the stator.
      const ar = rOuter + 10;
      const a0 = Math.PI * 0.18;
      const a1 = Math.PI * 0.42;
      ctx.save();
      ctx.strokeStyle = theme.input;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ar, -a0, -a1, true);
      ctx.stroke();
      ctx.restore();
      arrowHead(
        ctx,
        { x: cx + ar * Math.cos(a1), y: cy - ar * Math.sin(a1) },
        -a1 - Math.PI / 2,
        theme.input
      );
      text(ctx, 'ω', cx + (ar + 12) * Math.cos(a0), cy - (ar + 12) * Math.sin(a0), theme.input);

      text(
        ctx,
        labels.angle(wrap(thetaE), wrap(thetaM)),
        cx,
        h - 26,
        theme.text,
        'center',
        'bold 13px var(--font-mono, monospace)'
      );
      text(ctx, labels.drag, cx, h - 9, theme.text, 'center', '10px var(--font-mono, monospace)');
    },
    [result, poles, pairs, clock, labels]
  );

  const drawCircuit = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const now = generatorInstant(result, clock.angle());
      const top = 30;
      const bottom = h - 30;
      const x0 = Math.max(40, w / 2 - 170);
      const x1 = Math.min(w - 40, w / 2 + 170);
      // Slip rings: two rings on the shaft, brushes pressing on them.
      // Slip rings on the shaft, with brushes carrying the coil's current out to the load.
      for (const y of [top, bottom]) {
        ctx.save();
        ctx.strokeStyle = theme.active;
        ctx.fillStyle = theme.surface;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x0, y, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      const raEnd: Point = { x: x0 + (x1 - x0) * 0.4, y: top };
      drawResistor(ctx, {
        from: { x: x0 + 8, y: top },
        to: raEnd,
        color: theme.structure,
        peaks: 4,
        ampPx: 6,
      });
      drawWire(ctx, [raEnd, { x: x1, y: top }], theme.structure);
      drawResistor(ctx, { from: { x: x1, y: top }, to: { x: x1, y: bottom }, color: theme.output });
      drawWire(
        ctx,
        [
          { x: x1, y: bottom },
          { x: x0 + 8, y: bottom },
        ],
        theme.structure
      );
      text(ctx, `Ra ${ra} Ω`, (x0 + raEnd.x) / 2 + 4, top - 16, theme.text);
      text(ctx, `R ${rLoad} Ω`, x1 - 12, (top + bottom) / 2, theme.output, 'right');
      text(
        ctx,
        labels.circuit,
        x0 - 6,
        h - 8,
        theme.text,
        'left',
        '10px var(--font-mono, monospace)'
      );
      const maxI = Math.max(result.iPeak, 1e-9);
      if (!reducedMotion) {
        const loop = [
          { from: { x: x0 + 8, y: top }, to: { x: x1, y: top } },
          { from: { x: x1, y: top }, to: { x: x1, y: bottom } },
          { from: { x: x1, y: bottom }, to: { x: x0 + 8, y: bottom } },
        ];
        for (const seg of loop) {
          drawCurrentFlowDots(
            ctx,
            { ...seg, current: now.i },
            { color: theme.output, phase, maxCurrent: maxI, maxSpeedPxPerSec: 60 }
          );
        }
      }
      text(
        ctx,
        `v = ${now.v.toFixed(1)} V   i = ${now.i.toFixed(2)} A`,
        (x0 + x1) / 2,
        (top + bottom) / 2,
        theme.text,
        'center',
        '12px var(--font-mono, monospace)'
      );
    },
    [result, clock, rLoad, ra, labels, reducedMotion]
  );

  const angleFromPointer = (e: PointerEvent<HTMLDivElement>): number | null => {
    const el = wrapRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const { cx, cy, rOuter } = layout(rect.width, MACHINE_HEIGHT);
    const x = e.clientX - rect.left - cx;
    const y = cy - (e.clientY - rect.top);
    if (Math.hypot(x, y) > rOuter) return null;
    return Math.atan2(y, x);
  };

  // Dragging sets the mechanical angle; keep whole electrical turns so the plot doesn't jump.
  const applyDrag = (thetaM: number): void => {
    const current = clock.angle();
    const target = thetaM * pairs;
    const turns = Math.round((current - target) / (2 * Math.PI));
    clock.setAngle(target + turns * 2 * Math.PI);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={wrapRef}
        className="cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          const a = angleFromPointer(e);
          if (a === null) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          applyDrag(a);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const a = angleFromPointer(e);
          if (a !== null) applyDrag(a);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        <AnimatedCanvas
          height={MACHINE_HEIGHT}
          ariaLabel={ariaLabel}
          onDraw={handleDraw}
          deps={[reducedMotion ? `${result.ePeak}|${poles}|${clock.version}` : poles]}
        />
      </div>
      <AnimatedCanvas
        height={CIRCUIT_HEIGHT}
        ariaLabel={circuitAria}
        onDraw={drawCircuit}
        deps={[reducedMotion ? `${result.iPeak}|${rLoad}|${ra}|${clock.version}` : 0]}
      />
    </div>
  );
}
