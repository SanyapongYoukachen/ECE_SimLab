'use client';

import { useCallback, useRef } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas, usePrefersReducedMotion } from '@/components/ui';
import {
  LDR_R_DARK,
  RANGES,
  isAbsorbed,
  ldrResistance,
  referenceResistanceOf,
  type LightColor,
  type TransducerId,
} from '@/lib/circuits/transducer';
import { heatColor, PHOTON_COLOR } from './colors';

const HEIGHT = 290;
/** Mean life of a free electron before it recombines, slowed to seconds so it can be watched. */
const LIFETIME_S = 2;
/** Electron drift across the slab, in slab widths per second. */
const DRIFT = 0.16;
const PHOTON_FALL_S = 0.55;

export interface MaterialLabels {
  readonly carriers: string;
  readonly drift: string;
  readonly conventional: string;
  readonly photon: string;
  readonly temperature: string;
}

interface Props {
  readonly sensor: TransducerId;
  readonly quantity: number;
  readonly color: LightColor;
  /** Free-carrier density relative to the reference point. */
  readonly carriers: number;
  readonly labels: MaterialLabels;
  readonly ariaLabel: string;
}

interface Electron {
  /** Position inside the slab, 0..1 on each axis. */
  x: number;
  y: number;
  dies: number;
}

interface Photon {
  x: number;
  born: number;
  /** Depth into the slab where it's absorbed, 0..1 (absorbed photons only). */
  depth: number;
  absorbed: boolean;
}

interface Flash {
  x: number;
  y: number;
  born: number;
}

interface Sim {
  electrons: Electron[];
  photons: Photon[];
  flashes: Flash[];
  last: number;
  photonDebt: number;
  thermalDebt: number;
  key: string;
}

/** Dots on screen for a carrier density: square-root compressed, so ×0.05 and ×25 both stay readable. */
function displayCount(carriers: number): number {
  return Math.max(2, Math.min(120, Math.round(24 * Math.sqrt(carriers))));
}

