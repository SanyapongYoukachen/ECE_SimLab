import {
  ConvolutionStateSchema,
  FourierPresetSchema,
  PredictFlagSchema,
  TheoremStateSchema,
  type ConvolutionState,
  type FourierState,
  type TheoremState,
} from './schemas';

function num(params: URLSearchParams, key: string): number | undefined {
  const v = params.get(key);
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function numArray(params: URLSearchParams, key: string): number[] | undefined {
  const v = params.get(key);
  if (v === null || v.length === 0) return undefined;
  const parts = v.split(',').map(Number);
  return parts.every((p) => Number.isFinite(p)) ? parts : undefined;
}

/**
 * Every incoming URL is untrusted input: malformed, truncated, or hand-edited
 * values fall back to schema defaults via Zod rather than throwing or
 * producing a broken UI state.
 */
export function decodeConvolutionState(params: URLSearchParams): ConvolutionState {
  const raw = {
    kernel: params.get('kernel') ?? undefined,
    x: numArray(params, 'x'),
    n: num(params, 'n'),
  };
  const result = ConvolutionStateSchema.safeParse(raw);
  return result.success ? result.data : ConvolutionStateSchema.parse({});
}

export function encodeConvolutionState(state: ConvolutionState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('kernel', state.kernel);
  params.set('x', state.x.map((v) => Number(v.toFixed(3))).join(','));
  params.set('n', String(state.n));
  return params;
}

export function decodeFourierState(params: URLSearchParams): FourierState {
  const raw = {
    amp1: num(params, 'amp1'),
    amp2: num(params, 'amp2'),
    amp3: num(params, 'amp3'),
    freq3: num(params, 'freq3'),
    window: params.get('window') ?? undefined,
  };
  const result = FourierPresetSchema.safeParse(raw);
  return result.success ? result.data : FourierPresetSchema.parse({});
}

export function encodeFourierState(state: FourierState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('amp1', state.amp1.toFixed(2));
  params.set('amp2', state.amp2.toFixed(2));
  params.set('amp3', state.amp3.toFixed(2));
  params.set('freq3', state.freq3.toFixed(2));
  params.set('window', state.window);
  return params;
}

export function decodeTheoremState(params: URLSearchParams): TheoremState {
  const raw = {
    length: num(params, 'length'),
    preset: params.get('preset') ?? undefined,
  };
  const result = TheoremStateSchema.safeParse(raw);
  return result.success ? result.data : TheoremStateSchema.parse({});
}

export function encodeTheoremState(state: TheoremState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('length', String(state.length));
  params.set('preset', state.preset);
  return params;
}

export function decodePredictFlag(params: URLSearchParams): boolean {
  const raw = params.get('predict') ?? undefined;
  const result = PredictFlagSchema.safeParse(raw);
  return result.success ? result.data : true;
}
