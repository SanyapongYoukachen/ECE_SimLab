'use client';

import { useCallback, useRef } from 'react';
import type { PlotTheme, Point } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import type { RelayResult } from '@/lib/actuators/relay';

const HEIGHT = 360;
/** The drawing is laid out in this box and scaled to fit the canvas. */
const DESIGN = { width: 340, height: 304 };

const PIVOT: Point = { x: 58, y: 100 };
const OPEN_ANGLE = (7 * Math.PI) / 180;
const TIP = 210;
const CONTACT_RADIUS = 3.5;
/** A little contact bounce as the armature lands, like the real part. */
const ARMATURE_OMEGA = 30;
const ARMATURE_ZETA = 0.45;
const BOUNCE = 0.3;

const BASE_Y = 262;
const PIN_END_Y = 284;
const LABEL_Y = 294;

interface ArmatureState {
  /** 0 = resting on NC (open), 1 = pulled onto the core and NO. */
  position: number;
  velocity: number;
  lastPhase: number;
  started: boolean;
}

interface Props {
  readonly result: RelayResult;
}

/**
 * A cutaway of the part itself, to sit beside its circuit symbol: the coil
 * on its iron core, the L-shaped yoke, the hinged armature with its return
 * spring, and the moving contact that the armature carries between the NC
 * and NO fixed contacts. Coil current makes the core a magnet, the magnet
 * pulls the armature down against the spring, and the contact changes over.
 */