function hash(i: number): number {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function lifetime(now: number, u = Math.random()): number {
  return now + -Math.log(1 - u * 0.999) * LIFETIME_S;
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

function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y: number,
  color: string
): void {
  const dir = Math.sign(x1 - x0);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1 - dir * 6, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x1 - dir * 7, y - 4);
  ctx.lineTo(x1 - dir * 7, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A photon as a short wave packet, drawn vertically downward. */
function photonShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number,
  dashed: boolean
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.8;
  if (dashed) ctx.setLineDash([3, 2]);
  ctx.beginPath();
  for (let k = 0; k <= 16; k++) {
    const dy = -16 + k;
    const dx = 3 * Math.sin((k / 16) * Math.PI * 4);
    if (k === 0) ctx.moveTo(x + dx, y + dy);
    else ctx.lineTo(x + dx, y + dy);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Inside the sensor, magnified: a slab of semiconductor between two metal
 * contacts. Light (LDR) or heat (thermistor) frees electrons from the
 * lattice; each free electron drifts toward the + contact and, after a
 * while, is recaptured. The number of free electrons is the resistance: more
 * of them, more current for the same voltage. Dot counts are compressed,
 * and times slowed to seconds, so the idea is visible — they're not to scale.
 */
export function MaterialView({
  sensor,
  quantity,
  color,
  carriers,
  labels,
  ariaLabel,
}: Props): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const simRef = useRef<Sim | null>(null);

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);

      const slab = { left: 46, right: w - 46, top: 92, bottom: 212 };
      const sw = slab.right - slab.left;
      const sh = slab.bottom - slab.top;
      const px = (x: number): number => slab.left + x * sw;
      const py = (y: number): number => slab.top + y * sh;

      const absorbed = sensor === 'ldr' && isAbsorbed(color);
      const target = displayCount(carriers);
      // Thermal (dark) share of the carriers; for the thermistor that's all of them.
      const darkCount =
        sensor === 'ldr' ? displayCount(referenceResistanceOf('ldr') / LDR_R_DARK) : target;
      // Photons keep arriving under infrared too — they just aren't absorbed.
      const lightCount =
        sensor === 'ldr'
          ? displayCount(referenceResistanceOf('ldr') / ldrResistance(quantity, 'green')) -
            darkCount
          : 0;
      const tempFrac =
        sensor === 'ntc' ? (quantity - RANGES.ntc.min) / (RANGES.ntc.max - RANGES.ntc.min) : 0.38;

      // ----- simulation step -----
      const now = performance.now() / 1000;
      const key = `${sensor}`;
      let sim = simRef.current;
      if (!sim || sim.key !== key || reducedMotion) {
        sim = {
          electrons: Array.from({ length: target }, (_, i) => ({
            x: hash(i * 3 + 1),
            y: 0.08 + 0.84 * hash(i * 3 + 2),
            dies: lifetime(now, hash(i * 3 + 3)),
          })),
          photons: [],
          flashes: [],
          last: now,
          photonDebt: 0,
          thermalDebt: 0,
          key,
        };
        simRef.current = sim;
      }
      const dt = Math.min(0.1, Math.max(0, now - sim.last));
      sim.last = now;

      if (!reducedMotion) {
        // Generation: light-driven (one electron per absorbed photon) plus thermal.
        sim.photonDebt += (Math.max(0, lightCount) / LIFETIME_S) * dt;
        while (sim.photonDebt >= 1) {
          sim.photonDebt -= 1;
          sim.photons.push({
            x: 0.04 + 0.92 * Math.random(),
            born: now,
            depth: 0.1 + 0.8 * Math.random(),
            absorbed,
          });
        }
        // Thermal generation keeps the thermal share of the population topped up.
        const thermalTarget = sensor === 'ntc' ? target : Math.min(target, darkCount);
        sim.thermalDebt += (thermalTarget / LIFETIME_S) * dt;
        while (sim.thermalDebt >= 1) {
          sim.thermalDebt -= 1;
          const e = { x: Math.random(), y: 0.08 + 0.84 * Math.random(), dies: lifetime(now) };
          sim.electrons.push(e);
          if (sensor === 'ntc') sim.flashes.push({ x: e.x, y: e.y, born: now });
        }

        const jitter = sensor === 'ntc' ? 0.02 + 0.1 * tempFrac : 0.04;
        for (const e of sim.electrons) {
          e.x += DRIFT * dt + (Math.random() - 0.5) * jitter * dt * 4;
          e.y += (Math.random() - 0.5) * jitter * dt * 8;
          if (e.x > 1) e.x -= 1; // leaves through + into the wire; one enters at − to replace it
          if (e.x < 0) e.x += 1;
          e.y = Math.min(0.95, Math.max(0.05, e.y));
        }
        sim.electrons = sim.electrons.filter((e) => e.dies > now);
        // Never let the population run far past the target (after a sudden drop, it drains over a lifetime).
        if (sim.electrons.length > target * 2 + 4)
          sim.electrons.splice(0, sim.electrons.length - (target * 2 + 4));
        sim.flashes = sim.flashes.filter((f) => now - f.born < 1.2);
      }

      // ----- source -----
      const photonColor = PHOTON_COLOR[color];
      if (sensor === 'ldr') {
        const glow = 0.15 + 0.2 * (Math.log10(quantity) / 4);
        const cx = w / 2;
        ctx.save();
        const grad = ctx.createRadialGradient(cx, 18, 2, cx, 18, 60);
        grad.addColorStop(0, photonColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = color === 'ir' ? 0.18 : glow + 0.2;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, 18, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = photonColor;
        ctx.beginPath();
        ctx.arc(cx, 18, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        text(ctx, labels.photon, 10, 14, theme.text);
      } else {
        // A horizontal thermometer across the top.
        const x0 = slab.left + 14;
        const x1 = slab.right - 70;
        const y = 34;
        const fillTo = x0 + (x1 - x0) * tempFrac;
        ctx.save();
        ctx.fillStyle = heatColor(tempFrac);
        ctx.beginPath();
        ctx.arc(x0, y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x0, y - 4, fillTo - x0, 8);
        ctx.strokeStyle = theme.structure;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x0 + 8, y - 6, x1 - x0 - 8, 12);
        for (let i = 0; i <= 6; i++) {
          const tx = x0 + ((x1 - x0) * i) / 6;
          ctx.beginPath();
          ctx.moveTo(tx, y + 6);
          ctx.lineTo(tx, y + 10);
          ctx.stroke();
        }
        ctx.restore();
        text(ctx, labels.temperature, x1 + 10, y, theme.text);
        // Heat rising into the slab from outside when it's warm.
        if (tempFrac > 0.4) {
          ctx.save();
          ctx.strokeStyle = heatColor(tempFrac, 0.35 + 0.4 * (tempFrac - 0.4));
          ctx.lineWidth = 1.5;
          const t = reducedMotion ? 0 : now;
          for (let i = 0; i < 7; i++) {
            const bx = slab.left + sw * ((i + 0.5) / 7);
            ctx.beginPath();
            for (let k = 0; k <= 20; k++) {
              const yy = 82 - k * 1.2;
              const xx = bx + 3 * Math.sin(k * 0.6 + t * 5 + i);
              if (k === 0) ctx.moveTo(xx, yy);
              else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ----- slab, contacts and wires -----
      ctx.save();
      ctx.fillStyle = sensor === 'ntc' ? heatColor(tempFrac, 0.16) : 'rgba(214, 150, 50, 0.14)';
      ctx.fillRect(slab.left, slab.top, sw, sh);
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.strokeRect(slab.left + 0.5, slab.top + 0.5, sw - 1, sh - 1);
      ctx.fillStyle = theme.structure;
      ctx.fillRect(slab.left - 10, slab.top - 4, 10, sh + 8);
      ctx.fillRect(slab.right, slab.top - 4, 10, sh + 8);
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, slab.top + sh / 2);
      ctx.lineTo(slab.left - 10, slab.top + sh / 2);
      ctx.moveTo(slab.right + 10, slab.top + sh / 2);
      ctx.lineTo(w, slab.top + sh / 2);
      ctx.stroke();
      ctx.restore();
      text(
        ctx,
        '−',
        slab.left - 26,
        slab.top + sh / 2 - 14,
        theme.text,
        'center',
        '16px sans-serif'
      );
      text(
        ctx,
        '+',
        slab.right + 26,
        slab.top + sh / 2 - 14,
        theme.text,
        'center',
        '16px sans-serif'
      );

      // Lattice atoms, vibrating more as the material warms.
      const spacing = 24;
      const cols = Math.max(4, Math.round(sw / spacing));
      const rows = Math.max(3, Math.round(sh / spacing));
      const amp = sensor === 'ntc' ? 0.3 + 3.2 * tempFrac : 1;
      const tv = reducedMotion ? 0 : now;
      ctx.save();
      ctx.fillStyle = theme.structure;
      ctx.globalAlpha = 0.45;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const ax = slab.left + ((c + 0.5) * sw) / cols + amp * Math.sin(tv * 13 + i * 1.7);
          const ay = slab.top + ((r + 0.5) * sh) / rows + amp * Math.cos(tv * 11 + i * 2.3);
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Photons: fall from the source; absorbed ones free an electron where they stop.
      const fallTop = 30;
      const photonsToDraw: Photon[] = reducedMotion
        ? Array.from({ length: Math.min(8, Math.max(0, lightCount)) }, (_, i) => ({
            x: 0.08 + 0.84 * hash(i + 50),
            born: now - PHOTON_FALL_S * (0.2 + 0.6 * hash(i + 70)),
            depth: 0.5,
            absorbed,
          }))
        : sim.photons;
      const kept: Photon[] = [];
      for (const p of photonsToDraw) {
        const age = (now - p.born) / PHOTON_FALL_S;
        const endY = p.absorbed ? p.depth : 1.3;
        const yPx = fallTop + age * (slab.top - fallTop + sh * 0.5);
        const stopPx = py(endY);
        if (yPx >= stopPx) {
          if (p.absorbed && !reducedMotion) {
            sim.electrons.push({ x: p.x, y: p.depth, dies: lifetime(now) });
            sim.flashes.push({ x: p.x, y: p.depth, born: now });
          }
          if (!p.absorbed && yPx < h) kept.push(p);
          else continue;
        } else {
          kept.push(p);
        }
        const inSlab = yPx > slab.top;
        photonShape(
          ctx,
          px(p.x),
          yPx,
          photonColor,
          !p.absorbed && inSlab ? 0.35 : 0.95,
          color === 'ir'
        );
      }
      if (!reducedMotion) sim.photons = kept.filter((p) => (now - p.born) / PHOTON_FALL_S < 3);

      // Flashes: a burst where an electron was freed, and the + ion left behind.
      for (const f of sim.flashes) {
        const age = now - f.born;
        ctx.save();
        if (age < 0.35) {
          ctx.globalAlpha = 1 - age / 0.35;
          ctx.strokeStyle = sensor === 'ldr' ? photonColor : heatColor(Math.max(0.6, tempFrac));
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px(f.x), py(f.y), 4 + age * 30, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = Math.max(0, 1 - age / 1.2) * 0.9;
        text(ctx, '+', px(f.x), py(f.y), theme.danger, 'center', 'bold 13px sans-serif');
        ctx.restore();
      }

      // Free electrons.
      ctx.save();
      ctx.fillStyle = theme.input;
      for (const e of sim.electrons) {
        ctx.beginPath();
        ctx.arc(px(e.x), py(e.y), 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Counter and direction arrows.
      text(ctx, labels.carriers, w - 10, 14, theme.text, 'right');
      const ay1 = slab.bottom + 24;
      const ay2 = slab.bottom + 50;
      arrow(ctx, slab.left + 10, slab.left + 70, ay1, theme.input);
      text(ctx, labels.drift, slab.left + 80, ay1, theme.input);
      arrow(ctx, slab.left + 70, slab.left + 10, ay2, theme.structure);
      text(ctx, labels.conventional, slab.left + 80, ay2, theme.text);
    },
    [sensor, quantity, color, carriers, labels, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={HEIGHT}
      ariaLabel={ariaLabel}
      onDraw={handleDraw}
      // Reduced motion draws one still frame, so it must redraw when the inputs change.
      deps={[sensor, reducedMotion ? `${quantity}|${color}|${carriers}` : 0]}
    />
  );
}
