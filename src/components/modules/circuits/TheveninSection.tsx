'use client';

import { useCallback, useMemo } from 'react';
import {
  drawAxes,
  drawBattery,
  drawLine,
  drawMarker,
  drawNodeDot,
  drawResistor,
  drawVerticalLine,
  drawWire,
  linearScale,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { powerSweep, solveThevenin, type TheveninResult } from '@/lib/circuits/analysis';
import type { CircuitState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import { Field, PlotCanvas, SegmentedControl, Slider } from '@/components/ui';
import { branchArrow, drawCurrentSource, drawDashedBox, drawTerminal, label } from './draw';
import {
  formatMilliamps,
  formatOhmsPrecise,
  formatPower,
  formatResistance,
  formatVoltage,
} from './format';
import { MAX_RESISTANCE, MAX_VOLTAGE, MIN_RESISTANCE, MIN_VOLTAGE } from './constants';
import { Stat } from './Stat';

type Equiv = CircuitState['equiv'];

interface Props {
  readonly state: CircuitState;
  readonly setState: (updater: (prev: CircuitState) => CircuitState) => void;
}

const SCHEMATIC_HEIGHT = 250;
const PLOT_HEIGHT = 190;

function compactR(ohms: number): string {
  return ohms >= 1000 ? `${Number((ohms / 1000).toFixed(2))}k` : `${Number(ohms.toFixed(1))}`;
}

/**
 * Thévenin and Norton: any linear two-terminal network looks, to its load,
 * like one source and one resistor. The schematic swaps between the network
 * as built and its two equivalents while the load current stays put; the
 * plots show the terminal line the equivalent defines and the power it can
 * deliver.
 */
export function TheveninSection({ state, setState }: Props): React.JSX.Element {
  const t = useMessages().circuits.thevenin;
  const th = useMemo(
    () => solveThevenin(state.voltage, state.r1, state.r2, state.r3, state.rl),
    [state.voltage, state.r1, state.r2, state.r3, state.rl]
  );
  const v = state.voltage;

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <Field label={t.viewLabel}>
        <SegmentedControl
          label={t.viewLabel}
          value={state.equiv}
          onChange={(equiv) => {
            logEvent('circuits', 'equivalent_changed', { equiv });
            setState((prev) => ({ ...prev, equiv }));
          }}
          options={(['original', 'thevenin', 'norton'] as const).map((value) => ({
            value,
            label: t.views[value],
          }))}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <TheveninSchematic state={state} th={th} />
        <ol className="flex flex-col gap-2 text-sm">
          <Step n={1} title={t.step1} tone="input">
            Vth = V·R2/(R1+R2) = {v.toFixed(2)}·{compactR(state.r2)}/{compactR(state.r1 + state.r2)}{' '}
            = <b>{formatVoltage(th.vth)}</b>
          </Step>
          <Step n={2} title={t.step2} tone="active">
            Rth = R1·R2/(R1+R2) + R3 = {formatOhmsPrecise(th.r12)} + {formatResistance(state.r3)} ={' '}
            <b>{formatOhmsPrecise(th.rth)}</b>
          </Step>
          <Step n={3} title={t.step3} tone="input">
            IN = Vth/Rth = <b>{formatMilliamps(th.iN)}</b>
          </Step>
          <Step n={4} title={t.step4} tone="output">
            IL = Vth/(Rth+RL) = <b>{formatMilliamps(th.il)}</b>, VL = {formatVoltage(th.vl)}
          </Step>
        </ol>
      </div>

      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {t.sameLoad(formatMilliamps(th.il))}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statVth} value={formatVoltage(th.vth)} />
        <Stat label={t.statRth} value={formatOhmsPrecise(th.rth)} />
        <Stat label={t.statIn} value={formatMilliamps(th.iN)} />
        <Stat label={t.statIl} value={formatMilliamps(th.il)} />
        <Stat label={t.statVl} value={formatVoltage(th.vl)} />
        <Stat label={t.statPl} value={formatPower(th.pl)} />
        <Stat label={t.statPmax} value={formatPower(th.pmax)} />
        <Stat
          label={t.statEff}
          value={`${((100 * state.rl) / (th.rth + state.rl)).toFixed(1)} %`}
        />
      </div>

      <TheveninPlots th={th} rl={state.rl} />

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.sliderV}
          value={state.voltage}
          min={MIN_VOLTAGE}
          max={MAX_VOLTAGE}
          step={0.5}
          formatValue={(x) => `${x.toFixed(1)} V`}
          onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
        />
        {(['r1', 'r2', 'r3', 'rl'] as const).map((key) => (
          <Slider
            key={key}
            label={t.sliders[key]}
            value={state[key]}
            min={MIN_RESISTANCE}
            max={MAX_RESISTANCE}
            step={10}
            formatValue={formatResistance}
            onChange={(value) => setState((prev) => ({ ...prev, [key]: value }))}
          />
        ))}
        <div>
          <button
            type="button"
            onClick={() => {
              logEvent('circuits', 'matched_load', { rth: th.rth });
              setState((prev) => ({
                ...prev,
                rl: Math.min(MAX_RESISTANCE, Math.max(MIN_RESISTANCE, Math.round(th.rth))),
              }));
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
          >
            {t.matchLoad(formatOhmsPrecise(th.rth))}
          </button>
        </div>
      </div>
    </div>
  );
}

const TONE = {
  input: 'var(--plot-input)',
  active: 'var(--plot-active)',
  output: 'var(--plot-output)',
} as const;

function Step({
  n,
  title,
  tone,
  children,
}: {
  readonly n: number;
  readonly title: string;
  readonly tone: keyof typeof TONE;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <li
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
      style={{ borderLeft: `3px solid ${TONE[tone]}` }}
    >
      <div className="text-xs text-[var(--foreground)]/65">
        {n}. {title}
      </div>
      <div className="font-mono tabular-nums text-[13px] text-[var(--foreground)]">{children}</div>
    </li>
  );
}

function TheveninSchematic({
  state,
  th,
}: {
  readonly state: CircuitState;
  readonly th: TheveninResult;
}): React.JSX.Element {
  const t = useMessages().circuits.thevenin;
  const equiv: Equiv = state.equiv;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const top = 62;
      const bottom = h - 34;
      const left = 44;
      const xT = Math.max(left + 150, w - 110); // terminals a, b
      const xL = xT + Math.min(70, (w - xT) * 0.65); // the load

      const a: Point = { x: xT, y: top };
      const b: Point = { x: xT, y: bottom };
      const loadTop: Point = { x: xL, y: top };
      const loadBottom: Point = { x: xL, y: bottom };

      // Box around whatever the load sees.
      drawDashedBox(ctx, left - 32, top - 36, xT, bottom + 16, theme.structure);
      label(ctx, t.boxTitle[equiv], left - 28, top - 48, theme.text);

      if (equiv === 'original') {
        const x1 = left + (xT - left) * 0.45;
        const nodeX: Point = { x: x1, y: top };
        drawBattery(ctx, {
          from: { x: left, y: top },
          to: { x: left, y: bottom },
          color: theme.input,
        });
        drawResistor(ctx, { from: { x: left, y: top }, to: nodeX, color: theme.active });
        drawResistor(ctx, { from: nodeX, to: { x: x1, y: bottom }, color: theme.active });
        drawResistor(ctx, { from: nodeX, to: a, color: theme.active });
        drawWire(ctx, [{ x: left, y: bottom }, b], theme.structure);
        drawNodeDot(ctx, { at: nodeX, color: theme.structure });
        drawNodeDot(ctx, { at: { x: x1, y: bottom }, color: theme.structure });
        label(
          ctx,
          `V ${state.voltage.toFixed(1)}V`,
          left + 20,
          (top + bottom) / 2 + 22,
          theme.input
        );
        label(ctx, `R1 ${compactR(state.r1)}Ω`, (left + x1) / 2, top - 16, theme.active, 'center');
        label(ctx, `R2 ${compactR(state.r2)}Ω`, x1 + 14, (top + bottom) / 2, theme.active);
        label(ctx, `R3 ${compactR(state.r3)}Ω`, (x1 + xT) / 2, top - 16, theme.active, 'center');
      } else if (equiv === 'thevenin') {
        drawBattery(ctx, {
          from: { x: left, y: top },
          to: { x: left, y: bottom },
          color: theme.input,
        });
        drawResistor(ctx, { from: { x: left, y: top }, to: a, color: theme.active });
        drawWire(ctx, [{ x: left, y: bottom }, b], theme.structure);
        label(ctx, `Vth ${formatVoltage(th.vth)}`, left + 20, (top + bottom) / 2 + 22, theme.input);
        label(
          ctx,
          `Rth ${formatOhmsPrecise(th.rth)}`,
          (left + xT) / 2,
          top - 16,
          theme.active,
          'center'
        );
      } else {
        const xr = left + (xT - left) * 0.5;
        drawCurrentSource(ctx, { x: left, y: bottom }, { x: left, y: top }, theme.input);
        drawWire(ctx, [{ x: left, y: top }, a], theme.structure);
        drawWire(ctx, [{ x: left, y: bottom }, b], theme.structure);
        drawResistor(ctx, {
          from: { x: xr, y: top },
          to: { x: xr, y: bottom },
          color: theme.active,
        });
        drawNodeDot(ctx, { at: { x: xr, y: top }, color: theme.structure });
        drawNodeDot(ctx, { at: { x: xr, y: bottom }, color: theme.structure });
        label(ctx, `IN ${formatMilliamps(th.iN)}`, left + 20, (top + bottom) / 2 + 30, theme.input);
        label(ctx, `Rth ${formatOhmsPrecise(th.rth)}`, xr + 14, (top + bottom) / 2, theme.active);
      }

      // Terminals and the load — identical in every view.
      drawWire(ctx, [a, loadTop], theme.structure);
      drawWire(ctx, [b, loadBottom], theme.structure);
      drawResistor(ctx, { from: loadTop, to: loadBottom, color: theme.output });
      drawTerminal(ctx, a, theme.text, theme.surface);
      drawTerminal(ctx, b, theme.text, theme.surface);
      label(ctx, 'a', xT, top - 14, theme.text, 'center');
      label(ctx, 'b', xT, bottom + 28, theme.text, 'center');
      label(ctx, 'RL', xL + 12, (top + bottom) / 2 - 10, theme.output);
      label(ctx, compactR(state.rl) + 'Ω', xL + 12, (top + bottom) / 2 + 6, theme.output);
      branchArrow(ctx, { x: (xT + xL) / 2, y: top }, true, th.il, theme.output);
      label(ctx, `IL ${formatMilliamps(th.il)}`, xL + 4, top - 16, theme.output, 'right');
    },
    [state.voltage, state.r1, state.r2, state.r3, state.rl, equiv, th, t]
  );

  return (
    <PlotCanvas
      height={SCHEMATIC_HEIGHT}
      ariaLabel={t.schematicAria(
        t.views[equiv],
        formatVoltage(th.vth),
        formatOhmsPrecise(th.rth),
        formatMilliamps(th.il)
      )}
      onDraw={handleDraw}
      deps={[state.voltage, state.r1, state.r2, state.r3, state.rl, equiv, t]}
    />
  );
}

