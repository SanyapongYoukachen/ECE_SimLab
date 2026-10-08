'use client';

import { useCallback, useMemo } from 'react';
import { drawResistor, drawWire, drawNodeDot, type PlotTheme, type Point } from '@/lib/plot';
import { Field, PlotCanvas, SegmentedControl, Slider } from '@/components/ui';
import {
  VCE_SAT,
  ampOutput,
  collectorCurrent,
  solveAmp,
  type AmpParams,
  type AmpResult,
} from '@/lib/circuits/semiconductor';
import type { ElectronicsState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import { Stat } from '../circuits/Stat';
import { drawGround, label } from '../circuits/draw';
import { drawCapacitor, drawNpn } from './symbols';
import { eng, volts } from './format';

interface Props {
  readonly state: ElectronicsState;
  readonly set: <K extends keyof ElectronicsState>(key: K, value: ElectronicsState[K]) => void;
}

const SAMPLES = 240;

function paramsOf(s: ElectronicsState): AmpParams {
  return {
    vcc: s.vcc,
    r1: s.r1,
    r2: s.r2,
    rc: s.rca,
    re: s.re,
    rl: s.rl,
    beta: s.beta,
    bypass: s.byp === 'on',
  };
}

export function AmpSection({ state, set }: Props): React.JSX.Element {
  const t = useMessages().electronics.amp;
  const p = useMemo(() => paramsOf(state), [state]);
  const q = useMemo(() => solveAmp(p), [p]);
  const vinPk = state.vin / 1000;
  const wave = useMemo(() => {
    const vin: number[] = [];
    const vout: number[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const v = vinPk * Math.sin((4 * Math.PI * i) / SAMPLES);
      vin.push(v);
      vout.push(ampOutput(p, q, v));
    }
    return { vin, vout };
  }, [p, q, vinPk]);
  const outMax = Math.max(...wave.vout);
  const outMin = Math.min(...wave.vout);
  const measured = (outMax - outMin) / (2 * vinPk);
  const clipTop = outMax >= q.swingUp - 1e-6;
  const clipBottom = outMin <= -q.swingDown + 1e-6;
  const linear = Math.abs(measured / Math.abs(q.gain || 1) - 1) < 0.05 && !clipTop && !clipBottom;

  const status = q.saturated
    ? t.statusSaturated
    : clipTop && clipBottom
      ? t.statusBoth
      : clipTop
        ? t.statusCutoff
        : clipBottom
          ? t.statusSat
          : linear
            ? t.statusClean
            : t.statusDistort;

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <Field label={t.bypassLabel}>
        <SegmentedControl
          label={t.bypassLabel}
          value={state.byp}
          onChange={(v) => {
            logEvent('electronics', 'bypass_changed', { bypass: v });
            set('byp', v);
          }}
          options={[
            { value: 'on', label: t.bypassOn },
            { value: 'off', label: t.bypassOff },
          ]}
        />
      </Field>
      <div className="grid gap-4 lg:grid-cols-2">
        <AmpSchematic state={state} q={q} />
        <Waves state={state} q={q} wave={wave} />
      </div>
      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {status}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={t.statGain}
          value={
            q.saturated
              ? '—'
              : `${q.gain.toFixed(1)} (${(20 * Math.log10(Math.abs(q.gain) || 1)).toFixed(1)} dB)`
          }
        />
        <Stat label={t.statMeasured} value={q.saturated ? '—' : measured.toFixed(1)} />
        <Stat label={t.statIc} value={eng(q.ic, 'A')} />
        <Stat label={t.statVce} value={volts(q.vce, 2)} />
        <Stat label={t.statRe} value={eng(q.re0, 'Ω')} />
        <Stat label={t.statRin} value={eng(q.rin, 'Ω')} />
        <Stat
          label={t.statSwing}
          value={`+${q.swingUp.toFixed(2)} / −${q.swingDown.toFixed(2)} V`}
        />
        <Stat
          label={t.statVb}
          value={`${q.vb.toFixed(2)} / ${q.ve.toFixed(2)} / ${q.vc.toFixed(2)} V`}
        />
      </div>
      <LoadLines state={state} q={q} wave={wave} />
      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-2">
        <Slider
          label={t.sliderVin}
          value={Math.log10(state.vin)}
          min={0}
          max={Math.log10(200)}
          step={0.01}
          formatValue={(v) => `${Math.pow(10, v).toFixed(Math.pow(10, v) < 10 ? 1 : 0)} mV`}
          onChange={(v) => set('vin', Number(Math.pow(10, v).toPrecision(3)))}
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
        {(
          [
            ['r1', 3, Math.log10(470_000)],
            ['r2', 3, 5],
            ['rca', 2, Math.log10(20_000)],
            ['rl', 3, 5],
          ] as const
        ).map(([key, lo, hi]) => (
          <Slider
            key={key}
            label={t.sliders[key]}
            value={Math.log10(state[key])}
            min={lo}
            max={hi}
            step={0.01}
            formatValue={(v) => eng(Math.pow(10, v), 'Ω')}
            onChange={(v) => set(key, Number(Math.pow(10, v).toPrecision(3)))}
          />
        ))}
        <Slider
          label={t.sliders.re}
          value={state.re}
          min={0}
          max={5000}
          step={50}
          formatValue={(v) => eng(v, 'Ω')}
          onChange={(v) => set('re', v)}
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

/** The common-emitter stage with voltage-divider bias, annotated with its DC voltages. */
function AmpSchematic({
  state,
  q,
}: {
  readonly state: ElectronicsState;
  readonly q: AmpResult;
}): React.JSX.Element {
  const t = useMessages().electronics.amp;
  const bypass = state.byp === 'on';

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const rail = 26;
      const gnd = h - 26;
      const cx = w * 0.5;
      const qd = drawNpn(ctx, { x: cx, y: h / 2 + 4 }, theme.active);
      const baseX = qd.base.x - 30;
      const rcX = qd.collector.x;
      // Rail and ground.
      drawWire(
        ctx,
        [
          { x: 30, y: rail },
          { x: w - 30, y: rail },
        ],
        theme.structure
      );
      label(ctx, `VCC ${state.vcc.toFixed(1)} V`, w - 30, rail - 12, theme.input, 'right');
      drawWire(
        ctx,
        [
          { x: 30, y: gnd },
          { x: w - 30, y: gnd },
        ],
        theme.structure
      );
      drawGround(ctx, { x: cx, y: gnd }, theme.structure);
      // Bias divider R1 (rail → base node), R2 (base node → ground).
      const bNode: Point = { x: baseX, y: qd.base.y };
      drawResistor(ctx, {
        from: { x: baseX, y: rail },
        to: bNode,
        color: theme.structure,
        peaks: 4,
        ampPx: 6,
      });
      drawResistor(ctx, {
        from: bNode,
        to: { x: baseX, y: gnd },
        color: theme.structure,
        peaks: 4,
        ampPx: 6,
      });
      drawWire(ctx, [bNode, qd.base], theme.structure);
      drawNodeDot(ctx, { at: bNode, color: theme.structure });
      label(
        ctx,
        `R1 ${eng(state.r1, 'Ω', 2)}`,
        baseX - 10,
        (rail + bNode.y) / 2,
        theme.text,
        'right'
      );
      label(
        ctx,
        `R2 ${eng(state.r2, 'Ω', 2)}`,
        baseX - 10,
        (bNode.y + gnd) / 2,
        theme.text,
        'right'
      );
      // Input: source → C1 → base node.
      const inX = 26;
      drawCapacitor(ctx, { x: inX + 6, y: bNode.y }, { x: baseX, y: bNode.y }, theme.input);
      label(ctx, 'vin', inX, bNode.y - 14, theme.input, 'left');
      label(ctx, 'C1', (inX + baseX) / 2, bNode.y + 18, theme.text, 'center');
      // Collector: RC from rail.
      const cNode: Point = { x: rcX, y: qd.collector.y };
      drawResistor(ctx, {
        from: { x: rcX, y: rail },
        to: cNode,
        color: theme.structure,
        peaks: 4,
        ampPx: 6,
      });
      label(ctx, `RC ${eng(state.rca, 'Ω', 2)}`, rcX + 10, (rail + cNode.y) / 2, theme.text);
      // Output: C2 → RL.
      const outX = Math.min(w - 40, rcX + 110);
      drawCapacitor(ctx, cNode, { x: outX, y: cNode.y }, theme.output);
      drawResistor(ctx, {
        from: { x: outX, y: cNode.y },
        to: { x: outX, y: gnd },
        color: theme.structure,
        peaks: 4,
        ampPx: 6,
      });
      drawNodeDot(ctx, { at: cNode, color: theme.structure });
      label(ctx, 'vout', outX + 8, cNode.y - 12, theme.output, 'left');
      label(
        ctx,
        `RL ${eng(state.rl, 'Ω', 2)}`,
        outX + 8,
        (cNode.y + gnd) / 2 + 10,
        theme.text,
        'left'
      );
      // Emitter: RE to ground, with the bypass capacitor CE alongside.
      const eNode: Point = { x: qd.emitter.x, y: qd.emitter.y + 6 };
      drawWire(ctx, [qd.emitter, eNode], theme.structure);
      drawResistor(ctx, {
        from: eNode,
        to: { x: eNode.x, y: gnd },
        color: theme.structure,
        peaks: 3,
        ampPx: 6,
      });
      const ceX = eNode.x + 46;
      drawWire(ctx, [eNode, { x: ceX, y: eNode.y }], theme.structure, bypass ? 2 : 1);
      drawCapacitor(ctx, { x: ceX, y: eNode.y }, { x: ceX, y: gnd }, theme.active, bypass);
      label(
        ctx,
        `RE ${eng(state.re, 'Ω', 2)}`,
        eNode.x - 10,
        (eNode.y + gnd) / 2,
        theme.text,
        'right'
      );
      label(ctx, bypass ? 'CE' : 'CE ✗', ceX + 14, (eNode.y + gnd) / 2, theme.active, 'left');
      // DC node voltages.
      label(
        ctx,
        `VB ${q.vb.toFixed(2)} V`,
        qd.base.x - 4,
        qd.base.y + 16,
        theme.input,
        'right',
        '10px var(--font-mono, monospace)'
      );
      label(
        ctx,
        `VC ${q.vc.toFixed(2)} V`,
        cNode.x + 8,
        cNode.y + 12,
        theme.input,
        'left',
        '10px var(--font-mono, monospace)'
      );
      label(
        ctx,
        `VE ${q.ve.toFixed(2)} V`,
        eNode.x + 8,
        eNode.y + 14,
        theme.input,
        'left',
        '10px var(--font-mono, monospace)'
      );
    },
    [state, q, bypass]
  );

  return (
    <PlotCanvas
      height={300}
      ariaLabel={t.schematicAria(q.vb.toFixed(2), q.vc.toFixed(2), q.ve.toFixed(2))}
      onDraw={handleDraw}
      deps={[state, q, t]}
    />
  );
}

