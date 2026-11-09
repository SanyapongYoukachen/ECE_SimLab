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
import {
  AnimatedCanvas,
  Field,
  PlotCanvas,
  SegmentedControl,
  Slider,
  usePrefersReducedMotion,
} from '@/components/ui';
import {
  DIODES,
  DIODE_APPROX,
  DIODE_KINDS,
  diodeCurrent,
  solveDiodeCircuit,
  type DiodeApprox,
  type DiodeKind,
} from '@/lib/circuits/semiconductor';
import type { ElectronicsState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import { Stat } from '../circuits/Stat';
import { drawDiode } from './symbols';
import { eng, volts } from './format';
import { label } from '../circuits/draw';

interface Props {
  readonly state: ElectronicsState;
  readonly set: <K extends keyof ElectronicsState>(key: K, value: ElectronicsState[K]) => void;
}

/** LED light, by wavelength. */
const GLOW: Partial<Record<DiodeKind, string>> = {
  red: '#ff3b30',
  green: '#34c759',
  blue: '#2f7bff',
};

export function DiodeSection({ state, set }: Props): React.JSX.Element {
  const t = useMessages().electronics.diode;
  const kind = state.kind as DiodeKind;
  const approx = state.approx as DiodeApprox;
  const d = DIODES[kind];
  const all = useMemo(
    () =>
      Object.fromEntries(
        DIODE_APPROX.map((a) => [a, solveDiodeCircuit(d, a, state.vs, state.rd)])
      ) as Record<DiodeApprox, ReturnType<typeof solveDiodeCircuit>>,
    [d, state.vs, state.rd]
  );
  const r = all[approx];
  const isLed = d.wavelength !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <div className="flex flex-wrap gap-4">
        <Field label={t.kindLabel}>
          <SegmentedControl
            label={t.kindLabel}
            value={kind}
            onChange={(v) => {
              logEvent('electronics', 'diode_kind', { kind: v });
              set('kind', v);
            }}
            options={DIODE_KINDS.map((k) => ({ value: k, label: t.kinds[k] }))}
          />
        </Field>
        <Field label={t.modelLabel}>
          <SegmentedControl
            label={t.modelLabel}
            value={approx}
            onChange={(v) => set('approx', v)}
            options={DIODE_APPROX.map((a) => ({ value: a, label: t.models[a] }))}
          />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DiodeCircuit state={state} id={r.id} vd={r.vd} />
        <IvPlot state={state} all={all} />
      </div>

      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {!r.conducting
          ? state.vs < 0
            ? t.insightReverse
            : t.insightBelow(volts(d.vf, 1))
          : isLed
            ? t.insightLed(
                d.wavelength ?? 0,
                (1239.84 / (d.wavelength ?? 1)).toFixed(2),
                volts(r.vd, 2)
              )
            : t.insightOn(volts(r.vd, 3))}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statId} value={eng(r.id, 'A')} />
        <Stat label={t.statVd} value={volts(r.vd)} />
        <Stat label={t.statVr} value={volts(r.vr)} />
        <Stat label={t.statPd} value={eng(r.pd, 'W')} />
      </div>

      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full text-sm">
          <caption className="px-3 pt-2 text-left text-xs text-[var(--foreground)]/65">
            {t.compareTitle}
          </caption>
          <thead>
            <tr className="text-left text-xs text-[var(--foreground)]/60">
              <th className="px-3 py-1.5 font-normal">{t.modelLabel}</th>
              <th className="px-3 py-1.5 font-normal">{t.statVd}</th>
              <th className="px-3 py-1.5 font-normal">{t.statId}</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {DIODE_APPROX.map((a) => (
              <tr
                key={a}
                className={
                  a === approx ? 'bg-[var(--accent-soft)]' : 'border-t border-[var(--border)]'
                }
              >
                <td className="px-3 py-1.5 font-sans">{t.models[a]}</td>
                <td className="px-3 py-1.5">{volts(all[a].vd)}</td>
                <td className="px-3 py-1.5">{eng(all[a].id, 'A')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-2">
        <Slider
          label={t.sliderVs}
          value={state.vs}
          min={-10}
          max={15}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(v) => set('vs', Number(v.toFixed(1)))}
        />
        <Slider
          label={t.sliderR}
          value={Math.log10(state.rd)}
          min={1}
          max={4}
          step={0.01}
          formatValue={(v) => eng(Math.pow(10, v), 'Ω')}
          onChange={(v) => set('rd', Number(Math.pow(10, v).toPrecision(3)))}
        />
      </div>
    </div>
  );
}

/** Source, resistor and diode in one loop; an LED glows with its current. */
function DiodeCircuit({
  state,
  id,
  vd,
}: {
  readonly state: ElectronicsState;
  readonly id: number;
  readonly vd: number;
}): React.JSX.Element {
  const t = useMessages().electronics.diode;
  const reducedMotion = usePrefersReducedMotion();
  const kind = state.kind as DiodeKind;
  const glow = GLOW[kind];

  const handleDraw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: { width: number; height: number },
      theme: PlotTheme,
      phase: number
    ) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const top = 44;
      const bottom = h - 34;
      const left = 60;
      const right = Math.min(w - 90, left + 280);
      const tl: Point = { x: left, y: top };
      const tr: Point = { x: right, y: top };
      const br: Point = { x: right, y: bottom };
      const bl: Point = { x: left, y: bottom };
      // Battery with + on top when VS > 0, flipped otherwise.
      if (state.vs >= 0) drawBattery(ctx, { from: tl, to: bl, color: theme.input });
      else drawBattery(ctx, { from: bl, to: tl, color: theme.input });
      drawResistor(ctx, { from: tl, to: tr, color: theme.structure });
      drawDiode(
        ctx,
        tr,
        br,
        theme.active,
        glow ? { glow, intensity: Math.min(1, id / 0.015) } : undefined
      );
      drawWire(ctx, [br, bl], theme.structure);
      label(
        ctx,
        `VS ${state.vs.toFixed(1)} V`,
        left - 10,
        (top + bottom) / 2 + 26,
        theme.input,
        'right'
      );
      label(
        ctx,
        state.vs >= 0 ? '+' : '−',
        left - 14,
        top + 14,
        theme.text,
        'center',
        '13px sans-serif'
      );
      label(ctx, `R ${eng(state.rd, 'Ω')}`, (left + right) / 2, top - 16, theme.text, 'center');
      label(ctx, `VD ${vd.toFixed(3)} V`, right + 18, (top + bottom) / 2 - 8, theme.active);
      label(ctx, t.kinds[kind], right + 18, (top + bottom) / 2 + 10, theme.text);
      label(ctx, `I = ${eng(id, 'A')}`, (left + right) / 2, bottom + 18, theme.output, 'center');
      const maxI = Math.max(Math.abs(state.vs) / state.rd, 1e-6);
      const loop = [
        { from: tl, to: tr },
        { from: tr, to: br },
        { from: br, to: bl },
        { from: bl, to: tl },
      ];
      if (!reducedMotion && Math.abs(id) > 1e-7) {
        for (const seg of loop) {
          drawCurrentFlowDots(
            ctx,
            { ...seg, current: id },
            { color: theme.output, phase, maxCurrent: maxI, maxSpeedPxPerSec: 80 }
          );
        }
      }
    },
    [state.vs, state.rd, id, vd, kind, glow, t, reducedMotion]
  );

  return (
    <AnimatedCanvas
      height={250}
      ariaLabel={t.circuitAria(state.vs.toFixed(1), eng(state.rd, 'Ω'), eng(id, 'A'))}
      onDraw={handleDraw}
      deps={[reducedMotion ? `${id}|${vd}|${kind}` : kind]}
    />
  );
}

