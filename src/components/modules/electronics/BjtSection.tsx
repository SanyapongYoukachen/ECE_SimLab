'use client';

import { useCallback, useMemo } from 'react';
import {
  drawBattery,
  drawCurrentFlowDots,
  drawResistor,
  drawWire,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { AnimatedCanvas, PlotCanvas, Slider, usePrefersReducedMotion } from '@/components/ui';
import { collectorCurrent, solveBjt, type BjtResult } from '@/lib/circuits/semiconductor';
import type { ElectronicsState } from '@/lib/state/schemas';
import { useMessages } from '@/lib/i18n';
import { Stat } from '../circuits/Stat';
import { label, drawGround } from '../circuits/draw';
import { drawNpn } from './symbols';
import { eng, volts } from './format';

interface Props {
  readonly state: ElectronicsState;
  readonly set: <K extends keyof ElectronicsState>(key: K, value: ElectronicsState[K]) => void;
}

const REGION_COLOR: Readonly<Record<BjtResult['region'], string>> = {
  cutoff: 'var(--plot-structure)',
  active: 'var(--plot-output)',
  saturation: 'var(--plot-active)',
};

export function BjtSection({ state, set }: Props): React.JSX.Element {
  const t = useMessages().electronics.bjt;
  const r = useMemo(
    () => solveBjt(state.vbb, state.rb, state.vcc, state.rc, state.beta),
    [state.vbb, state.rb, state.vcc, state.rc, state.beta]
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <BjtCircuit state={state} r={r} />
        <OutputCurves state={state} r={r} />
      </div>
      <div
        className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80"
        style={{ borderLeft: `4px solid ${REGION_COLOR[r.region]}` }}
      >
        <span className="font-semibold">{t.regions[r.region]}: </span>
        {t.insight[r.region]}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statIb} value={eng(r.ib, 'A')} />
        <Stat label={t.statIc} value={eng(r.ic, 'A')} />
        <Stat label={t.statRatio} value={r.ib > 0 ? r.betaForced.toFixed(1) : '—'} />
        <Stat label={t.statRegion} value={t.regions[r.region]} />
        <Stat label={t.statVbe} value={volts(r.vbe)} />
        <Stat label={t.statVce} value={volts(r.vce)} />
        <Stat label={t.statIcSat} value={eng(r.icSat, 'A')} />
        <Stat label={t.statPc} value={eng(r.ic * r.vce, 'W')} />
      </div>
      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-2">
        <Slider
          label={t.sliderVbb}
          value={state.vbb}
          min={0}
          max={5}
          step={0.05}
          formatValue={(v) => `${v.toFixed(2)} V`}
          onChange={(v) => set('vbb', Number(v.toFixed(2)))}
        />
        <Slider
          label={t.sliderRb}
          value={Math.log10(state.rb)}
          min={3}
          max={6}
          step={0.01}
          formatValue={(v) => eng(Math.pow(10, v), 'Ω')}
          onChange={(v) => set('rb', Number(Math.pow(10, v).toPrecision(3)))}
        />
        <Slider
          label={t.sliderVcc}
          value={state.vcc}
          min={3}
          max={20}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(v) => set('vcc', v)}
        />
        <Slider
          label={t.sliderRc}
          value={Math.log10(state.rc)}
          min={2}
          max={4}
          step={0.01}
          formatValue={(v) => eng(Math.pow(10, v), 'Ω')}
          onChange={(v) => set('rc', Number(Math.pow(10, v).toPrecision(3)))}
        />
        <Slider
          label={t.sliderBeta}
          value={state.beta}
          min={20}
          max={400}
          step={5}
          onChange={(v) => set('beta', v)}
        />
      </div>
    </div>
  );
}