const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 18;

function TheveninPlots({
  th,
  rl,
}: {
  readonly th: TheveninResult;
  readonly rl: number;
}): React.JSX.Element {
  const t = useMessages().circuits.thevenin;

  // Terminal line V = Vth − I·Rth from open circuit to short circuit, and the load line V = I·RL.
  const drawIv = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const iMax = Math.max(th.iN, 1e-6) * 1000 * 1.08;
      const vMax = Math.max(th.vth, 0.1) * 1.12;
      const xScale = linearScale([0, iMax], [PAD_LEFT, size.width - PAD_RIGHT]);
      const yScale = linearScale([0, vMax], [size.height - PAD_BOTTOM, PAD_TOP]);
      const area = { width: size.width, height: size.height, xScale, yScale };
      drawAxes(ctx, {
        ...area,
        structureColor: theme.structure,
        textColor: theme.text,
        xTickFormat: (x) => `${Number(x.toFixed(1))}`,
        yTickFormat: (y) => `${Number(y.toFixed(1))}`,
      });
      drawLine(ctx, {
        ...area,
        xs: [0, th.iN * 1000],
        ys: [th.vth, 0],
        color: theme.input,
        lineWidth: 2.2,
      });
      const loadEnd = Math.min(iMax, (vMax / rl) * 1000);
      drawLine(ctx, {
        ...area,
        xs: [0, loadEnd],
        ys: [0, (loadEnd / 1000) * rl],
        color: theme.output,
        lineWidth: 1.6,
        dash: [5, 4],
      });
      drawMarker(ctx, { ...area, x: th.il * 1000, y: th.vl, color: theme.output, radius: 5.5 });
      label(
        ctx,
        `Vth ${formatVoltage(th.vth)}`,
        PAD_LEFT + 6,
        yScale.toPixel(th.vth) - 9,
        theme.input
      );
      label(
        ctx,
        `IN ${formatMilliamps(th.iN)}`,
        xScale.toPixel(th.iN * 1000) - 4,
        size.height - PAD_BOTTOM - 10,
        theme.input,
        'right'
      );
      label(
        ctx,
        t.loadLine,
        xScale.toPixel(loadEnd) - 4,
        yScale.toPixel((loadEnd / 1000) * rl) + 12,
        theme.output,
        'right'
      );
    },
    [th, rl, t]
  );

  const sweep = useMemo(() => powerSweep(th, 10, Math.max(2200, th.rth * 2)), [th]);

  const drawPower = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      ctx.clearRect(0, 0, size.width, size.height);
      const pMax = Math.max(th.pmax, 1e-9) * 1000 * 1.15;
      const xScale = linearScale(
        [0, sweep.rl[sweep.rl.length - 1]],
        [PAD_LEFT, size.width - PAD_RIGHT]
      );
      const yScale = linearScale([0, pMax], [size.height - PAD_BOTTOM, PAD_TOP]);
      const area = { width: size.width, height: size.height, xScale, yScale };
      drawAxes(ctx, {
        ...area,
        structureColor: theme.structure,
        textColor: theme.text,
        xTickFormat: (x) => compactR(x),
        yTickFormat: (y) => `${Number(y.toFixed(1))}`,
      });
      drawVerticalLine(ctx, { ...area, x: th.rth, color: theme.active });
      drawLine(ctx, {
        ...area,
        xs: sweep.rl,
        ys: sweep.p.map((p) => p * 1000),
        color: theme.output,
        lineWidth: 2.2,
      });
      drawMarker(ctx, { ...area, x: rl, y: th.pl * 1000, color: theme.output, radius: 5.5 });
      label(ctx, t.matched, xScale.toPixel(th.rth) + 6, PAD_TOP + 4, theme.active);
    },
    [th, rl, sweep, t]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <figure className="flex flex-col gap-1">
        <figcaption className="text-xs text-[var(--foreground)]/70">{t.ivTitle}</figcaption>
        <PlotCanvas
          height={PLOT_HEIGHT}
          ariaLabel={t.ivAria(
            formatVoltage(th.vth),
            formatMilliamps(th.iN),
            formatMilliamps(th.il)
          )}
          onDraw={drawIv}
          deps={[th, rl, t]}
        />
      </figure>
      <figure className="flex flex-col gap-1">
        <figcaption className="text-xs text-[var(--foreground)]/70">{t.powerTitle}</figcaption>
        <PlotCanvas
          height={PLOT_HEIGHT}
          ariaLabel={t.powerAria(
            formatOhmsPrecise(th.rth),
            formatPower(th.pmax),
            formatPower(th.pl)
          )}
          onDraw={drawPower}
          deps={[th, rl, sweep, t]}
        />
      </figure>
    </div>
  );
}
