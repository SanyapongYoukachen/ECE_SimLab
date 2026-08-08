/**
 * Canvas cannot read CSS custom properties directly, so we resolve the same
 * tokens the chrome uses (defined in globals.css) once per draw pass. This
 * keeps a single source of truth for colour meaning: input / active / output
 * / structure, fixed across all three modules, light and dark.
 */
export interface PlotTheme {
  readonly input: string;
  readonly active: string;
  readonly output: string;
  readonly structure: string;
  readonly structureFaint: string;
  readonly background: string;
  readonly text: string;
  readonly danger: string;
}

const FALLBACK: PlotTheme = {
  input: '#5b7db1',
  active: '#d99a3d',
  output: '#3f9c81',
  structure: '#8a93a3',
  structureFaint: '#8a93a333',
  background: '#ffffff',
  text: '#1b1f27',
  danger: '#c0553f',
};

function cssVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = styles.getPropertyValue(name).trim();
  return v.length > 0 ? v : fallback;
}

/** Reads the current plot colour tokens from :root. Safe to call every frame. */
export function readPlotTheme(): PlotTheme {
  if (typeof window === 'undefined') return FALLBACK;
  const styles = getComputedStyle(document.documentElement);
  return {
    input: cssVar(styles, '--plot-input', FALLBACK.input),
    active: cssVar(styles, '--plot-active', FALLBACK.active),
    output: cssVar(styles, '--plot-output', FALLBACK.output),
    structure: cssVar(styles, '--plot-structure', FALLBACK.structure),
    structureFaint: cssVar(styles, '--plot-structure-faint', FALLBACK.structureFaint),
    background: cssVar(styles, '--plot-background', FALLBACK.background),
    text: cssVar(styles, '--plot-text', FALLBACK.text),
    danger: cssVar(styles, '--plot-danger', FALLBACK.danger),
  };
}