/** VBB → RB → base; VCC → RC → collector; emitter to ground. Base current thin and slow, collector current thick. */
function BjtCircuit({
  state,
  r,
}: {
  readonly state: ElectronicsState;
  readonly r: BjtResult;
}): React.JSX.Element {
  const t = useMessages().electronics.bjt;
  const reducedMotion = usePrefersReducedMotion();

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const ground = h - 30;
      const railTop = 34;
      const cx = Math.min(w * 0.55, w - 130);
      const q = drawNpn(ctx, { x: cx, y: h / 2 + 10 }, theme.active);
      const bbX = 40;
      const ccX = Math.min(w - 40, cx + 150);
      // Base loop.
      const bbTop: Point = { x: bbX, y: q.base.y };
      drawBattery(ctx, { from: bbTop, to: { x: bbX, y: ground }, color: theme.input });
      drawResistor(ctx, { from: bbTop, to: q.base, color: theme.structure, peaks: 5 });
      // Collector loop.
      const rcTop: Point = { x: q.collector.x, y: railTop };
      drawResistor(ctx, { from: rcTop, to: q.collector, color: theme.structure, peaks: 5 });
      drawWire(ctx, [rcTop, { x: ccX, y: railTop }], theme.structure);
      drawBattery(ctx, {
        from: { x: ccX, y: railTop },
        to: { x: ccX, y: ground },
        color: theme.input,
      });
      drawWire(
        ctx,
        [
          { x: bbX, y: ground },
          { x: ccX, y: ground },
        ],
        theme.structure
      );
      drawWire(ctx, [q.emitter, { x: q.emitter.x, y: ground }], theme.structure);
      drawGround(ctx, { x: q.emitter.x, y: ground }, theme.structure);

      label(ctx, `VBB ${state.vbb.toFixed(2)} V`, bbX + 10, ground - 22, theme.input);
      label(
        ctx,
        `RB ${eng(state.rb, 'Ω')}`,
        (bbX + q.base.x) / 2,
        q.base.y - 16,
        theme.text,
        'center'
      );
      label(
        ctx,
        `RC ${eng(state.rc, 'Ω')}`,
        q.collector.x + 12,
        (railTop + q.collector.y) / 2,
        theme.text
      );
      label(
        ctx,
        `VCC ${state.vcc.toFixed(1)} V`,
        ccX - 8,
        (railTop + ground) / 2 + 30,
        theme.input,
        'right'
      );
      label(
        ctx,
        `IB ${eng(r.ib, 'A')}`,
        (bbX + q.base.x) / 2,
        q.base.y + 16,
        theme.output,
        'center'
      );
      label(
        ctx,
        `IC ${eng(r.ic, 'A')}`,
        q.collector.x - 12,
        (railTop + q.collector.y) / 2,
        theme.output,
        'right'
      );
      label(ctx, `VCE ${r.vce.toFixed(2)} V`, q.collector.x + 30, h / 2 + 10, theme.active);
      label(
        ctx,
        t.regions[r.region],
        w / 2,
        14,
        theme.text,
        'center',
        'bold 12px var(--font-mono, monospace)'
      );

      if (!reducedMotion) {
        const scale = Math.max(r.icSat, 1e-6);
        const baseLoop = [
          { from: { x: bbX, y: ground }, to: bbTop },
          { from: bbTop, to: q.base },
        ];
        for (const seg of baseLoop) {
          // Base current is shown scaled up ×20 so it moves at all, but still far slower than IC.
          drawCurrentFlowDots(
            ctx,
            { ...seg, current: Math.min(r.ib * 20, scale * 0.25) },
            { color: theme.output, phase, maxCurrent: scale, dotRadius: 1.8, maxSpeedPxPerSec: 80 }
          );
        }
        const collectorLoop = [
          { from: { x: ccX, y: ground }, to: { x: ccX, y: railTop } },
          { from: { x: ccX, y: railTop }, to: rcTop },
          { from: rcTop, to: q.collector },
          { from: q.emitter, to: { x: q.emitter.x, y: ground } },
        ];
        for (const seg of collectorLoop) {
          drawCurrentFlowDots(
            ctx,
            { ...seg, current: r.ic },
            { color: theme.output, phase, maxCurrent: scale, dotRadius: 3, maxSpeedPxPerSec: 80 }
          );
        }
      }
    },
    [state.vbb, state.rb, state.vcc, state.rc, r, t, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={280}
      ariaLabel={t.circuitAria(
        eng(r.ib, 'A'),
        eng(r.ic, 'A'),
        r.vce.toFixed(2),
        t.regions[r.region]
      )}
      onDraw={handleDraw}
      deps={[reducedMotion ? `${r.ic}|${r.ib}` : 0]}
    />
  );
}

/**
 * The transistor's output characteristics — IC against VCE, one curve per
 * base current — with the collector circuit's load line. The operating
 * point slides along the load line as IB changes: cutoff at the bottom,
 * saturation against the left wall.
 */