export function RelayStructure({ result }: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const armatureRef = useRef<ArmatureState>({
    position: 0,
    velocity: 0,
    lastPhase: 0,
    started: false,
  });

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      ctx.clearRect(0, 0, size.width, size.height);

      const target = result.energized ? 1 : 0;
      const arm = armatureRef.current;
      if (reducedMotion || !arm.started) {
        arm.position = target;
        arm.velocity = 0;
        arm.started = true;
      } else {
        const raw = phase >= arm.lastPhase ? phase - arm.lastPhase : 0;
        const dt = Math.min(raw, 1 / 30) / 2;
        for (let i = 0; i < 2; i++) {
          const accel =
            ARMATURE_OMEGA * ARMATURE_OMEGA * (target - arm.position) -
            2 * ARMATURE_ZETA * ARMATURE_OMEGA * arm.velocity;
          arm.velocity += accel * dt;
          arm.position += arm.velocity * dt;
          // The fixed contacts are hard stops.
          if (arm.position > 1) {
            arm.position = 1;
            arm.velocity = -arm.velocity * BOUNCE;
          } else if (arm.position < 0) {
            arm.position = 0;
            arm.velocity = -arm.velocity * BOUNCE;
          }
        }
      }
      arm.lastPhase = phase;

      const closed = arm.position > 0.97;
      const conducting = closed && result.loadCurrent > 0;
      const theta = -OPEN_ANGLE * (1 - arm.position);
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      /** A point on the armature, given in its own frame (x along the bar from the pivot). */
      function onArm(x: number, y = 0): Point {
        return { x: PIVOT.x + x * cos - y * sin, y: PIVOT.y + x * sin + y * cos };
      }

      const scale = Math.min(size.width / DESIGN.width, size.height / DESIGN.height);
      ctx.save();
      ctx.translate(
        (size.width - DESIGN.width * scale) / 2,
        (size.height - DESIGN.height * scale) / 2
      );
      ctx.scale(scale, scale);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      function iron(x: number, y: number, w: number, h: number): void {
        ctx.save();
        ctx.fillStyle = theme.structure;
        ctx.globalAlpha = 0.45;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }
      function path(points: readonly Point[], color: string, width: number): void {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }
      function dot(at: Point, radius: number, color: string): void {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      function text(
        value: string,
        at: Point,
        color: string,
        align: CanvasTextAlign = 'center'
      ): void {
        ctx.save();
        ctx.font = '11px var(--font-mono, monospace)';
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(value, at.x, at.y);
        ctx.restore();
      }

      // --- Base ---
      ctx.save();
      ctx.fillStyle = theme.structureFaint;
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.fillRect(16, BASE_Y, 314, 8);
      ctx.strokeRect(16, BASE_Y, 314, 8);
      ctx.restore();

      // --- Magnetic circuit: yoke and core ---
      iron(52, 100, 12, BASE_Y - 100);
      iron(52, 250, 120, 12);
      iron(118, 105, 24, 145);

      // --- Coil: the winding in cross-section, either side of the core ---
      const drive = Math.min(1, result.coilCurrentMa / result.pullInCurrent);
      const coilColor = result.coilCurrent > 0 ? theme.active : theme.structure;
      for (const x of [94, 142]) {
        ctx.save();
        ctx.fillStyle = theme.active;
        ctx.globalAlpha = 0.3 * drive;
        ctx.fillRect(x, 124, 24, 120);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = coilColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, 124, 24, 120);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = 130; y < 244; y += 6) {
          ctx.moveTo(x + 2, y);
          ctx.lineTo(x + 22, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      path(
        [
          { x: 90, y: 122 },
          { x: 170, y: 122 },
        ],
        theme.structure,
        2
      );
      path(
        [
          { x: 90, y: 246 },
          { x: 170, y: 246 },
        ],
        theme.structure,
        2
      );

      // --- Flux through core, armature and yoke while energized ---
      if (result.energized) {
        ctx.save();
        ctx.strokeStyle = theme.output;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 + 0.5 * arm.position;
        ctx.setLineDash([5, 4]);
        if (!reducedMotion) ctx.lineDashOffset = -phase * 24;
        ctx.beginPath();
        ctx.moveTo(130, 256);
        ctx.lineTo(130, 100);
        ctx.lineTo(58, 100);
        ctx.lineTo(58, 256);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // --- Terminal pins ---
      const pins: readonly { x: number; label: string }[] = [
        { x: 106, label: 'A1' },
        { x: 154, label: 'A2' },
        { x: 244, label: 'COM' },
        { x: 300, label: 'NO' },
        { x: 322, label: 'NC' },
      ];
      path(
        [
          { x: 106, y: 246 },
          { x: 106, y: PIN_END_Y },
        ],
        coilColor,
        2
      );
      path(
        [
          { x: 154, y: 246 },
          { x: 154, y: PIN_END_Y },
        ],
        coilColor,
        2
      );
      for (const pin of pins) text(pin.label, { x: pin.x, y: LABEL_Y }, theme.text);

      // --- Return spring: pulls the armature's tail down, lifting it off the core ---
      const tail = onArm(-24);
      const anchor: Point = { x: 34, y: 152 };
      path(
        [
          { x: 52, y: 152 },
          { x: 28, y: 152 },
        ],
        theme.structure,
        2
      );
      const springPoints: Point[] = [tail];
      const turns = 7;
      for (let i = 1; i < turns; i++) {
        const t = i / turns;
        springPoints.push({
          x: tail.x + (anchor.x - tail.x) * t + (i % 2 === 0 ? -5 : 5),
          y: tail.y + (anchor.y - tail.y) * t,
        });
      }
      springPoints.push(anchor);
      path(springPoints, theme.text, 1.3);

      // --- Fixed contacts and their terminals ---
      const liveColor = conducting ? theme.output : theme.text;
      const openTip: Point = {
        x: PIVOT.x + TIP * Math.cos(OPEN_ANGLE),
        y: PIVOT.y - TIP * Math.sin(OPEN_ANGLE),
      };
      const ncContact: Point = { x: openTip.x, y: openTip.y - 2 * CONTACT_RADIUS - 0.5 };
      const noContact: Point = { x: PIVOT.x + TIP, y: PIVOT.y + 2 * CONTACT_RADIUS + 0.5 };
      path(
        [ncContact, { x: ncContact.x, y: 56 }, { x: 322, y: 56 }, { x: 322, y: PIN_END_Y }],
        theme.text,
        2
      );
      path(
        [noContact, { x: noContact.x, y: 124 }, { x: 300, y: 124 }, { x: 300, y: PIN_END_Y }],
        liveColor,
        conducting ? 2.5 : 2
      );
      dot(ncContact, CONTACT_RADIUS, theme.text);
      dot(noContact, CONTACT_RADIUS, liveColor);

      // --- COM: a flexible lead from the moving blade to its pin ---
      const bladeRoot = onArm(152);
      ctx.save();
      ctx.strokeStyle = liveColor;
      ctx.lineWidth = conducting ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(bladeRoot.x, bladeRoot.y);
      ctx.quadraticCurveTo(244, bladeRoot.y + 6, 244, 160);
      ctx.lineTo(244, PIN_END_Y);
      ctx.stroke();
      ctx.restore();

      // --- Armature: iron bar on the hinge, insulator, then the contact blade ---
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y);
      ctx.rotate(theta);
      ctx.fillStyle = theme.structure;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(-28, -4, 170, 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-28, -4, 170, 8);
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.text;
      ctx.fillRect(142, -5, 10, 10);
      ctx.strokeRect(142, -5, 10, 10);
      ctx.strokeStyle = liveColor;
      ctx.lineWidth = conducting ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(152, 0);
      ctx.lineTo(TIP, 0);
      ctx.stroke();
      ctx.fillStyle = liveColor;
      ctx.beginPath();
      ctx.arc(TIP, 0, CONTACT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      dot(PIVOT, 3, theme.text);
      dot(PIVOT, 1.3, theme.surface);

      // --- Labels ---
      text(
        result.energized
          ? 'ENERGIZED: core pulls the armature to NO'
          : 'de-energized: spring holds it on NC',
        { x: 16, y: 16 },
        result.energized ? theme.output : theme.text,
        'left'
      );
      text('armature', { x: 118, y: 52 }, theme.text);
      path(
        [
          { x: 118, y: 59 },
          { x: 118, y: 82 },
        ],
        theme.structure,
        1
      );
      text('spring', { x: 30, y: 170 }, theme.text);
      text('yoke', { x: 46, y: 216 }, theme.text, 'right');
      text('coil on', { x: 176, y: 180 }, theme.text, 'left');
      text('iron core', { x: 176, y: 194 }, theme.text, 'left');
      text('NC', { x: 294, y: 45 }, theme.text);
      text('NO', { x: 284, y: 136 }, liveColor);

      ctx.restore();
    },
    [result, reducedMotion]
  );

  const ariaLabel = `Relay internal structure: coil on an iron core, hinged armature with a return spring, and a moving contact between the NC and NO contacts. ${result.energized ? 'The energized core holds the armature down, closing COM to NO.' : 'The spring holds the armature up, COM resting on NC.'}`;

  return (
    <AnimatedCanvas height={HEIGHT} ariaLabel={ariaLabel} onDraw={handleDraw} deps={[result]} />
  );
}
