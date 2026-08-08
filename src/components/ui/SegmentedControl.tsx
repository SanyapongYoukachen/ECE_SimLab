'use client';

import type { KeyboardEvent } from 'react';

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface SegmentedControlProps<T extends string> {
  readonly label: string;
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/**
 * A small set of mutually-exclusive presets, e.g. kernel or window choice.
 * Follows the ARIA radiogroup keyboard pattern: only the checked option (or
 * the first, if none) sits in the Tab order, and arrow keys move — and
 * select — between options.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>): React.JSX.Element {
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number): void {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = options.length - 1;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      onChange(options[nextIndex].value);
      const group = e.currentTarget.parentElement;
      const buttons = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[nextIndex]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-1"
    >
      {options.map((opt, index) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={
              'rounded px-3 py-1.5 text-sm transition-colors ' +
              (selected
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm font-medium'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
