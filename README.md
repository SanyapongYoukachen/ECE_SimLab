# Signals Lab

An interactive teaching instrument for signals and circuits, built for
undergraduate ECE courses. Four linked modules show the same object in two
representations at once — manipulate either one, watch the other respond.

Live modules: **Convolution** (flip-and-slide, drag-to-edit) · **Fourier
transform explorer** (time domain ↔ spectrum, spectral leakage, Web Audio
playback) · **The convolution theorem** (direct vs. FFT-based convolution,
live operation counts) · **DC circuits** (Ohm's law, series/parallel
resistors, the voltage divider — a schematic linked to a live I-V plot, power
bars, or a voltage ladder).

No backend, no database. Everything — including student answers to the
prediction gate/check and the interaction log — lives in the browser (URL
query string + `localStorage`).

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run test        # vitest — lib/dsp and lib/circuits unit tests
npm run test:e2e     # playwright — smoke suite across all four modules
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build (static per-route prerender)
```

## Architecture

```
src/
  lib/dsp/       pure TypeScript DSP math, zero React/DOM imports, fully unit-tested
  lib/circuits/  pure TypeScript circuit math (Ohm's law, series/parallel, divider), same style
  lib/plot/      canvas primitives: scales, axes, stems, lines, hit-testing, theme tokens,
                 plus a small hand-drawn schematic kit (resistor, battery, wires, current arrows)
  lib/state/     Zod schemas + URL <-> state codecs + localStorage telemetry
  components/
    ui/          shared controls: PlotCanvas, Slider, SegmentedControl,
                 PredictionGate, ThemeToggle, LiveRegion, ModuleShell, ...
    modules/     one directory per module (convolution / fourier / theorem / circuits),
                 each with its own panels, scales, and orchestrating
                 <XModule> component
  app/
    page.tsx                 landing page
    convolution/page.tsx
    fourier/page.tsx
    theorem/page.tsx
    circuits/page.tsx
e2e/             Playwright smoke tests
```

The three architectural rules that keep adding another module cheap:

1. **`lib/dsp` never imports React or touches the DOM.** It's plain,
   deterministic TypeScript — importable from a Node script, testable in
   isolation, and safe to reuse from any future module without dragging in
   rendering concerns.
2. **Canvases are drawn, not componentized per-shape.** `lib/plot` exposes
   drawing _functions_ (`drawStems`, `drawLine`, `drawAxes`, ...) that take a
   `CanvasRenderingContext2D` and plain data. The `<PlotCanvas>` component in
   `components/ui` is the only thing that owns a `<canvas>` element,
   handling devicePixelRatio scaling, resize observation, theme-change
   redraws, and pointer/keyboard event plumbing. A module's panel component
   is just a `draw(ctx, size, theme)` callback plus a legend.
3. **Interactive modules are client-only by design.** Each module's page
   renders it via `next/dynamic(..., { ssr: false })`. These are
   computation-heavy, DOM-heavy teaching instruments with no SEO-relevant
   server content — and server-rendering them risks a subtle hydration
   mismatch, since transcendental math (`Math.exp`, `Math.sin`, ...) is not
   guaranteed bit-identical between Node's V8 and the browser's when a
   module displays that output at full floating-point precision (Module 3's
   `max|error|` readout is exactly this case).

### The `lib/dsp` API

```ts
// convolution.ts
function convolve(x: number[], h: number[]): number[];
function convolveSteps(x: number[], h: number[]): ConvStep[]; // per-shift breakdown for the animation
function fftConvolve(x: number[], h: number[]): number[]; // IFFT(FFT(x) . FFT(h))

// fft.ts — iterative, in-place, radix-2 Cooley-Tukey
function fft(re: Float64Array, im: Float64Array): void;
function ifft(re: Float64Array, im: Float64Array): void;
function nextPow2(n: number): number;
function zeroPad(x: number[], n: number): Float64Array;

// window.ts
type WindowType = 'rect' | 'hann' | 'hamming' | 'blackman';
function makeWindow(type: WindowType, n: number): Float64Array;

// spectrum.ts
function magnitudeSpectrum(
  signal: number[],
  sampleRate: number,
  window?: WindowType
): { freqs: Float64Array; mag: Float64Array; nfft: number; binSpacing: number; nyquist: number };

// opcount.ts — complexity-class illustrations, not a cycle-accurate cost model
function directConvOps(n: number, m: number): number; // n * m
function fftConvOps(n: number, m: number): number; // ~3 * (nfft/2) * log2(nfft) + nfft

// complex.ts — plain {re, im} arithmetic, used where a single complex value
// (not a bulk re/im array pair) is convenient
```

Every function here is covered by `src/lib/dsp/*.test.ts`, including: hand-computed
convolution results (symmetric and asymmetric kernels), output length ==
`N + M - 1`, commutativity, `ifft(fft(x)) ≈ x` to `1e-10`, a pure sinusoid at
a bin centre producing a single clean bin, FFT-based convolution matching
direct convolution to `1e-9`, and each window function's symmetry and known
sum.

### State: everything is a URL

`lib/state/schemas.ts` defines a Zod schema per module. `lib/state/urlState.ts`
encodes/decodes each schema to and from `URLSearchParams`; malformed or
missing values fall back to schema defaults via `safeParse`, so a hand-edited
or truncated link degrades gracefully instead of breaking. `useUrlSyncedState`
(in `lib/state/useUrlState.ts`) is a `useSyncExternalStore`-backed hook that
reads the live URL as its source of truth and writes back via
`history.replaceState`, **merging** into the existing query string rather
than replacing it — so one module's state and the instructor's `?predict=off`
flag can coexist without stomping each other.

### Telemetry

`lib/state/telemetry.ts` appends `{ ts, sessionId, module, type, payload }`
events to `localStorage` (anonymous UUID session id, capped at 2000 events).
The "Export log" button in every module's header downloads the current
browser's log as JSON. No backend in v1 — the event shape is deliberately
generic so a real collector can be pointed at `logEvent()` later without a
schema change.

### Prediction: a gate for module 4, a check for modules 1-3

Two components share one `localStorage` answer namespace
(`signals-lab:predicted:<moduleId>`) but apply it at opposite ends of the
module:

- `components/ui/PredictionGate.tsx` (circuits only) wraps the module's
  interactive area, showing a multiple-choice question up front and marking
  the wrapped content `inert` + `aria-hidden` until answered — a guess made
  before anything is shown.
- `components/ui/PredictionCheck.tsx` (convolution, Fourier, theorem) renders
  inline at the _end_ of the module, after the content is already open and
  interactive. It's the same question/options shape and the same
  correct/incorrect feedback styling, just non-blocking — a check on whether
  the demonstration landed, not a gate in front of it.

Both read the instructor's `?predict=off` flag the same way: the gate
unlocks immediately instead of blocking, the check renders nothing at all.
Both persist the chosen option in `localStorage`, keyed per module, so a
returning student isn't re-asked.

## Adding another module

The circuits module (`lib/circuits`, `components/modules/circuits`) followed
exactly this recipe — see it for a worked example that isn't DSP.

1. Add a Zod schema + encode/decode pair in `lib/state/schemas.ts` and
   `lib/state/urlState.ts`.
2. Add any new pure math to its own `lib/<topic>` directory (with tests —
   nothing else should start until they're green).
3. Create `components/modules/<name>/` with panel components (each a
   `draw(ctx, size, theme)` callback passed to `<PlotCanvas>`) and an
   orchestrating `<NameModule>` component that wires state, a prediction
   component, and a `<LiveRegion>` together — `<PredictionCheck>` (inline,
   non-blocking, at the end of the module) unless the module specifically
   needs to gate access up front, in which case use `<PredictionGate>`
   instead. Reuse `Slider`, `SegmentedControl`, `ExpressionReadout` from
   `components/ui` — avoid inventing new control chrome.
4. Create `components/modules/<name>/<Name>ModuleClient.tsx`
   (`next/dynamic(..., { ssr: false })`) and `app/<name>/page.tsx` wrapping it
   in `<ModuleShell>`.
5. Add it to the landing page's module list and write an e2e smoke test in
   `e2e/`.

## Design decisions worth flagging

- **Palette**: plot colours are fixed semantic tokens (`--plot-input`,
  `--plot-active`, `--plot-output`, `--plot-structure`) defined once in
  `globals.css` and read by canvas code at draw time via
  `lib/plot/theme.ts`'s `readPlotTheme()` — never redefined per module.
  Deliberately steel-blue / amber / teal rather than the warm-cream-and-
  terracotta palette the brief asked to avoid.
- **Spectrum display is in dB**, not linear amplitude. A linear axis hides
  exactly the thing a window comparison needs to show — a window's far
  sidelobes are small in absolute terms but decay far slower than a tapered
  window's. This only reads clearly on a log scale; a linear plot made Hann
  look "worse" than rectangular at a glance (wider visible main lobe) when
  it's actually better where it matters (lower far-field leakage).
- **Audio is live additive synthesis** (three oscillators + gain nodes,
  retuned in place via `setTargetAtTime` as sliders move), not a rendered
  buffer — parameters stay audibly live while dragging.
- **Module 3's length slider drives both `x` and `h`** (same length `N`),
  making direct cost exactly `O(N^2)` — the cleanest version of the
  quadratic-vs-`N log N` story. `useDeferredValue` keeps the slider itself
  responsive while the (still sub-20ms up to `N = 2048`) convolution recomputes.
- **No wall-clock timing readout.** An earlier draft measured
  `performance.now()` around the direct/FFT calls, but that's an impure call
  made during render, isn't guaranteed stable across re-renders, and isn't
  what the brief actually asked for — it asked for the operation _count_,
  which is a pure, deterministic function of `N`. Dropped in favour of the
  cost chart plus the exact `directConvOps` / `fftConvOps` numbers.

## What I'd reconsider about the pedagogy

- Both prediction components persist a single "answered" state per module per
  browser. Neither currently distinguishes "answered correctly" from
  "answered incorrectly" in what it unlocks or in the exported telemetry
  summary — an instructor exporting logs across a class would have to reach
  into each event's `correct` field themselves rather than getting an
  aggregate misconception report. A v2 telemetry export that groups wrong
  answers by option, per module, would surface the actual misconceptions a
  lot faster than raw events do.
- Module 2's leakage story would benefit from a _second_ prediction gate at
  the point where the student switches away from the rectangular window —
  right now the only gate is up front, before either concept (leakage or
  windowing) has been shown. Splitting it into "predict what off-bin looks
  like" and then, after that lands, "predict what a window does to it" would
  match the two-beat structure the brief itself describes ("show the problem
  before the fix") more closely than a single up-front question does.
