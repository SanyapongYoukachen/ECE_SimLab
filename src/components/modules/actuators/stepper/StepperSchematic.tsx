'use client';

import { useCallback, useRef } from 'react';
import { drawNodeDot, type PlotTheme, type Point } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import {
  COIL_ANGLES_DEG,
  effectiveStepsPerRev,
  fieldAngleDeg,
  polePairs,
  sequenceFor,
  solveStepper,
  type StepperDirection,
  type StepperMode,
} from '@/lib/actuators/stepper';

const HEIGHT = 320;
const MAX_STATOR_RADIUS = 104;
const YOKE_THICKNESS = 10;
const TOOTH_HALF_WIDTH = 12;
const COIL_THICKNESS = 8;
const DIAL_GAP = 34;
const SIDE_LABEL = 22;
/** The rotor rings a little as it lands on each step, like a real one. */
const ROTOR_OMEGA = 45;
const ROTOR_ZETA = 0.5;
const MAX_DIAL_TICKS = 48;

const DEG = Math.PI / 180;

interface RotorState {
  /** Displayed electrical angle in degrees, unwrapped so it never jumps at 360. */
  position: number;
  velocity: number;
  lastPhase: number;
  started: boolean;
}

interface Props {
  readonly stepRate: number;
  readonly direction: StepperDirection;
  readonly stepsPerRev: number;
  readonly mode: StepperMode;
}

/**
 * Left: the magnetic picture for one electrical cycle. Four stator poles
 * (A–D), each an electromagnet whose face turns into an S pole while its
 * coil is energized, around a permanent-magnet rotor whose N pole is pulled
 * toward whichever poles are on. Right: the shaft. A real motor repeats the
 * rotor's N–S pair `polePairs` times around its rim, so the shaft turns only
 * 1/polePairs as far as the magnet drawn here.
 *
 * solveStepper is a pure function of elapsed time, so under reduced motion
 * (phase frozen at 0) this draws one valid static position.
 */
