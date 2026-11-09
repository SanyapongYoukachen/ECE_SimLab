'use client';

import { useCallback, useMemo } from 'react';
import {
  drawBattery,
  drawNodeDot,
  drawResistor,
  drawWire,
  type PlotTheme,
  type Point,
} from '@/lib/plot';
import { solveTwoSource, type TwoSourceResult } from '@/lib/circuits/analysis';
import type { CircuitState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import { Field, PlotCanvas, SegmentedControl, Slider } from '@/components/ui';
import { branchArrow, drawGround, drawLoopArrow, label } from './draw';
import { formatMilliamps, formatPower, formatResistance, formatVoltage } from './format';
import { MAX_RESISTANCE, MAX_VOLTAGE, MIN_RESISTANCE, MIN_VOLTAGE } from './constants';
import { Stat } from './Stat';

type Method = CircuitState['method'];

interface Props {
  readonly state: CircuitState;
  readonly setState: (updater: (prev: CircuitState) => CircuitState) => void;
}

const SCHEMATIC_HEIGHT = 260;

function n(x: number, digits = 0): string {
  return x.toFixed(digits).replace('-', '−');
}

/** Signed with an explicit operator: " + 470·I2", " − 470·I2". */
function term(coef: number, name: string): string {
  return `${coef < 0 ? ' − ' : ' + '}${n(Math.abs(coef))}·${name}`;
}

/** Conductance in mS with three decimals: 1/220 Ω = 4.545 mS. */
function ms(ohms: number): string {
  return (1000 / ohms).toFixed(3);
}

/**
 * Mesh and nodal analysis of the same two-source circuit. Mesh writes KVL
 * round each window (two unknown loop currents); nodal writes KCL at the one
 * non-ground node (one unknown voltage). Both land on the same branch
 * currents — the lesson is choosing the method with fewer equations.
 */
export function MeshNodeSection({ state, setState }: Props): React.JSX.Element {
  const t = useMessages().circuits.mesh;
  const { voltage: v1, v2, r1, r2, r3 } = state;
  const res = useMemo(() => solveTwoSource(v1, v2, r1, r2, r3), [v1, v2, r1, r2, r3]);
  const method: Method = state.method;
  const [[a11, a12], [a21, a22]] = res.meshMatrix;

  const sourceState = (p: number): string => (p >= 0 ? t.delivers : t.absorbs);

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>
      <Field label={t.methodLabel}>
        <SegmentedControl
          label={t.methodLabel}
          value={method}
          onChange={(m) => {
            logEvent('circuits', 'method_changed', { method: m });
            setState((prev) => ({ ...prev, method: m }));
          }}
          options={[
            { value: 'mesh', label: t.methods.mesh },
            { value: 'node', label: t.methods.node },
          ]}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <MeshSchematic state={state} res={res} />
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[var(--foreground)]/70">
            {method === 'mesh' ? t.meshHow : t.nodeHow}
          </div>
          <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-[12.5px] leading-relaxed text-[var(--foreground)]">
            {method === 'mesh'
              ? [
                  `${t.loop1}: (R1+R2)·I1 − R2·I2 = V1`,
                  `   ${n(a11)}·I1${term(a12, 'I2')} = ${n(res.meshRhs[0], 2)}`,
                  `${t.loop2}: −R2·I1 + (R2+R3)·I2 = −V2`,
                  `   ${n(a21)}·I1${term(a22, 'I2')} = ${n(res.meshRhs[1], 2)}`,
                  '',
                  `⎡${n(a11).padStart(6)} ${n(a12).padStart(6)} ⎤ ⎡I1⎤   ⎡${n(res.meshRhs[0], 2).padStart(6)}⎤`,
                  `⎣${n(a21).padStart(6)} ${n(a22).padStart(6)} ⎦ ⎣I2⎦ = ⎣${n(res.meshRhs[1], 2).padStart(6)}⎦`,
                  '',
                  `Δ = ${n(a11)}·${n(a22)} − (${n(a12)})·(${n(a21)}) = ${n(res.meshDet)} Ω²`,
                  `I1 = ${formatMilliamps(res.i1)}   I2 = ${formatMilliamps(res.i2)}`,
                  `${t.branchR2}: I1 − I2 = ${formatMilliamps(res.i1 - res.i2)}`,
                ].join('\n')
              : [
                  `${t.kcl}:`,
                  '  (VA − V1)/R1 + VA/R2 + (VA − V2)/R3 = 0',
                  '  VA·(1/R1 + 1/R2 + 1/R3) = V1/R1 + V2/R3',
                  `  VA·(${ms(r1)} + ${ms(r2)} + ${ms(r3)}) mS`,
                  `     = ${((1000 * v1) / r1).toFixed(3)} + ${((1000 * v2) / r3).toFixed(3)} mA`,
                  `  VA·${(res.nodeG * 1000).toFixed(3)} mS = ${(res.nodeIs * 1000).toFixed(3)} mA`,
                  `  VA = ${formatVoltage(res.va)}`,
                  '',
                  `I_R1 = (V1 − VA)/R1 = ${formatMilliamps(res.iR1)}`,
                  `I_R2 = VA/R2        = ${formatMilliamps(res.iR2)}`,
                  `I_R3 = (VA − V2)/R3 = ${formatMilliamps(res.iR3)}`,
                ].join('\n')}
          </pre>
          <p className="text-xs text-[var(--foreground)]/65">
            {method === 'mesh' ? t.meshSign : t.nodeSign}
          </p>
        </div>
      </div>

      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {t.compare(formatVoltage(res.va), formatMilliamps(res.iR2))}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statVa} value={formatVoltage(res.va)} />
        <Stat label="I_R1 (V1 → A)" value={formatMilliamps(res.iR1)} />
        <Stat label="I_R2 (A → ⏚)" value={formatMilliamps(res.iR2)} />
        <Stat label="I_R3 (A → V2)" value={formatMilliamps(res.iR3)} />
        <Stat label={t.statI1} value={formatMilliamps(res.i1)} />
        <Stat label={t.statI2} value={formatMilliamps(res.i2)} />
        <Stat label={`V1 ${sourceState(res.pV1)}`} value={formatPower(Math.abs(res.pV1))} />
        <Stat label={`V2 ${sourceState(res.pV2)}`} value={formatPower(Math.abs(res.pV2))} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.sliderV1}
          value={v1}
          min={MIN_VOLTAGE}
          max={MAX_VOLTAGE}
          step={0.5}
          formatValue={(x) => `${x.toFixed(1)} V`}
          onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
        />
        <Slider
          label={t.sliderV2}
          value={v2}
          min={MIN_VOLTAGE}
          max={MAX_VOLTAGE}
          step={0.5}
          formatValue={(x) => `${x.toFixed(1)} V`}
          onChange={(value) => setState((prev) => ({ ...prev, v2: value }))}
        />
        {(['r1', 'r2', 'r3'] as const).map((key) => (
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
      </div>
    </div>
  );
}

function MeshSchematic({
  state,
  res,
}: {
  readonly state: CircuitState;
  readonly res: TwoSourceResult;
}): React.JSX.Element {
  const t = useMessages().circuits.mesh;
  const method: Method = state.method;

  const handleDraw = useCallback(
    (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, theme: PlotTheme) => {
      const { width: w, height: h } = size;
      ctx.clearRect(0, 0, w, h);
      const top = 44;
      const bottom = h - 56;
      const left = 58;
      const right = w - 58;
      const xa = (left + right) / 2;
      const A: Point = { x: xa, y: top };
      const G: Point = { x: xa, y: bottom };

      drawBattery(ctx, {
        from: { x: left, y: top },
        to: { x: left, y: bottom },
        color: theme.input,
      });
      drawBattery(ctx, {
        from: { x: right, y: top },
        to: { x: right, y: bottom },
        color: theme.input,
      });
      drawResistor(ctx, { from: { x: left, y: top }, to: A, color: theme.active });
      drawResistor(ctx, { from: A, to: { x: right, y: top }, color: theme.active });
      drawResistor(ctx, { from: A, to: G, color: theme.active });
      drawWire(
        ctx,
        [
          { x: left, y: bottom },
          { x: right, y: bottom },
        ],
        theme.structure
      );
      drawNodeDot(ctx, { at: G, color: theme.structure });

      const mid = (top + bottom) / 2;
      label(ctx, `V1 ${state.voltage.toFixed(1)}V`, left - 10, mid + 22, theme.input, 'right');
      label(ctx, `V2 ${state.v2.toFixed(1)}V`, right + 10, mid + 22, theme.input);
      label(ctx, '+', left - 14, mid - 8, theme.text, 'center', '13px sans-serif');
      label(ctx, '+', right + 14, mid - 8, theme.text, 'center', '13px sans-serif');
      label(
        ctx,
        `R1 ${formatResistance(state.r1)}`,
        (left + xa) / 2,
        top - 18,
        theme.active,
        'center'
      );
      label(
        ctx,
        `R3 ${formatResistance(state.r3)}`,
        (xa + right) / 2,
        top - 18,
        theme.active,
        'center'
      );
      label(ctx, `R2 ${formatResistance(state.r2)}`, xa + 14, mid + 26, theme.active);

      if (method === 'mesh') {
        const radius = Math.min(26, (xa - left) / 4);
        const c1 = { x: (left + xa) / 2, y: mid + 4 };
        const c2 = { x: (xa + right) / 2, y: mid + 4 };
        drawLoopArrow(ctx, c1, radius, res.i1 >= 0, theme.output);
        drawLoopArrow(ctx, c2, radius, res.i2 >= 0, theme.output);
        label(
          ctx,
          'I1',
          c1.x,
          c1.y,
          theme.output,
          'center',
          'bold 12px var(--font-mono, monospace)'
        );
        label(
          ctx,
          'I2',
          c2.x,
          c2.y,
          theme.output,
          'center',
          'bold 12px var(--font-mono, monospace)'
        );
        label(ctx, formatMilliamps(res.i1), c1.x, bottom + 18, theme.output, 'center');
        label(ctx, formatMilliamps(res.i2), c2.x, bottom + 18, theme.output, 'center');
        label(ctx, t.clockwise, w / 2, h - 12, theme.text, 'center');
      } else {
        drawNodeDot(ctx, { at: A, color: theme.output, radius: 5 });
        label(
          ctx,
          `VA = ${formatVoltage(res.va)}`,
          xa,
          top - 32,
          theme.output,
          'center',
          'bold 12px var(--font-mono, monospace)'
        );
        drawGround(ctx, { x: xa, y: bottom }, theme.structure);
        label(ctx, t.reference, xa + 16, bottom + 14, theme.text);
        // Branch currents, each drawn the way it actually flows.
        branchArrow(ctx, { x: (left + xa) / 2, y: top + 16 }, true, res.iR1, theme.output);
        branchArrow(ctx, { x: xa - 14, y: mid - 26 }, false, res.iR2, theme.output);
        branchArrow(ctx, { x: (xa + right) / 2, y: top + 16 }, true, res.iR3, theme.output);
        label(
          ctx,
          formatMilliamps(Math.abs(res.iR1)),
          (left + xa) / 2,
          top + 32,
          theme.output,
          'center'
        );
        label(ctx, formatMilliamps(Math.abs(res.iR2)), xa - 22, mid - 26, theme.output, 'right');
        label(
          ctx,
          formatMilliamps(Math.abs(res.iR3)),
          (xa + right) / 2,
          top + 32,
          theme.output,
          'center'
        );
      }
    },
    [state.voltage, state.v2, state.r1, state.r2, state.r3, method, res, t]
  );

  return (
    <PlotCanvas
      height={SCHEMATIC_HEIGHT}
      ariaLabel={t.schematicAria(
        formatVoltage(res.va),
        formatMilliamps(res.i1),
        formatMilliamps(res.i2)
      )}
      onDraw={handleDraw}
      deps={[state.voltage, state.v2, state.r1, state.r2, state.r3, method, res, t]}
    />
  );
}
