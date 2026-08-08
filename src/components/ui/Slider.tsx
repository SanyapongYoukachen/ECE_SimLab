'use client';

interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly formatValue?: (value: number) => string;
  readonly id?: string;
}

/** A labelled range input with a tabular-figure readout. Fully native — arrow keys, Home/End, Page Up/Down all work. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  id,
}: SliderProps): React.JSX.Element {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const inputId = id ?? `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm text-[var(--foreground)]">
          {label}
        </label>
        <span className="font-mono tabular-nums text-sm text-[var(--foreground)]/80">
          {displayValue}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--plot-active)]"
      />
    </div>
  );
}