export function StepperSchematic({
  stepRate,
  direction,
  stepsPerRev,
  mode,
}: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const rotorRef = useRef<RotorState>({ position: 0, velocity: 0, lastPhase: 0, started: false });

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const result = solveStepper(phase, stepRate, direction, stepsPerRev, mode);
      const sequence = sequenceFor(mode);
      const pairs = polePairs(stepsPerRev);
      const effSteps = effectiveStepsPerRev(stepsPerRev, mode);
      const startAngle = fieldAngleDeg(sequence[0]);
      const target = startAngle + result.stepIndex * (360 / sequence.length);

      const rotor = rotorRef.current;
      const restarted = phase < rotor.lastPhase;
      if (reducedMotion || !rotor.started || restarted) {
        rotor.position = target;
        rotor.velocity = 0;
        rotor.started = true;
      } else {
        const dt = Math.min(phase - rotor.lastPhase, 1 / 30) / 2;
        for (let i = 0; i < 2; i++) {
          const accel =
            ROTOR_OMEGA * ROTOR_OMEGA * (target - rotor.position) -
            2 * ROTOR_ZETA * ROTOR_OMEGA * rotor.velocity;
          rotor.velocity += accel * dt;
          rotor.position += rotor.velocity * dt;
        }
      }
      rotor.lastPhase = phase;

      const electricalRad = rotor.position * DEG;
      const shaftDeg = (rotor.position - startAngle) / pairs;

      // Layout: the stator shrinks on narrow canvases so the shaft dial fits beside it.
      const dialR = Math.max(30, Math.min(46, size.width * 0.11));
      const statorR = Math.min(
        MAX_STATOR_RADIUS,
        (size.width - 2 * dialR - DIAL_GAP - SIDE_LABEL - 16) / 2
      );
      const total = SIDE_LABEL + 2 * statorR + DIAL_GAP + 2 * dialR;
      const x0 = (size.width - total) / 2;
      const center: Point = { x: x0 + SIDE_LABEL + statorR, y: size.height / 2 - 8 };
      const dial: Point = { x: center.x + statorR + DIAL_GAP + dialR, y: center.y };

      const yokeInner = statorR - YOKE_THICKNESS;
      const rotorR = statorR * 0.4;
      const poleFace = rotorR + 6;

      function text(
        value: string,
        at: Point,
        color: string,
        align: CanvasTextAlign = 'center',
        bold = false
      ): void {
        ctx.save();
        ctx.font = `${bold ? 'bold ' : ''}11px var(--font-mono, monospace)`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(value, at.x, at.y);
        ctx.restore();
      }

      // --- Stator: iron yoke ring ---
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = YOKE_THICKNESS;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(center.x, center.y, statorR - YOKE_THICKNESS / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // --- Stator: four poles, each with its coil ---
      for (const [coilId, angleDeg] of Object.entries(COIL_ANGLES_DEG)) {
        const active = result.activeCoils.includes(coilId);
        const angleRad = angleDeg * DEG;

        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(angleRad);

        // Pole piece: iron tooth pointing at the rotor.
        ctx.fillStyle = active ? theme.input : theme.surface;
        ctx.strokeStyle = active ? theme.input : theme.structure;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(poleFace, -TOOTH_HALF_WIDTH, yokeInner - poleFace, TOOTH_HALF_WIDTH * 2);
        ctx.fill();
        ctx.stroke();

        // Coil: the winding seen in cross-section on both sides of the tooth.
        const coilStart = poleFace + 20;
        const coilLength = yokeInner - coilStart - 3;
        for (const side of [-1, 1]) {
          const y = side < 0 ? -TOOTH_HALF_WIDTH - COIL_THICKNESS : TOOTH_HALF_WIDTH;
          ctx.fillStyle = active ? theme.active : theme.surface;
          ctx.strokeStyle = active ? theme.active : theme.structure;
          ctx.beginPath();
          ctx.rect(coilStart, y, coilLength, COIL_THICKNESS);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = active ? theme.surface : theme.structure;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = coilStart + 4; x < coilStart + coilLength - 1; x += 4) {
            ctx.moveTo(x, y + 1.5);
            ctx.lineTo(x, y + COIL_THICKNESS - 1.5);
          }
          ctx.stroke();
          ctx.lineWidth = 1.5;
        }
        ctx.restore();

        const ux = Math.cos(angleRad);
        const uy = Math.sin(angleRad);
        if (active) {
          text(
            'S',
            { x: center.x + ux * (poleFace + 10), y: center.y + uy * (poleFace + 10) + 0.5 },
            theme.surface,
            'center',
            true
          );
        }
        text(
          coilId,
          { x: center.x + ux * (statorR + 11), y: center.y + uy * (statorR + 11) + 0.5 },
          active ? theme.active : theme.text,
          'center',
          true
        );
      }

      // --- Rotor: a permanent magnet, N half and S half ---
      ctx.save();
      ctx.fillStyle = theme.danger;
      ctx.beginPath();
      ctx.arc(center.x, center.y, rotorR, electricalRad - Math.PI / 2, electricalRad + Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = theme.input;
      ctx.beginPath();
      ctx.arc(center.x, center.y, rotorR, electricalRad + Math.PI / 2, electricalRad - Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x, center.y, rotorR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const poleOffset = rotorR * 0.56;
      const nx = Math.cos(electricalRad);
      const ny = Math.sin(electricalRad);
      text(
        'N',
        { x: center.x + nx * poleOffset, y: center.y + ny * poleOffset + 0.5 },
        theme.surface,
        'center',
        true
      );
      text(
        'S',
        { x: center.x - nx * poleOffset, y: center.y - ny * poleOffset + 0.5 },
        theme.surface,
        'center',
        true
      );
      drawNodeDot(ctx, { at: center, color: theme.surface, radius: 4 });
      drawNodeDot(ctx, { at: center, color: theme.text, radius: 2 });

      // --- Stator / rotor tags, in the free diagonals between poles ---
      const diag = Math.SQRT1_2;
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center.x - diag * (rotorR + 1), center.y + diag * (rotorR + 1));
      ctx.lineTo(center.x - diag * (statorR + 8), center.y + diag * (statorR + 8));
      ctx.stroke();
      ctx.restore();
      text(
        'ROTOR',
        { x: center.x - diag * (statorR + 8) + 4, y: center.y + diag * (statorR + 8) + 9 },
        theme.text,
        'right'
      );
      text(
        'STATOR',
        { x: center.x - diag * statorR + 2, y: center.y - diag * statorR - 9 },
        theme.text,
        'right'
      );

      // --- Shaft dial: the mechanical angle ---
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dial.x, dial.y, dialR, 0, Math.PI * 2);
      ctx.stroke();
      const ticks = effSteps <= MAX_DIAL_TICKS ? effSteps : 4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
        ctx.moveTo(dial.x + Math.cos(a) * (dialR - 5), dial.y + Math.sin(a) * (dialR - 5));
        ctx.lineTo(dial.x + Math.cos(a) * dialR, dial.y + Math.sin(a) * dialR);
      }
      ctx.stroke();
      const shaftRad = shaftDeg * DEG - Math.PI / 2;
      ctx.strokeStyle = theme.output;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(dial.x, dial.y);
      ctx.lineTo(
        dial.x + Math.cos(shaftRad) * (dialR - 9),
        dial.y + Math.sin(shaftRad) * (dialR - 9)
      );
      ctx.stroke();
      ctx.restore();
      drawNodeDot(ctx, { at: dial, color: theme.structure, radius: 3.5 });

      text('SHAFT', { x: dial.x, y: dial.y - dialR - 12 }, theme.text);
      text(`${result.angleDeg.toFixed(1)}°`, { x: dial.x, y: dial.y + dialR + 14 }, theme.output);
      text(
        `step ${result.positionSteps}/${effSteps}`,
        { x: dial.x, y: dial.y + dialR + 30 },
        theme.text
      );

      text(`rotor ÷ ${pairs}`, { x: dial.x, y: dial.y + dialR + 46 }, theme.structure);
    },
    [stepRate, direction, stepsPerRev, mode, reducedMotion]
  );

  const ariaLabel = `Stepping motor schematic: four stator poles A to D around a permanent-magnet rotor, with the shaft angle beside it. ${mode}-step mode, direction ${direction === 'cw' ? 'clockwise' : 'counter-clockwise'} at ${stepRate} steps per second.`;

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[stepRate, direction, stepsPerRev, mode]}
    />
  );
}