/** Two cycles: the input (mV) above, the output (V) below, with the ideal linear output dashed. */
function Waves({
  state,
  q,
  wave,
}: {
  readonly state: ElectronicsState;
  readonly q: AmpResult;
  readonly wave: { readonly vin: number[]; readonly vout: number[] };
}): React.JSX.Element {
  const t = useMessages().electronics.amp;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const padL = 52;
      const padR = 10;
      const mid = h * 0.36;
      const panels = [
        {
          top: 18,
          bottom: mid - 10,
          max: state.vin / 1000,
          unit: 'mV',
          scale: 1000,
          title: t.waveIn,
        },
        {
          top: mid + 24,
          bottom: h - 16,
          max: Math.max(Math.abs(q.gain) * (state.vin / 1000), q.swingUp, q.swingDown, 0.01) * 1.1,
          unit: 'V',
          scale: 1,
          title: t.waveOut,
        },
      ];
      const xs = (i: number): number => padL + (i / SAMPLES) * (w - padL - padR);
      panels.forEach((p, k) => {
        const ys = (v: number): number =>
          (p.top + p.bottom) / 2 - (v / p.max) * ((p.bottom - p.top) / 2);
        ctx.save();
        ctx.strokeStyle = theme.structure;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(padL, ys(0));
        ctx.lineTo(w - padR, ys(0));
        ctx.stroke();
        ctx.restore();
        label(
          ctx,
          `${(p.max * p.scale).toPrecision(2)}`,
          padL - 6,
          ys(p.max),
          theme.text,
          'right',
          '10px var(--font-mono, monospace)'
        );
        label(
          ctx,
          `−${(p.max * p.scale).toPrecision(2)}`,
          padL - 6,
          ys(-p.max),
          theme.text,
          'right',
          '10px var(--font-mono, monospace)'
        );
        label(
          ctx,
          p.unit,
          8,
          (p.top + p.bottom) / 2,
          theme.text,
          'left',
          '10px var(--font-mono, monospace)'
        );
        label(
          ctx,
          p.title,
          padL + 4,
          p.top - 8,
          k === 0 ? theme.input : theme.output,
          'left',
          '11px var(--font-mono, monospace)'
        );
        const series = (
          values: number[],
          color: string,
          width: number,
          dash: number[] = []
        ): void => {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.setLineDash(dash);
          ctx.beginPath();
          values.forEach((v, i) => {
            const y = Math.max(p.top - 4, Math.min(p.bottom + 4, ys(v)));
            if (i === 0) ctx.moveTo(xs(i), y);
            else ctx.lineTo(xs(i), y);
          });
          ctx.stroke();
          ctx.restore();
        };
        if (k === 0) series(wave.vin, theme.input, 2);
        else {
          if (!q.saturated)
            series(
              wave.vin.map((v) => v * q.gain),
              theme.structure,
              1.4,
              [5, 4]
            );
          // Clipping limits.
          ctx.save();
          ctx.strokeStyle = theme.danger;
          ctx.globalAlpha = 0.5;
          ctx.setLineDash([2, 3]);
          for (const lim of [q.swingUp, -q.swingDown]) {
            if (Math.abs(lim) <= p.max) {
              ctx.beginPath();
              ctx.moveTo(padL, ys(lim));
              ctx.lineTo(w - padR, ys(lim));
              ctx.stroke();
            }
          }
          ctx.restore();
          series(wave.vout, theme.output, 2.4);
        }
      });
    },
    [state.vin, q, wave, t]
  );

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs text-[var(--foreground)]/70">{t.waveTitle}</figcaption>
      <PlotCanvas
        height={300}
        ariaLabel={t.waveAria(state.vin.toFixed(0), q.gain.toFixed(1))}
        onDraw={handleDraw}
        deps={[state.vin, q, wave, t]}
      />
    </figure>
  );
}

