import {
  CircuitStateSchema,
  ConvolutionStateSchema,
  FourierPresetSchema,
  PredictFlagSchema,
  SimulatorStateSchema,
  AcStateSchema,
  WheatstoneStateSchema,
  ModuleViewStateSchema,
  type ModuleViewState,
  type CircuitState,
  type ConvolutionState,
  type FourierState,
  type SimulatorState,
  type AcState,
  type WheatstoneState,
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

export function decodeAcState(params: URLSearchParams): AcState {
  const raw = {
    mode: params.get('mode') ?? undefined,
    shape: params.get('shape') ?? undefined,
    peak: num(params, 'peak'),
    phase: num(params, 'phase'),
    freq: num(params, 'freq'),
    load: params.get('load') ?? undefined,
    vrms: num(params, 'vrms'),
    r: num(params, 'r'),
    l: num(params, 'l'),
    c: num(params, 'c'),
  };
  const result = AcStateSchema.safeParse(raw);
  return result.success ? result.data : AcStateSchema.parse({});
}

export function encodeAcState(state: AcState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('mode', state.mode);
  params.set('shape', state.shape);
  params.set('peak', String(state.peak));
  params.set('phase', String(state.phase));
  params.set('freq', String(state.freq));
  params.set('load', state.load);
  params.set('vrms', String(state.vrms));
  params.set('r', String(state.r));
  params.set('l', String(state.l));
  params.set('c', String(state.c));
  return params;
}

export function decodeCircuitState(params: URLSearchParams): CircuitState {
  const raw = {
    mode: params.get('mode') ?? undefined,
    voltage: num(params, 'voltage'),
    r1: num(params, 'r1'),
    r2: num(params, 'r2'),
    topology: params.get('topology') ?? undefined,
  };
  const result = CircuitStateSchema.safeParse(raw);
  return result.success ? result.data : CircuitStateSchema.parse({});
}

export function encodeCircuitState(state: CircuitState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('mode', state.mode);
  params.set('voltage', state.voltage.toFixed(2));
  params.set('r1', state.r1.toFixed(1));
  params.set('r2', state.r2.toFixed(1));
  params.set('topology', state.topology);
  return params;
}

export function decodeSimulatorState(params: URLSearchParams): SimulatorState {
  const raw = { tab: params.get('tab') ?? undefined };
  const result = SimulatorStateSchema.safeParse(raw);
  return result.success ? result.data : SimulatorStateSchema.parse({});
}

export function encodeSimulatorState(state: SimulatorState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tab', state.tab);
  return params;
}

export function decodeWheatstoneState(params: URLSearchParams): WheatstoneState {
  const raw = {
    voltage: num(params, 'voltage'),
    r1: num(params, 'r1'),
    r2: num(params, 'r2'),
    r3: num(params, 'r3'),
    r4: num(params, 'r4'),
    rg: num(params, 'rg'),
    mode: params.get('mode') ?? undefined,
    sensor: params.get('sensor') ?? undefined,
    arm: params.get('arm') ?? undefined,
    lux: num(params, 'lux'),
    ntc: num(params, 'ntc'),
    rtd: num(params, 'rtd'),
    strain: num(params, 'strain'),
    pot: num(params, 'pot'),
    config: params.get('config') ?? undefined,
  };
  const result = WheatstoneStateSchema.safeParse(raw);
  return result.success ? result.data : WheatstoneStateSchema.parse({});
}

/**
 * Up to 6 decimals, trailing zeros trimmed. A fixed 1-decimal encoding would
 * round a solved balance point (e.g. R4 = 100·100/300 = 33.33 Ω) far enough
 * off R1·R4 = R2·R3 that the bridge reads unbalanced after one URL round trip.
 */
function precise(n: number): string {
  return String(Number(n.toFixed(6)));
}

export function encodeWheatstoneState(state: WheatstoneState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('voltage', precise(state.voltage));
  params.set('r1', precise(state.r1));
  params.set('r2', precise(state.r2));
  params.set('r3', precise(state.r3));
  params.set('r4', precise(state.r4));
  params.set('rg', precise(state.rg));
  params.set('mode', state.mode);
  params.set('sensor', state.sensor);
  params.set('arm', state.arm);
  params.set('lux', precise(state.lux));
  params.set('ntc', precise(state.ntc));
  params.set('rtd', precise(state.rtd));
  params.set('strain', precise(state.strain));
  params.set('pot', precise(state.pot));
  params.set('config', state.config);
  return params;
}

export function decodePredictFlag(params: URLSearchParams): boolean {
  const raw = params.get('predict') ?? undefined;
  const result = PredictFlagSchema.safeParse(raw);
  return result.success ? result.data : true;
}

export function decodeModuleViewState(params: URLSearchParams): ModuleViewState {
  const result = ModuleViewStateSchema.safeParse({ view: params.get('view') ?? undefined });
  return result.success ? result.data : ModuleViewStateSchema.parse({});
}

export function encodeModuleViewState(state: ModuleViewState): URLSearchParams {
  return new URLSearchParams({ view: state.view });
}
