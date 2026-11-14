'use client';

import { useCallback, useRef } from 'react';
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
import type { DcMotorResult } from '@/lib/actuators/dcMotor';

const HEIGHT = 300;
const PAD = 30;
const LOOP_LEFT = 46;
const LOOP_RIGHT = 190;
const MOTOR_RADIUS = 74;
/** Real speeds blur into flicker at 60 fps, so the rotor is drawn this many times slower. */
const SLOW_MOTION = 20;
const PWM_BOX_WIDTH = 36;
const PWM_BOX_HEIGHT = 20;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${(ohms / 1000).toFixed(1)}k` : `${ohms.toFixed(1)}`;
}

interface Props {
  readonly result: DcMotorResult;
}

/**
 * Left: the armature's electrical loop (source, PWM switch, Ra, and the
 * back-EMF "source" it fights against), with current-flow dots like every
 * other schematic. The dots show the average current: the armature's
 * inductance smooths the PWM pulses. Right: the motor housing with a needle
 * that spins at a rate proportional to the solved speed, in slow motion.
 */
export function DcMotorSchematic({ result }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  // Destructured under a different name: a plain `.current` field access
  // reads, to React Compiler's static analysis, like a ref access, which
  // blocks memoizing the draw callback below.
  const armatureCurrent = result.current;
  const rotorRef = useRef({ angle: 0, lastPhase: 0 });

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const top = PAD;
      const bottom = size.height - PAD;
      const midY = (top + bottom) / 2;

      // Both the loop's right edge and the motor's radius shrink on narrow
      // canvases so they never overlap — MOTOR_RADIUS/LOOP_RIGHT are just
      // the desktop ceiling.
      const loopRight = Math.min(LOOP_RIGHT, size.width * 0.42);
      const motorRadius = Math.max(30, Math.min(MOTOR_RADIUS, (size.width - loopRight - 40) / 2));
      const motorCenterX = size.width - motorRadius - 20;

      const topLeft: Point = { x: LOOP_LEFT, y: top };
      const topRight: Point = { x: loopRight, y: top };
      const midRight: Point = { x: loopRight, y: midY };
      const bottomRight: Point = { x: loopRight, y: bottom };
      const bottomLeft: Point = { x: LOOP_LEFT, y: bottom };

      drawBattery(ctx, { from: bottomLeft, to: topLeft, color: theme.input });
      drawWire(ctx, [topLeft, topRight], theme.structure);
      drawResistor(ctx, { from: topRight, to: midRight, color: theme.active });
      drawBattery(ctx, {
        from: midRight,
        to: bottomRight,
        color: theme.output,
        longBarLenPx: 14,
        shortBarLenPx: 7,
      });
      drawWire(ctx, [bottomRight, bottomLeft], theme.structure);

      const segments = [
        { from: bottomLeft, to: topLeft, current: armatureCurrent },
        { from: topLeft, to: topRight, current: armatureCurrent },
        { from: topRight, to: midRight, current: armatureCurrent },
        { from: midRight, to: bottomRight, current: armatureCurrent },
        { from: bottomRight, to: bottomLeft, current: armatureCurrent },
      ];

      if (reducedMotion) {
        for (const seg of segments) {
          if (Math.abs(seg.current) < 1e-9) continue;
          const mid = { x: (seg.from.x + seg.to.x) / 2, y: (seg.from.y + seg.to.y) / 2 };
          const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
          drawCurrentArrow(ctx, { at: mid, angleRad: angle, color: theme.output, size: 6 });
        }
      } else {
        for (const seg of segments) {
          drawCurrentFlowDots(ctx, seg, {
            color: theme.output,
            phase,
            maxCurrent: armatureCurrent,
          });
        }
      }

      // PWM switch on the top rail, painted over the wire and its flow dots.
      const pwmX = (LOOP_LEFT + loopRight) / 2;
      const boxLeft = pwmX - PWM_BOX_WIDTH / 2;
      const boxTop = top - PWM_BOX_HEIGHT / 2;
      ctx.save();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.input;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(boxLeft, boxTop, PWM_BOX_WIDTH, PWM_BOX_HEIGHT);
      ctx.fill();
      ctx.stroke();
      // Two periods of the switching waveform, at the actual duty.
      const glyphLeft = boxLeft + 5;
      const period = (PWM_BOX_WIDTH - 10) / 2;
      const high = boxTop + 5;
      const low = boxTop + PWM_BOX_HEIGHT - 5;
      ctx.beginPath();
      ctx.moveTo(glyphLeft, low);
      for (let i = 0; i < 2; i++) {
        const start = glyphLeft + i * period;
        const onEnd = start + period * result.duty;
        if (result.duty > 0) {
          ctx.lineTo(start, high);
          ctx.lineTo(onEnd, high);
        }
        ctx.lineTo(onEnd, low);
        ctx.lineTo(start + period, low);
      }
      ctx.stroke();
      ctx.restore();

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
        `${result.supplyVoltage.toFixed(1)}V`,
        { x: LOOP_LEFT - 8, y: midY - 60 },
        theme.input,
        'right'
      );
      label(
        `PWM ${(result.duty * 100).toFixed(0)}%`,
        { x: pwmX, y: boxTop - 9 },
        theme.input,
        'center'
      );
      label(
        `Ra=${compactR(result.armatureResistance)}Ω`,
        { x: loopRight + 14, y: (top + midY) / 2 },
        theme.active,
        'left'
      );
      label('back-EMF', { x: loopRight + 14, y: (midY + bottom) / 2 }, theme.output, 'left');

      // Motor housing + spinning rotor.
      const motorCenter: Point = { x: motorCenterX, y: midY };
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(motorCenter.x, motorCenter.y, motorRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const rotor = rotorRef.current;
      const dt = phase >= rotor.lastPhase ? Math.min(phase - rotor.lastPhase, 0.1) : 0;
      rotor.lastPhase = phase;
      rotor.angle = (rotor.angle + (result.speedRadPerSec / SLOW_MOTION) * dt) % (Math.PI * 2);
      const angle = reducedMotion ? -Math.PI / 2 : rotor.angle - Math.PI / 2;
      const tip: Point = {
        x: motorCenter.x + Math.cos(angle) * (motorRadius - 10),
        y: motorCenter.y + Math.sin(angle) * (motorRadius - 10),
      };
      ctx.save();
      ctx.strokeStyle = theme.active;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(motorCenter.x, motorCenter.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      ctx.restore();
      drawNodeDot(ctx, { at: motorCenter, color: theme.structure, radius: 4 });

      label(
        result.stalled ? 'STALLED' : `${result.speedRpm.toFixed(0)} RPM`,
        { x: motorCenter.x, y: motorCenter.y + motorRadius + 18 },
        result.stalled ? theme.danger : theme.text,
        'center'
      );
      if (!reducedMotion && !result.stalled) {
        label(
          `shown ${SLOW_MOTION}× slower`,
          { x: motorCenter.x, y: motorCenter.y - motorRadius - 14 },
          theme.structure,
          'center'
        );
      }
    },
    [result, armatureCurrent, reducedMotion]
  );

  const ariaLabel = `DC motor schematic. PWM duty ${(result.duty * 100).toFixed(0)} percent, armature current ${armatureCurrent.toFixed(2)} amps, ${result.stalled ? 'stalled' : `spinning at ${result.speedRpm.toFixed(0)} RPM`}.`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