/**
 * The diode's I–V curve and the circuit's load line I = (VS − V)/R; the
 * operating point is where they cross. The three models are drawn so their
 * crossing points can be compared.
 */
function IvPlot({
  state,
  all,
}: {
  readonly state: ElectronicsState;
  readonly all: Record<DiodeApprox, ReturnType<typeof solveDiodeCircuit>>;
}): React.JSX.Element {
  const t = useMessages().electronics.diode;
  const kind = state.kind as DiodeKind;
  const approx = state.approx as DiodeApprox;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const d = DIODES[kind];
      const padL = 52;
      const padR = 14;
      const padT = 16;
      const padB = 30;
      const vMin = Math.min(-1, state.vs - 0.5);
      const vMax = Math.max(d.vf + 1, state.vs + 0.5);
      const iMaxRaw = Math.max(Math.abs(state.vs) / state.rd, 0.002);
      const iMax = iMaxRaw * 1.25 * 1000; // mA
      const iMin = -iMax * 0.12;
      const xs = (v: number): number => padL + ((v - vMin) / (vMax - vMin)) * (w - padL - padR);
      const ys = (ma: number): number => padT + ((iMax - ma) / (iMax - iMin)) * (h - padT - padB);

      // Axes and grid.
      ctx.save();
      ctx.strokeStyle = theme.structure;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, ys(0) + 0.5);
      ctx.lineTo(w - padR, ys(0) + 0.5);
      ctx.moveTo(xs(0) + 0.5, padT);
      ctx.lineTo(xs(0) + 0.5, h - padB);
      ctx.stroke();
      ctx.restore();
      const vStep = vMax - vMin > 12 ? 5 : vMax - vMin > 5 ? 2 : 1;
      for (let v = Math.ceil(vMin / vStep) * vStep; v <= vMax; v += vStep) {
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
      for (const f of [0.5, 1]) {
        const ma = (iMax / 1.25) * f;
        label(
          ctx,
          ma.toPrecision(2),
          padL - 6,
          ys(ma),
          theme.text,
          'right',
          '10px var(--font-mono, monospace)'
        );
      }
      label(ctx, 'mA', 6, padT + 4, theme.text, 'left', '10px var(--font-mono, monospace)');
      label(ctx, 'V', w - padR, h - 6, theme.text, 'right', '10px var(--font-mono, monospace)');

      const clip = (y: number): number => Math.max(padT - 2, Math.min(h - padB, y));
      const stroke = (
        pts: [number, number][],
        color: string,
        width: number,
        dash: number[] = [],
        alpha = 1
      ): void => {
        ctx.save();
        // Clip to the plot so steep curves leave through the top instead of running along it.
        ctx.beginPath();
        ctx.rect(padL, padT - 2, w - padL - padR, h - padT - padB + 2);
        ctx.clip();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = alpha;
        ctx.setLineDash(dash);
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();
        ctx.restore();
      };
      // The three models.
      const N = 300;
      const expPts: [number, number][] = [];
      for (let i = 0; i <= N; i++) {
        const v = vMin + ((vMax - vMin) * i) / N;
        expPts.push([xs(v), ys(diodeCurrent(d, v) * 1000)]);
      }
      const models: Record<DiodeApprox, [number, number][]> = {
        ideal: [
          [xs(vMin), ys(0)],
          [xs(0), ys(0)],
          [xs(0), ys(iMax * 2)],
        ],
        drop: [
          [xs(vMin), ys(0)],
          [xs(d.vf), ys(0)],
          [xs(d.vf), ys(iMax * 2)],
        ],
        exp: expPts,
      };
      for (const a of DIODE_APPROX) {
        stroke(
          models[a],
          theme.active,
          a === approx ? 2.6 : 1.4,
          a === approx ? [] : [4, 4],
          a === approx ? 1 : 0.45
        );
      }
      // Load line from (VS, 0) to (0, VS/R).
      stroke(
        [
          [xs(state.vs), ys(0)],
          [xs(0), ys((state.vs / state.rd) * 1000)],
        ],
        theme.input,
        1.8
      );
      label(
        ctx,
        t.loadLine,
        xs(state.vs) - 4,
        ys(0) - 12,
        theme.input,
        state.vs > 0 ? 'right' : 'left',
        '10px var(--font-mono, monospace)'
      );
      // Operating point.
      const q = all[approx];
      ctx.save();
      ctx.fillStyle = theme.output;
      ctx.strokeStyle = theme.surface;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xs(q.vd), clip(ys(q.id * 1000)), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      label(
        ctx,
        `Q (${q.vd.toFixed(2)} V, ${eng(q.id, 'A', 2)})`,
        xs(q.vd) + 10,
        clip(ys(q.id * 1000)) + 14,
        theme.output,
        'left',
        '10px var(--font-mono, monospace)'
      );
    },
    [state.vs, state.rd, kind, approx, all, t]
  );

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs text-[var(--foreground)]/70">{t.ivTitle}</figcaption>
      <PlotCanvas
        height={250}
        ariaLabel={t.ivAria(all[approx].vd.toFixed(2), eng(all[approx].id, 'A'))}
        onDraw={handleDraw}
        deps={[state.vs, state.rd, kind, approx, t]}
      />
    </figure>
  );
}