/**
 * Output characteristics with the DC load line (slope −1/(RC + RE)) and
 * the steeper AC load line through Q (slope −1/(RC ∥ RL)). The thick
 * segment is where the signal actually swings the operating point; it hits
 * cutoff at the bottom and saturation at the left.
 */
function LoadLines({
  state,
  q,
  wave,
}: {
  readonly state: ElectronicsState;
  readonly q: AmpResult;
  readonly wave: { readonly vout: number[] };
}): React.JSX.Element {
  const t = useMessages().electronics.amp;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const padL = 50;
      const padR = 14;
      const padT = 14;
      const padB = 30;
      const vMax = state.vcc * 1.05;
      const icDcMax = state.vcc / (state.rca + state.re);
      const icAcMax = q.ic + q.vce / q.rac;
      const icMax = Math.max(icDcMax, Math.min(icAcMax, icDcMax * 3), q.ic * 2) * 1.1;
      const xs = (v: number): number => padL + (v / vMax) * (w - padL - padR);
      const ys = (i: number): number => h - padB - (i / icMax) * (h - padT - padB);

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
        eng(icMax / 1.1, 'A', 2),
        padL - 4,
        ys(icMax / 1.1),
        theme.text,
        'right',
        '10px var(--font-mono, monospace)'
      );

      // Device curves around the Q point.
      const ibq = q.ib;
      for (const f of [0.25, 0.5, 1, 1.5, 2]) {
        ctx.save();
        ctx.strokeStyle = f === 1 ? theme.active : theme.structure;
        ctx.globalAlpha = f === 1 ? 0.9 : 0.5;
        ctx.lineWidth = f === 1 ? 1.8 : 1;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const v = (vMax * i) / 120;
          const y = Math.max(padT, ys(collectorCurrent(state.beta, ibq * f, v)));
          if (i === 0) ctx.moveTo(xs(v), y);
          else ctx.lineTo(xs(v), y);
        }
        ctx.stroke();
        ctx.restore();
      }
      const line = (
        pts: [number, number][],
        color: string,
        width: number,
        dash: number[] = []
      ): void => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        pts.forEach(([v, i], k) => {
          const y = Math.max(padT, ys(i));
          if (k === 0) ctx.moveTo(xs(v), y);
          else ctx.lineTo(xs(v), y);
        });
        ctx.stroke();
        ctx.restore();
      };
      // DC load line: IC = (VCC − VCE)/(RC + RE).
      line(
        [
          [0, icDcMax],
          [state.vcc, 0],
        ],
        theme.input,
        1.6,
        [6, 4]
      );
      label(
        ctx,
        t.dcLine,
        xs(state.vcc * 0.7),
        ys(icDcMax * 0.3) - 12,
        theme.input,
        'left',
        '10px var(--font-mono, monospace)'
      );
      if (!q.saturated) {
        // AC load line through Q: Δic = −Δvce / rac, from saturation to cutoff.
        const vceCut = q.vce + q.ic * q.rac;
        line(
          [
            [0, icAcMax],
            [vceCut, 0],
          ],
          theme.output,
          1.6
        );
        label(
          ctx,
          t.acLine,
          xs(Math.min(vceCut, vMax) * 0.15),
          ys(icAcMax * 0.85),
          theme.output,
          'left',
          '10px var(--font-mono, monospace)'
        );
        // The swing actually used.
        const lo = Math.min(...wave.vout);
        const hi = Math.max(...wave.vout);
        line(
          [
            [q.vce + lo, q.ic - lo / q.rac],
            [q.vce + hi, q.ic - hi / q.rac],
          ],
          theme.output,
          6
        );
      }
      ctx.save();
      ctx.fillStyle = theme.active;
      ctx.strokeStyle = theme.surface;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xs(q.vce), ys(q.ic), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      label(
        ctx,
        'Q',
        xs(q.vce) + 9,
        ys(q.ic) - 9,
        theme.active,
        'left',
        'bold 11px var(--font-mono, monospace)'
      );
      label(
        ctx,
        `VCE,sat ${VCE_SAT} V`,
        xs(VCE_SAT) + 4,
        padT + 6,
        theme.text,
        'left',
        '9px var(--font-mono, monospace)'
      );
    },
    [state.vcc, state.rca, state.re, state.beta, q, wave, t]
  );

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs text-[var(--foreground)]/70">{t.loadTitle}</figcaption>
      <PlotCanvas
        height={260}
        ariaLabel={t.loadAria(q.vce.toFixed(2), eng(q.ic, 'A'))}
        onDraw={handleDraw}
        deps={[state.vcc, state.rca, state.re, state.beta, q, wave, t]}
      />
    </figure>
  );
}
