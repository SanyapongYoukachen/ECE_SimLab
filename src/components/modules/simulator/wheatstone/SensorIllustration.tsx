'use client';

import { useCallback } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import {
  SENSORS,
  referenceResistance,
  type BridgeConfig,
  type SensorId,
} from '@/lib/circuits/sensors';
import { useMessages } from '@/lib/i18n';
import { formatQuantity, formatSensorResistance } from './format';

const HEIGHT = 230;
const COLD = [74, 127, 212] as const;
const HOT = [217, 83, 79] as const;

interface Props {
  readonly sensor: SensorId;
  readonly quantity: number;
  readonly config: BridgeConfig;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Blue → red across a 0..1 temperature fraction. Fixed colours: "hot" reads the same in both themes. */
function heatColor(t: number, alpha = 1): string {
  const c = COLD.map((cold, i) => Math.round(cold + (HOT[i] - cold) * clamp01(t)));
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

/** Deterministic pseudo-random in [0, 1) so particles keep their places frame to frame. */
function hash(i: number): number {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'center',
  font = '12px var(--font-mono, monospace)'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawThermometer(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  frac: number,
  theme: PlotTheme,
  label: string
): void {
  const tubeW = 12;
  const bulbR = 12;
  const fillTop = bottom - bulbR - (bottom - bulbR - top) * clamp01(frac);
  ctx.save();
  ctx.fillStyle = heatColor(frac);
  ctx.fillRect(x - tubeW / 2 + 3, fillTop, tubeW - 6, bottom - bulbR - fillTop + 2);
  ctx.beginPath();
  ctx.arc(x, bottom, bulbR - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.structure;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - tubeW / 2, bottom - bulbR + 2);
  ctx.lineTo(x - tubeW / 2, top + tubeW / 2);
  ctx.arc(x, top + tubeW / 2, tubeW / 2, Math.PI, 0);
  ctx.lineTo(x + tubeW / 2, bottom - bulbR + 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, bottom, bulbR, -Math.PI / 2 + 0.55, -Math.PI / 2 - 0.55 + Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i <= 4; i++) {
    const y = bottom - bulbR - ((bottom - bulbR - top - 6) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x + tubeW / 2, y);
    ctx.lineTo(x + tubeW / 2 + 5, y);
    ctx.stroke();
  }
  ctx.restore();
  drawText(ctx, label, x + 14, fillTop, theme.text, 'left');
}

function drawLeads(
  ctx: CanvasRenderingContext2D,
  x: number,
  fromY: number,
  toY: number,
  spread: number,
  theme: PlotTheme
): void {
  ctx.save();
  ctx.strokeStyle = theme.structure;
  ctx.lineWidth = 1.5;
  for (const dx of [-spread, spread]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, fromY);
    ctx.lineTo(x + dx, toY);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The physical side of the sensor: what the quantity looks like, and what it
 * does inside the element to change its resistance. Particles are drawn
 * deterministically from `phase`, so reduced motion gets a sensible still.
 */
export function SensorIllustration({ sensor, quantity, config }: Props): React.JSX.Element {
  const t = useMessages().simulator.wheatstone;
  const reducedMotion = usePrefersReducedMotion();
  const model = SENSORS[sensor];
  const resistance = model.resistance(quantity);

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      // Half/full bridges pair each sensor with mirrored partners; the strain
      // beam draws them, the other sensors show the count.
      if (config !== 'quarter' && sensor !== 'strain') {
        const n = config === 'half' ? 1 : 2;
        drawText(ctx, `+Δ ×${n}   −Δ ×${n}`, w - 8, 14, theme.active, 'right');
      }
      const rText = `R = ${formatSensorResistance(resistance)}`;

      if (sensor === 'ldr') {
        const light = clamp01(Math.log10(quantity) / 4);
        const lamp = { x: w * 0.18, y: h * 0.3 };
        const ldr = { x: w * 0.68, y: h * 0.5 };

        const glow = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 20 + 60 * light);
        glow.addColorStop(0, `rgba(250, 204, 21, ${0.25 + 0.6 * light})`);
        glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, 20 + 60 * light, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(250, 204, 21, ${0.35 + 0.65 * light})`;
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Photons stream from the lamp to the sensor face — more of them in brighter light.
        const photons = Math.round(2 + 26 * light);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
        for (let i = 0; i < photons; i++) {
          const spread = (hash(i) - 0.5) * 48;
          const p = (phase * 0.45 + i / photons) % 1;
          const x = lamp.x + 18 + (ldr.x - 40 - lamp.x - 18) * p;
          const y = lamp.y + (ldr.y + spread - lamp.y) * p;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // The LDR face: a ceramic disc with its serpentine CdS track.
        ctx.fillStyle = theme.surface;
        ctx.strokeStyle = theme.structure;
        ctx.beginPath();
        ctx.arc(ldr.x, ldr.y, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = `rgba(180, 83, 9, ${0.55 + 0.45 * light})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        const rows = 6;
        for (let r = 0; r < rows; r++) {
          const y = ldr.y - 22 + (44 * r) / (rows - 1);
          const x0 = r % 2 === 0 ? ldr.x - 24 : ldr.x + 24;
          const x1 = r % 2 === 0 ? ldr.x + 24 : ldr.x - 24;
          if (r === 0) ctx.moveTo(x0, y);
          else ctx.lineTo(x0, y);
          ctx.lineTo(x1, y);
        }
        ctx.stroke();
        // Freed charge carriers light up along the track.
        const carriers = Math.round(1 + 22 * light);
        ctx.fillStyle = theme.output;
        for (let i = 0; i < carriers; i++) {
          const jx = Math.sin(phase * 3 + i) * 1.5;
          ctx.beginPath();
          ctx.arc(
            ldr.x - 24 + hash(i + 50) * 48 + jx,
            ldr.y - 22 + Math.floor(hash(i + 90) * rows) * (44 / (rows - 1)),
            1.8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        drawLeads(ctx, ldr.x, ldr.y + 36, h - 36, 10, theme);
        drawText(ctx, formatQuantity('ldr', quantity), lamp.x, lamp.y + 34, theme.text);
        drawText(ctx, rText, ldr.x, h - 18, theme.active);
        return;
      }

      if (sensor === 'ntc' || sensor === 'rtd') {
        const frac = (quantity - model.min) / (model.max - model.min);
        drawThermometer(ctx, w * 0.14, 24, h - 36, frac, theme, formatQuantity(sensor, quantity));

        // Rising heat shimmer, stronger when hot.
        ctx.save();
        ctx.strokeStyle = heatColor(frac, 0.15 + 0.5 * frac);
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          // Between the thermometer and the element, clear of both.
          const x0 = w * (0.3 + 0.08 * k);
          ctx.beginPath();
          for (let y = h - 30; y > 30; y -= 4) {
            const x = x0 + Math.sin(y / 9 + phase * 4 * (0.3 + frac) + k) * (2 + 4 * frac);
            if (y === h - 30) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        const el = { x: w * 0.7, y: h * 0.42 };
        if (sensor === 'ntc') {
          // Semiconductor bead: carrier count grows as resistance falls.
          ctx.fillStyle = heatColor(frac, 0.9);
          ctx.strokeStyle = theme.structure;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(el.x, el.y, 34, 26, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          const ratio = referenceResistance(model) / resistance;
          const carriers = Math.max(2, Math.min(40, Math.round(8 + 6 * Math.log2(ratio))));
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < carriers; i++) {
            const a = hash(i) * Math.PI * 2 + phase * (0.6 + frac) * (i % 2 ? 1 : -1);
            const rr = 6 + hash(i + 7) * 18;
            ctx.beginPath();
            ctx.arc(
              el.x + Math.cos(a) * rr * 1.2,
              el.y + Math.sin(a) * rr * 0.8,
              1.8,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          drawLeads(ctx, el.x, el.y + 24, h - 36, 8, theme);
        } else {
          // Platinum lattice: atoms vibrate harder when hot and scatter the drifting electrons.
          const box = { x: el.x - 58, y: el.y - 40, w: 116, h: 80 };
          ctx.strokeStyle = theme.structure;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          const kelvin = quantity + 273.15;
          const amp = 0.6 + 3.2 * clamp01((kelvin - 223) / 250);
          ctx.fillStyle = theme.structure;
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 7; c++) {
              const i = r * 7 + c;
              const ax = box.x + 12 + c * 15.5 + Math.sin(phase * 11 + i * 1.7) * amp;
              const ay = box.y + 13 + r * 18 + Math.cos(phase * 13 + i * 2.3) * amp;
              ctx.beginPath();
              ctx.arc(ax, ay, 3.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.fillStyle = theme.output;
          for (let i = 0; i < 7; i++) {
            const x = box.x + ((phase * 30 + hash(i) * box.w) % box.w);
            const y = box.y + 5 + hash(i + 20) * (box.h - 10) + Math.sin(phase * 9 + i) * amp * 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          drawText(ctx, 'Pt', box.x + box.w - 4, box.y - 9, theme.text, 'right');
          drawLeads(ctx, el.x, box.y + box.h, h - 36, 14, theme);
        }
        drawText(ctx, rText, el.x, h - 18, theme.active);
        return;
      }

      if (sensor === 'strain') {
        // Cantilever: positive strain = beam bent down, gauge on top in tension.
        const wallX = w * 0.1;
        const L = w * 0.75;
        const y0 = h * 0.42;
        const thick = 14;
        const tip = (quantity / 2000) * 42;
        const deflect = (s: number): number => (tip * s * s * (3 - s)) / 2;
        const slope = (s: number): number => (tip * (6 * s - 3 * s * s)) / 2 / L;

        ctx.save();
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wallX, 20);
        ctx.lineTo(wallX, h - 40);
        ctx.stroke();
        ctx.lineWidth = 1;
        for (let y = 26; y < h - 40; y += 10) {
          ctx.beginPath();
          ctx.moveTo(wallX, y);
          ctx.lineTo(wallX - 8, y + 8);
          ctx.stroke();
        }

        ctx.fillStyle = theme.surface;
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const s = i / steps;
          const x = wallX + s * L;
          const y = y0 + deflect(s) - thick / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const s = i / steps;
          ctx.lineTo(wallX + s * L, y0 + deflect(s) + thick / 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Zig-zag foil gauges near the root. Top-surface gauges stretch under
        // positive strain; bottom-surface gauges (the half/full bridge's −Δ
        // arms) squeeze by the same amount.
        const loops = 7;
        const drawGauge = (gs: number, surface: 1 | -1): number => {
          const stretch = 1 + surface * (quantity / 2000) * 0.25;
          const gauge = 0.16 * stretch;
          ctx.strokeStyle = theme.active;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let k = 0; k <= loops; k++) {
            const s = gs + (gauge * k) / loops;
            const x = wallX + s * L;
            const base = y0 + deflect(s) - (surface * thick) / 2 - surface;
            const ang = Math.atan(slope(s));
            const hx = surface * Math.sin(ang) * 9;
            const hy = -surface * Math.cos(ang) * 9;
            if (k === 0) ctx.moveTo(x, base);
            ctx.lineTo(x + (k % 2 ? hx : 0), base + (k % 2 ? hy : 0));
            ctx.lineTo(x + (k % 2 ? 0 : hx), base + (k % 2 ? 0 : hy));
          }
          ctx.stroke();
          return gs + gauge / 2;
        };
        const perSurface = config === 'full' ? 2 : 1;
        const topMids: number[] = [];
        const bottomMids: number[] = [];
        for (let i = 0; i < perSurface; i++) {
          topMids.push(drawGauge(0.08 + i * 0.24, 1));
          if (config !== 'quarter') bottomMids.push(drawGauge(0.08 + i * 0.24, -1));
        }

        // Load at the tip.
        if (Math.abs(quantity) > 1) {
          const tx = wallX + L;
          const ty = y0 + tip;
          const dir = quantity > 0 ? 1 : -1;
          const len = 10 + 26 * Math.min(1, Math.abs(quantity) / 2000);
          const startY = ty - dir * (thick / 2 + 4 + len);
          const endY = ty - dir * (thick / 2 + 4);
          ctx.strokeStyle = theme.input;
          ctx.fillStyle = theme.input;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, startY);
          ctx.lineTo(tx, endY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx, endY);
          ctx.lineTo(tx - 5, endY - dir * 8);
          ctx.lineTo(tx + 5, endY - dir * 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        if (Math.abs(quantity) > 1) {
          const stretchText = `← ${t.tension} →`;
          const squeezeText = `→ ${t.compression} ←`;
          const topMid = topMids.reduce((a, b) => a + b, 0) / topMids.length;
          drawText(
            ctx,
            `${quantity > 0 ? stretchText : squeezeText}  +Δ`,
            wallX + topMid * L,
            y0 + deflect(topMid) - thick / 2 - 22,
            theme.active
          );
          if (bottomMids.length > 0) {
            const bottomMid = bottomMids.reduce((a, b) => a + b, 0) / bottomMids.length;
            drawText(
              ctx,
              `${quantity > 0 ? squeezeText : stretchText}  −Δ`,
              wallX + bottomMid * L,
              y0 + deflect(bottomMid) + thick / 2 + 22,
              theme.active
            );
          }
        }
        drawText(ctx, formatQuantity('strain', quantity), wallX + L * 0.62, 18, theme.text);
        drawText(ctx, rText, w * 0.5, h - 30, theme.active);
        drawText(
          ctx,
          t.exaggerated,
          w * 0.5,
          h - 12,
          theme.structure,
          'center',
          '10px var(--font-mono, monospace)'
        );
        return;
      }

      // Variable resistor: a knob sweeping its wiper around a resistive track.
      const frac = (quantity - model.min) / (model.max - model.min);
      const knob = { x: w * 0.5, y: h * 0.45 };
      const start = Math.PI * 0.75;
      const sweep = Math.PI * 1.5;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = 8;
      ctx.strokeStyle = theme.structureFaint;
      ctx.beginPath();
      ctx.arc(knob.x, knob.y, 52, start, start + sweep);
      ctx.stroke();
      ctx.strokeStyle = theme.active;
      ctx.beginPath();
      ctx.arc(knob.x, knob.y, 52, start, start + sweep * frac);
      ctx.stroke();
      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(knob.x, knob.y, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const a = start + sweep * frac;
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(knob.x + Math.cos(a) * 12, knob.y + Math.sin(a) * 12);
      ctx.lineTo(knob.x + Math.cos(a) * 30, knob.y + Math.sin(a) * 30);
      ctx.stroke();
      ctx.restore();
      drawText(ctx, rText, knob.x, h - 22, theme.active);
    },
    [sensor, quantity, resistance, model, t, config]
  );

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={t.illustrationAria(
        t.sensors[sensor].name,
        formatQuantity(sensor, quantity),
        formatSensorResistance(resistance)
      )}
      onDraw={handleDraw}
      // The loop reads the latest draw function every frame, so dragging the
      // slider needn't restart it (and reset every particle). Only the single
      // still frame of reduced motion needs a redraw per reading.
      deps={[sensor, config, reducedMotion ? quantity : null]}
    />
  );
}
