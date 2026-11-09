'use client';

import { useCallback, useMemo, useRef } from 'react';
import type { PlotTheme } from '@/lib/plot';
import { AnimatedCanvas, PlotCanvas, Slider, usePrefersReducedMotion } from '@/components/ui';
import {
  NI_SI,
  Q,
  EPS_SI,
  VT,
  solveJunction,
  type JunctionResult,
} from '@/lib/circuits/semiconductor';
import type { ElectronicsState } from '@/lib/state/schemas';
import { useMessages } from '@/lib/i18n';
import { Stat } from '../circuits/Stat';
import { doping, hugeRatio, microns, volts } from './format';

interface Props {
  readonly state: ElectronicsState;
  readonly set: <K extends keyof ElectronicsState>(key: K, value: ElectronicsState[K]) => void;
}

/** Fixed colours for the carriers: holes red, electrons blue, as in most textbooks. */
const HOLE = '#d64532';
const ELECTRON = '#2f6fd6';
const EG = 1.12;

interface Carrier {
  u: number;
  y: number;
  /** Injected across the junction (forward bias): moves and fades. */
  born?: number;
  dir?: number;
}

interface Sim {
  holes: Carrier[];
  electrons: Carrier[];
  last: number;
  injectDebt: number;
  driftDebt: number;
}

function hash(i: number): number {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
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

/** Width of the window shown: the junction at −10 V reverse bias fills about 40% of it. */
function viewLength(na: number, nd: number): number {
  return 2.5 * solveJunction({ na, nd, va: -10 }).w;
}

/** Visual carrier density per side: heavier doping, more dots. */
function density(n: number): number {
  return 40 + 18 * (Math.log10(n) - 14);
}

export function JunctionSection({ state, set }: Props): React.JSX.Element {
  const t = useMessages().electronics.pn;
  const j = useMemo(
    () => solveJunction({ na: state.na, nd: state.nd, va: state.va }),
    [state.na, state.nd, state.va]
  );
  const bias = state.va > 0.005 ? 'forward' : state.va < -0.005 ? 'reverse' : 'zero';

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <JunctionCanvas state={state} j={j} />
      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {t.insight[bias]}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statVbi} value={volts(j.vbi)} />
        <Stat label={t.statBarrier} value={`${j.vj.toFixed(3)} eV`} />
        <Stat label={t.statW} value={microns(j.w)} />
        <Stat label={t.statEmax} value={`${(j.eMax / 1000).toFixed(1)} kV/cm`} />
        <Stat label={t.statXp} value={microns(j.xp)} />
        <Stat label={t.statXn} value={microns(j.xn)} />
        <Stat label={t.statMinority} value={doping(j.nP)} />
        <Stat label={t.statCurrent} value={hugeRatio(j.currentRatio)} />
      </div>
      <BandPlot state={state} j={j} />
      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-3">
        <Slider
          label={t.sliderVa}
          value={state.va}
          min={-10}
          max={0.65}
          step={0.01}
          formatValue={(v) => `${v.toFixed(2)} V`}
          onChange={(v) => set('va', v)}
        />
        <Slider
          label={t.sliderNa}
          value={Math.log10(state.na)}
          min={14}
          max={18}
          step={0.1}
          formatValue={(v) => doping(Math.pow(10, v))}
          onChange={(v) => set('na', Number(Math.pow(10, v).toPrecision(3)))}
        />
        <Slider
          label={t.sliderNd}
          value={Math.log10(state.nd)}
          min={14}
          max={18}
          step={0.1}
          formatValue={(v) => doping(Math.pow(10, v))}
          onChange={(v) => set('nd', Number(Math.pow(10, v).toPrecision(3)))}
        />
      </div>
    </div>
  );
}

/**
 * The junction, magnified: neutral P (holes) and N (electrons) regions,
 * and between them the depletion region — empty of mobile carriers, holding
 * the fixed ions (− acceptors, + donors) whose field E points from N to P.
 * Forward bias narrows it and carriers pour across; reverse bias widens it
 * and only a trickle of minority carriers is swept through.
 */
