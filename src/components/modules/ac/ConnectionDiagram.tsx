import type { Connection, Phase } from '@/lib/circuits/generator';
import { PHASE_COLOR } from './phaseColors';

interface Props {
  readonly connection: Connection;
  readonly labels: {
    readonly vPhase: string;
    readonly vLine: string;
    readonly iLine: string;
    readonly iPhase: string;
    readonly iNeutral: string;
    readonly neutral: string;
    readonly load: string;
  };
  readonly ariaLabel: string;
}

const LINES: readonly { k: Phase; y: number }[] = [
  { k: 'a', y: 30 },
  { k: 'b', y: 90 },
  { k: 'c', y: 150 },
];

const STAR = { x: 250, y: 90 };
// Triangle with b as its left vertex, so each line reaches its node without crossing a load.
const DELTA: Readonly<Record<Phase, { x: number; y: number }>> = {
  a: { x: 270, y: 30 },
  b: { x: 200, y: 90 },
  c: { x: 270, y: 150 },
};

/** An IEC resistor box on a straight lead between two points. */
function Box({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly color: string;
}): React.JSX.Element {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--plot-structure)" strokeWidth={2} />
      <rect
        x={mx - 16}
        y={my - 6}
        width={32}
        height={12}
        fill="var(--surface)"
        stroke={color}
        strokeWidth={2}
        transform={`rotate(${angle} ${mx} ${my})`}
      />
    </g>
  );
}

/**
 * How the three loads connect to lines a, b, c. Star (Y): each load from a
 * line to a common star point tied to neutral — it sees the phase voltage,
 * and the line current is its own current. Delta (Δ): each load between two
 * lines — it sees the line voltage, and each line current is the difference
 * of two load currents.
 */
export function ConnectionDiagram({ connection, labels, ariaLabel }: Props): React.JSX.Element {
  const wye = connection === 'wye';
  return (
    <svg viewBox="0 0 340 205" className="w-full" role="img" aria-label={ariaLabel}>
      {LINES.map(({ k, y }) => (
        <g key={k}>
          <text x={4} y={y + 4} fontSize={12} fontWeight="bold" fill={PHASE_COLOR[k]}>
            {k.toUpperCase()}
          </text>
          <line
            x1={18}
            y1={y}
            x2={wye ? 170 : DELTA[k].x}
            y2={y}
            stroke={PHASE_COLOR[k]}
            strokeWidth={2.5}
          />
          <polygon points={`120,${y - 4} 128,${y} 120,${y + 4}`} fill={PHASE_COLOR[k]} />
        </g>
      ))}
      <text x={110} y={22} fontSize={10} fill="var(--plot-text)" textAnchor="end">
        {labels.iLine}
      </text>

      {wye ? (
        <>
          {LINES.map(({ k, y }) => (
            <Box key={k} x1={170} y1={y} x2={STAR.x} y2={STAR.y} color={PHASE_COLOR[k]} />
          ))}
          <circle cx={STAR.x} cy={STAR.y} r={4} fill="var(--plot-text)" />
          <line
            x1={STAR.x}
            y1={STAR.y}
            x2={STAR.x}
            y2={190}
            stroke="var(--plot-structure)"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <line
            x1={18}
            y1={190}
            x2={STAR.x}
            y2={190}
            stroke="var(--plot-structure)"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <text x={4} y={194} fontSize={12} fontWeight="bold" fill="var(--plot-text)">
            N
          </text>
          <text x={STAR.x + 8} y={184} fontSize={10} fill="var(--plot-text)">
            {labels.iNeutral}
          </text>
          <text x={STAR.x + 10} y={STAR.y + 4} fontSize={10} fill="var(--plot-text)">
            {labels.neutral}
          </text>
          {/* Phase voltage: line a to neutral */}
          <line
            x1={60}
            y1={34}
            x2={60}
            y2={186}
            stroke="var(--plot-text)"
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <text x={64} y={120} fontSize={10} fill="var(--plot-text)">
            {labels.vPhase}
          </text>
        </>
      ) : (
        <>
          <Box x1={DELTA.a.x} y1={DELTA.a.y} x2={DELTA.b.x} y2={DELTA.b.y} color={PHASE_COLOR.a} />
          <Box x1={DELTA.b.x} y1={DELTA.b.y} x2={DELTA.c.x} y2={DELTA.c.y} color={PHASE_COLOR.b} />
          <Box x1={DELTA.c.x} y1={DELTA.c.y} x2={DELTA.a.x} y2={DELTA.a.y} color={PHASE_COLOR.c} />
          {(['a', 'b', 'c'] as const).map((k) => (
            <circle key={k} cx={DELTA[k].x} cy={DELTA[k].y} r={3.5} fill="var(--plot-text)" />
          ))}
          <text x={282} y={94} fontSize={10} fill="var(--plot-text)">
            {labels.iPhase}
          </text>
          <text x={4} y={194} fontSize={10} fill="var(--plot-text)">
            {labels.neutral}
          </text>
        </>
      )}
      {/* Line voltage: between lines a and b */}
      <line
        x1={90}
        y1={34}
        x2={90}
        y2={86}
        stroke="var(--plot-text)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <text x={94} y={64} fontSize={10} fill="var(--plot-text)">
        {labels.vLine}
      </text>
      <text x={250} y={202} fontSize={10} fill="var(--plot-text)" textAnchor="middle">
        {labels.load}
      </text>
    </svg>
  );
}
