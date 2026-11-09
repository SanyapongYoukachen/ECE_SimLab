'use client';

import { useCallback } from 'react';
import { drawNodeDot, type PlotTheme, type Point } from '@/lib/plot';
import { AnimatedCanvas } from '@/components/ui';
import { solveStepper, type StepperDirection, type StepperMode } from '@/lib/actuators/stepper';

const HEIGHT = 300;
const MOTOR_RADIUS = 80;
const COIL_RADIUS_OFFSET = 32;
const COIL_SIZE = 20;

const COIL_ANGLES_DEG: Record<string, number> = { A: -90, B: 0, C: 90, D: 180 };

interface Props {
  readonly stepRate: number;
  readonly direction: StepperDirection;
  readonly stepsPerRev: number;
  readonly mode: StepperMode;
}

/**
 * Unlike the other schematics, this one needs no reduced-motion branch:
 * AnimatedCanvas freezes `phase` at 0 under prefers-reduced-motion, and
 * solveStepper is a pure function of elapsed time — so a frozen phase
 * already draws one valid, correct, static position for free. Normal
 * motion is itself discrete (the rotor holds still between step
 * boundaries), which is the whole point of a stepper.
 */
export function StepperSchematic({
  stepRate,
  direction,
  stepsPerRev,
  mode,
}: Props): React.JSX.Element {
  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const result = solveStepper(phase, stepRate, direction, stepsPerRev, mode);
      const center: Point = { x: size.width / 2, y: size.height / 2 };

      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, MOTOR_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (const [coilId, angleDeg] of Object.entries(COIL_ANGLES_DEG)) {
        const angleRad = (angleDeg * Math.PI) / 180;
        const at: Point = {
          x: center.x + Math.cos(angleRad) * (MOTOR_RADIUS + COIL_RADIUS_OFFSET),
          y: center.y + Math.sin(angleRad) * (MOTOR_RADIUS + COIL_RADIUS_OFFSET),
        };
        const active = result.activeCoils.includes(coilId);

        ctx.save();
        ctx.fillStyle = active ? theme.active : theme.surface;
        ctx.strokeStyle = active ? theme.active : theme.structure;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(at.x, at.y, COIL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = active ? theme.surface : theme.text;
        ctx.font = 'bold 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(coilId, at.x, at.y + 0.5);
        ctx.restore();
      }

      const rotorAngleRad = (result.angleDeg * Math.PI) / 180 - Math.PI / 2;
      const tip: Point = {
        x: center.x + Math.cos(rotorAngleRad) * (MOTOR_RADIUS - 14),
        y: center.y + Math.sin(rotorAngleRad) * (MOTOR_RADIUS - 14),
      };
      ctx.save();
      ctx.strokeStyle = theme.output;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      ctx.restore();
      drawNodeDot(ctx, { at: center, color: theme.structure, radius: 4 });

      ctx.save();
      ctx.font = '11px var(--font-mono, monospace)';
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `step ${result.positionSteps} · ${result.angleDeg.toFixed(1)}°`,
        center.x,
        center.y + MOTOR_RADIUS + COIL_RADIUS_OFFSET + 26
      );
      ctx.restore();
    },
    [stepRate, direction, stepsPerRev, mode]
  );

  const ariaLabel = `Stepping motor schematic, ${mode}-step mode, direction ${direction === 'cw' ? 'clockwise' : 'counter-clockwise'} at ${stepRate} steps per second.`;

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      deps={[stepRate, direction, stepsPerRev, mode]}
    />
  );
}