function JunctionCanvas({
  state,
  j,
}: {
  readonly state: ElectronicsState;
  readonly j: JunctionResult;
}): React.JSX.Element {
  const t = useMessages().electronics.pn;
  const reducedMotion = usePrefersReducedMotion();
  const simRef = useRef<Sim | null>(null);

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const left = 36;
      const right = w - 36;
      const top = 54;
      const bottom = h - 64;
      const bw = right - left;
      const bh = bottom - top;
      const L = viewLength(state.na, state.nd);
      const uL = Math.max(0.02, 0.5 - j.xp / L);
      const uR = Math.min(0.98, 0.5 + j.xn / L);
      const px = (u: number): number => left + u * bw;
      const py = (y: number): number => top + y * bh;

      // Regions.
      ctx.save();
      ctx.fillStyle = 'rgba(214, 69, 50, 0.08)';
      ctx.fillRect(left, top, px(uL) - left, bh);
      ctx.fillStyle = 'rgba(47, 111, 214, 0.08)';
      ctx.fillRect(px(uR), top, right - px(uR), bh);
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.strokeRect(left + 0.5, top + 0.5, bw - 1, bh - 1);
      ctx.setLineDash([4, 3]);
      for (const u of [uL, uR]) {
        ctx.beginPath();
        ctx.moveTo(px(u), top);
        ctx.lineTo(px(u), bottom);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(px(0.5), top - 4);
      ctx.lineTo(px(0.5), bottom + 4);
      ctx.stroke();
      ctx.restore();
      // Metal contacts.
      ctx.save();
      ctx.fillStyle = theme.structure;
      ctx.fillRect(left - 8, top, 8, bh);
      ctx.fillRect(right, top, 8, bh);
      ctx.restore();

      // Fixed ions in the depletion region.
      const ionRows = 5;
      const spacingP = Math.max(9, 20 - 2.5 * (Math.log10(state.na) - 14));
      const spacingN = Math.max(9, 20 - 2.5 * (Math.log10(state.nd) - 14));
      for (const [from, to, spacing, sign, color] of [
        [uL, 0.5, spacingP, '−', HOLE],
        [0.5, uR, spacingN, '+', ELECTRON],
      ] as const) {
        const x0 = px(from);
        const x1 = px(to);
        for (let x = x0 + spacing / 2; x < x1 - 2; x += spacing) {
          for (let r = 0; r < ionRows; r++) {
            const y = top + ((r + 0.5) * bh) / ionRows;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            text(ctx, sign, x, y, color, 'center', 'bold 9px sans-serif');
          }
        }
      }

      // ----- carriers -----
      const now = performance.now() / 1000;
      const targetH = Math.round(density(state.na) * uL);
      const targetE = Math.round(density(state.nd) * (1 - uR));
      let sim = simRef.current;
      if (!sim || reducedMotion) {
        sim = {
          holes: Array.from({ length: targetH }, (_, i) => ({ u: hash(i) * uL, y: hash(i + 99) })),
          electrons: Array.from({ length: targetE }, (_, i) => ({
            u: uR + hash(i + 7) * (1 - uR),
            y: hash(i + 199),
          })),
          last: now,
          injectDebt: 0,
          driftDebt: 0,
        };
        simRef.current = sim;
      }
      const dt = Math.min(0.1, Math.max(0, now - sim.last));
      sim.last = now;
      if (!reducedMotion) {
        const majority = (list: Carrier[]): Carrier[] => list.filter((c) => c.born === undefined);
        // Keep the neutral regions at their density.
        const mh = majority(sim.holes);
        const me = majority(sim.electrons);
        if (mh.length < targetH) sim.holes.push({ u: Math.random() * uL, y: Math.random() });
        if (mh.length > targetH) sim.holes.splice(sim.holes.indexOf(mh[0]), 1);
        if (me.length < targetE)
          sim.electrons.push({ u: uR + Math.random() * (1 - uR), y: Math.random() });
        if (me.length > targetE) sim.electrons.splice(sim.electrons.indexOf(me[0]), 1);

        // Forward bias: majority carriers diffuse across and recombine on the far side.
        const fwd = Math.min(1, Math.max(0, (state.va - 0.2) / 0.42));
        sim.injectDebt += 36 * fwd * fwd * dt;
        while (sim.injectDebt >= 1) {
          sim.injectDebt -= 1;
          sim.electrons.push({ u: uR, y: Math.random(), born: now, dir: -1 });
          sim.holes.push({ u: uL, y: Math.random(), born: now, dir: 1 });
        }
        // Reverse/zero bias: a trickle of thermally generated minority carriers swept by the field.
        if (state.va < 0.1) {
          sim.driftDebt += 0.7 * dt;
          while (sim.driftDebt >= 1) {
            sim.driftDebt -= 1;
            sim.electrons.push({ u: uL, y: Math.random(), born: now, dir: 1 });
          }
        }

        const step = (c: Carrier, lo: number, hi: number): void => {
          c.y = Math.min(0.97, Math.max(0.03, c.y + (Math.random() - 0.5) * 0.6 * dt));
          if (c.born !== undefined) {
            c.u += (c.dir ?? 0) * 0.22 * dt + (Math.random() - 0.5) * 0.04 * dt;
            return;
          }
          c.u += (Math.random() - 0.5) * 0.25 * dt;
          if (c.u < lo) c.u = lo + (lo - c.u);
          if (c.u > hi) c.u = hi - (c.u - hi);
        };
        sim.holes.forEach((c) => step(c, 0.005, uL - 0.005));
        sim.electrons.forEach((c) => step(c, uR + 0.005, 0.995));
        const alive = (c: Carrier): boolean =>
          c.born === undefined || (now - c.born < 2.2 && c.u > 0 && c.u < 1);
        sim.holes = sim.holes.filter(alive);
        sim.electrons = sim.electrons.filter(alive);
      }

      const fade = (c: Carrier): number =>
        c.born === undefined ? 1 : Math.max(0, 1 - (now - c.born) / 2.2);
      for (const c of sim.holes) {
        ctx.save();
        ctx.globalAlpha = fade(c);
        ctx.strokeStyle = HOLE;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px(c.u), py(c.y), 3.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      for (const c of sim.electrons) {
        ctx.save();
        ctx.globalAlpha = fade(c);
        ctx.fillStyle = ELECTRON;
        ctx.beginPath();
        ctx.arc(px(c.u), py(c.y), 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Field arrow across the depletion region: from + (N) to − (P).
      if (px(uR) - px(uL) > 30) {
        const y = top - 12;
        ctx.save();
        ctx.strokeStyle = theme.text;
        ctx.fillStyle = theme.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px(uR) - 4, y);
        ctx.lineTo(px(uL) + 10, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px(uL) + 4, y);
        ctx.lineTo(px(uL) + 12, y - 4);
        ctx.lineTo(px(uL) + 12, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        text(ctx, 'E', (px(uL) + px(uR)) / 2, y - 10, theme.text, 'center', 'bold 11px sans-serif');
      }

      text(ctx, t.pLabel(doping(state.na)), left, 18, HOLE, 'left');
      text(ctx, t.nLabel(doping(state.nd)), right, 18, ELECTRON, 'right');
      // Bias at the contacts.
      if (Math.abs(state.va) > 0.005) {
        const pSign = state.va > 0 ? '+' : '−';
        const nSign = state.va > 0 ? '−' : '+';
        text(
          ctx,
          pSign,
          left - 22,
          (top + bottom) / 2,
          theme.text,
          'center',
          'bold 16px sans-serif'
        );
        text(
          ctx,
          nSign,
          right + 22,
          (top + bottom) / 2,
          theme.text,
          'center',
          'bold 16px sans-serif'
        );
      }
      // Width bracket.
      const by = bottom + 16;
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(uL), by - 5);
      ctx.lineTo(px(uL), by + 5);
      ctx.moveTo(px(uL), by);
      ctx.lineTo(px(uR), by);
      ctx.moveTo(px(uR), by - 5);
      ctx.lineTo(px(uR), by + 5);
      ctx.stroke();
      ctx.restore();
      text(ctx, t.widthLabel(microns(j.w)), (px(uL) + px(uR)) / 2, by + 16, theme.text);
      // Legend.
      text(ctx, t.legend, w / 2, h - 10, theme.text, 'center', '10px var(--font-mono, monospace)');
    },
    [state.na, state.nd, state.va, j, t, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={300}
      ariaLabel={t.canvasAria(microns(j.w), state.va.toFixed(2))}
      onDraw={handleDraw}
      deps={[reducedMotion ? `${state.na}|${state.nd}|${state.va}` : 0]}
    />
  );
}

/**
 * Energy bands across the junction (top) and the electric field (bottom),
 * on the same x axis as the junction picture. The bands bend by
 * q(Vbi − Va) — the hill electrons must climb to cross — and the Fermi
 * levels separate by qVa under bias.
 */
function BandPlot({
  state,
  j,
}: {
  readonly state: ElectronicsState;
  readonly j: JunctionResult;
}): React.JSX.Element {
  const t = useMessages().electronics.pn;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const left = 36;
      const right = w - 36;
      const L = viewLength(state.na, state.nd);
      const xs = (x: number): number => left + (x / L + 0.5) * (right - left);
      // Electrostatic potential φ(x), 0 deep in P, Vj deep in N.
      const phi = (x: number): number => {
        if (x <= -j.xp) return 0;
        if (x >= j.xn) return j.vj;
        if (x <= 0) return ((Q * state.na) / (2 * EPS_SI)) * (x + j.xp) ** 2;
        return j.vj - ((Q * state.nd) / (2 * EPS_SI)) * (j.xn - x) ** 2;
      };
      const field = (x: number): number => {
        if (x <= -j.xp || x >= j.xn) return 0;
        return x <= 0 ? (Q * state.na * (x + j.xp)) / EPS_SI : (Q * state.nd * (j.xn - x)) / EPS_SI;
      };
      // Band panel: Ec(x) = −φ(x) (eV), shifted so everything fits.
      const top = 22;
      const bandBottom = h * 0.62;
      const fieldTop = bandBottom + 26;
      const fieldBottom = h - 18;
      const ecP = 0;
      const ecN = -j.vj;
      const efP = ecP - EG / 2 - VT * Math.log(state.na / NI_SI);
      const efN = ecN - EG / 2 + VT * Math.log(state.nd / NI_SI);
      const eMax = ecP + 0.15;
      const eMin = Math.min(ecN - EG, ecP - EG) - 0.15;
      const ey = (e: number): number => top + ((eMax - e) / (eMax - eMin)) * (bandBottom - top);
      const N = 240;
      const curve = (
        f: (x: number) => number,
        color: string,
        width = 2,
        dash: number[] = []
      ): void => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const x = -L / 2 + (i / N) * L;
          const yy = f(x);
          if (i === 0) ctx.moveTo(xs(x), yy);
          else ctx.lineTo(xs(x), yy);
        }
        ctx.stroke();
        ctx.restore();
      };
      curve((x) => ey(ecP - phi(x)), ELECTRON, 2.2);
      curve((x) => ey(ecP - phi(x) - EG), HOLE, 2.2);
      // Fermi levels: flat on each side, split by qVa.
      ctx.save();
      ctx.strokeStyle = theme.output;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(left, ey(efP));
      ctx.lineTo(xs(0), ey(efP));
      ctx.moveTo(xs(0), ey(efN));
      ctx.lineTo(right, ey(efN));
      ctx.stroke();
      ctx.restore();
      text(ctx, 'Ec', right + 4, ey(ecN), ELECTRON, 'left');
      text(ctx, 'Ev', right + 4, ey(ecN - EG), HOLE, 'left');
      text(ctx, 'EF', left + 4, ey(efP) - 9, theme.output, 'left');
      // Barrier height.
      const bx = xs(Math.min(L / 2 - L * 0.08, j.xn + L * 0.06));
      ctx.save();
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(xs(-j.xp), ey(ecP));
      ctx.lineTo(bx, ey(ecP));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(bx, ey(ecP));
      ctx.lineTo(bx, ey(ecN));
      ctx.stroke();
      ctx.restore();
      text(ctx, t.barrier(j.vj.toFixed(2)), bx + 6, (ey(ecP) + ey(ecN)) / 2, theme.text, 'left');
      text(ctx, t.bandTitle, left, 10, theme.text, 'left');

      // Field panel: |E(x)|, a triangle peaking at the junction.
      const fMax = Math.max(j.eMax, 1);
      const fy = (e: number): number => fieldBottom - (e / fMax) * (fieldBottom - fieldTop);
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.beginPath();
      ctx.moveTo(left, fieldBottom + 0.5);
      ctx.lineTo(right, fieldBottom + 0.5);
      ctx.stroke();
      ctx.fillStyle = theme.active;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(xs(-j.xp), fieldBottom);
      ctx.lineTo(xs(0), fy(j.eMax));
      ctx.lineTo(xs(j.xn), fieldBottom);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      curve((x) => fy(field(x)), theme.active, 2);
      text(
        ctx,
        t.fieldTitle((j.eMax / 1000).toFixed(1)),
        left,
        fieldTop - 10,
        theme.active,
        'left'
      );
    },
    [state.na, state.nd, j, t]
  );

  return (
    <PlotCanvas
      height={300}
      ariaLabel={t.bandAria(j.vj.toFixed(2), (j.eMax / 1000).toFixed(1))}
      onDraw={handleDraw}
      deps={[state.na, state.nd, state.va, t]}
    />
  );
}