function OutputCurves({
  state,
  r,
}: {
  readonly state: ElectronicsState;
  readonly r: BjtResult;
}): React.JSX.Element {
  const t = useMessages().electronics.bjt;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const padL = 50;
      const padR = 64;
      const padT = 14;
      const padB = 30;
      const vMax = state.vcc * 1.08;
      const icMax = Math.max(r.icSat, r.ic) * 1.35;
      const xs = (v: number): number => padL + (v / vMax) * (w - padL - padR);
      const ys = (i: number): number => h - padB - (i / icMax) * (h - padT - padB);

      // Saturation region shading.
      ctx.save();
      ctx.fillStyle = theme.active;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(xs(0), padT, xs(0.3) - xs(0), h - padT - padB);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.beginPath();
      ctx.moveTo(padL, h - padB + 0.5);
      ctx.lineTo(w - padR, h - padB + 0.5);
      ctx.moveTo(padL + 0.5, padT);
      ctx.lineTo(padL + 0.5, h - padB);
      ctx.stroke();
      ctx.restore();
      for (let v = 0; v <= vMax; v += state.vcc > 10 ? 4 : 2) {
        label(
          ctx,
          `${v}`,
          xs(v),
          h - padB + 12,
          theme.text,
          'center',
          '10px var(--font-mono, monospace)'
        );
      }
      label(
        ctx,
        'VCE (V)',
        w - padR,
        h - 6,
        theme.text,
        'right',
        '10px var(--font-mono, monospace)'
      );
      label(
        ctx,
        eng(icMax / 1.35, 'A', 2),
        padL - 4,
        ys(icMax / 1.35),
        theme.text,
        'right',
        '10px var(--font-mono, monospace)'
      );
      label(ctx, 'IC', 6, padT + 2, theme.text, 'left', '10px var(--font-mono, monospace)');

      // A family of curves: IB steps chosen so the present IB is one of them.
      const step = r.ib > 0 ? r.ib / 3 : state.vcc / state.rc / state.beta / 4;
      const N = 160;
      for (let k = 1; k <= 6; k++) {
        const ib = step * k;
        const current = r.ib > 0 && k === 3;
        ctx.save();
        ctx.strokeStyle = current ? theme.output : theme.structure;
        ctx.lineWidth = current ? 2.4 : 1.2;
        ctx.globalAlpha = current ? 1 : 0.7;
        ctx.beginPath();
        let lastY = 0;
        for (let i = 0; i <= N; i++) {
          const v = (vMax * i) / N;
          const y = Math.max(padT, ys(collectorCurrent(state.beta, ib, v)));
          lastY = y;
          if (i === 0) ctx.moveTo(xs(v), y);
          else ctx.lineTo(xs(v), y);
        }
        ctx.stroke();
        ctx.restore();
        if (lastY > padT + 4)
          label(
            ctx,
            `${eng(ib, 'A', 2)}`,
            w - padR + 4,
            lastY,
            current ? theme.output : theme.text,
            'left',
            '9px var(--font-mono, monospace)'
          );
      }
      // Load line: IC = (VCC − VCE)/RC.
      ctx.save();
      ctx.strokeStyle = theme.input;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xs(0), Math.max(padT, ys(state.vcc / state.rc)));
      ctx.lineTo(xs(state.vcc), ys(0));
      ctx.stroke();
      ctx.restore();
      label(
        ctx,
        t.loadLine,
        xs(state.vcc * 0.62),
        ys((state.vcc * 0.38) / state.rc) - 12,
        theme.input,
        'left',
        '10px var(--font-mono, monospace)'
      );
      // Q point.
      ctx.save();
      ctx.fillStyle = theme.output;
      ctx.strokeStyle = theme.surface;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xs(r.vce), ys(r.ic), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      label(
        ctx,
        t.saturationRegion,
        xs(0.3) + 4,
        padT + 8,
        theme.active,
        'left',
        '10px var(--font-mono, monospace)'
      );
      label(
        ctx,
        t.cutoffRegion,
        xs(vMax * 0.55),
        h - padB - 8,
        theme.text,
        'left',
        '10px var(--font-mono, monospace)'
      );
    },
    [state.vcc, state.rc, state.beta, r, t]
  );

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs text-[var(--foreground)]/70">{t.curvesTitle}</figcaption>
      <PlotCanvas
        height={280}
        ariaLabel={t.curvesAria(r.vce.toFixed(2), eng(r.ic, 'A'))}
        onDraw={handleDraw}
        deps={[state.vcc, state.rc, state.beta, r, t]}
      />
    </figure>
  );
}
