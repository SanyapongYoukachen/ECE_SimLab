# Signals Lab

An interactive teaching instrument for signals and circuits, built for
undergraduate ECE courses. Five linked modules show the same object in two
representations at once — manipulate either one, watch the other respond.

Live modules: **Convolution** (flip-and-slide, drag-to-edit) · **Fourier
transform explorer** (time domain ↔ spectrum, spectral leakage, Web Audio
playback) · **AC circuits** (sine waves, RMS and phasors; R/L/C loads with
leading and lagging current, the power triangle, power factor and resonance)
· **DC circuits** (Ohm's law, series/parallel
resistors, the voltage divider — a schematic linked to a live I-V plot, power
bars, or a voltage ladder) · **Circuit simulator** (tabbed, one simulated
circuit per tab — the Wheatstone bridge first — with animated current flow
through every branch).

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
npm run test:e2e     # playwright — smoke suite across all five modules
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build (static per-route prerender)
```

## Architecture

```
src/
  lib/dsp/       pure TypeScript DSP math, zero React/DOM imports, fully unit-tested
  lib/circuits/  pure TypeScript circuit math (Ohm's law, series/parallel, divider,
                 Wheatstone bridge nodal analysis), same style
  lib/plot/      canvas primitives: scales, axes, stems, lines, hit-testing, theme tokens,
                 plus a hand-drawn schematic kit (resistor, battery, wires, current arrows,
                 animated current-flow dots)
  lib/state/     Zod schemas + URL <-> state codecs + localStorage telemetry
  components/
    ui/          shared controls: PlotCanvas, AnimatedCanvas, Slider, SegmentedControl,
                 PredictionGate, PredictionCheck, ThemeToggle, LiveRegion, ModuleShell, ...
    modules/     one directory per module (convolution / fourier / ac / circuits /
                 simulator), each with its own panels, scales, and orchestrating
                 <XModule> component — simulator/ additionally nests one directory
                 per simulated circuit (wheatstone/ so far)
  app/
    page.tsx                 landing page
    convolution/page.tsx
    fourier/page.tsx
    ac/page.tsx               (/theorem redirects here — see next.config.ts)
    circuits/page.tsx
    simulator/page.tsx
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
   module displays that output at full floating-point precision.

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

### Prediction: a check by default, a gate as opt-in practice

Every module ships a bank of 3-5 questions
(`components/modules/<name>/questions.ts`, typed as
`PredictionQuestion[]`) and two ways to ask them, chosen by a single
cross-module preference:

- **Default — `components/ui/ModuleTabs.tsx` + `PredictionCheck.tsx`.**
  Every module is split into two tabs: **Explore** (the interactive
  content, ending in a "Done exploring? Start the check →" prompt) and
  **Check your understanding** (the whole question bank, numbered, with a
  live "Answered X of N · Y correct" summary, a final score once every
  question is answered, and "Clear my answers" to retake). The tab label
  shows progress (`2/5`), and the active tab lives in the URL
  (`?view=quiz`), so an instructor can link straight to the check. Each
  question persists its own answer independently in `localStorage`
  (`signals-lab:predicted:<moduleId>:<questionId>`) — a check on whether the
  demonstration landed, not a gate in front of it.
- **Opt-in "Predict first" practice mode — `components/ui/PredictionGate.tsx`
  with `persist={false}`.** A `<PracticeModeToggle>` in every module's header
  (`usePracticeMode` / `setPracticeMode`, backed by a single
  `signals-lab:practice-mode` key) switches the _whole app_ into gated mode:
  each module instead wraps its content behind **one** question, picked
  at random from that module's bank (`usePracticeQuestion`), and blocks
  (`inert` + `aria-hidden`) until answered. `persist={false}` means it never
  remembers a past answer as a standing unlock — every visit re-gates with a
  fresh random question, which is the point for a student drilling on
  purpose.

Both read the instructor's `?predict=off` flag the same way: the gate
unlocks immediately instead of blocking, the check renders nothing at all.
`PredictionGate`'s default (`persist={true}`, used automatically whenever
practice mode is on) is what modules used before this preference existed —
answer once, stay unlocked.

### Circuit simulator: tabs and animated current flow

`app/simulator/page.tsx` renders `<SimulatorModule>`, which owns just one
thing — a `<SegmentedControl>` reading/writing `?tab=` via its own tiny
`SimulatorStateSchema` — and renders whichever tab's component is selected.
Each tab is a fully independent module living in its own
`components/modules/simulator/<circuit>/` directory, with its own state
schema, URL params, math, and question bank; nothing here couples one
circuit's shape to another's, so adding a second tab means adding a second
directory and a line in `constants.ts`, not touching the Wheatstone bridge.

The Wheatstone bridge (`lib/circuits/wheatstone.ts`) is solved by nodal
analysis: two KCL equations at the bridge's midpoints reduce to a 2x2 linear
system (solved directly via Cramer's rule) for the node voltages, from which
every branch current — including the galvanometer's — falls out directly.
The balance condition `R1·R4 = R2·R3` is a property of that solution, not a
special case: it holds regardless of the galvanometer's own resistance,
which is itself one of the module's prediction questions.

Current flow is genuinely animated, not just a static arrow: `<AnimatedCanvas>`
(`components/ui/AnimatedCanvas.tsx`) is `<PlotCanvas>`'s sibling for
continuous motion — it drives its own `requestAnimationFrame` loop instead of
redrawing only on `deps` changes, passing an elapsed-time `phase` into
`onDraw`. `drawCurrentFlowDots` (`lib/plot/schematic.ts`) uses that phase to
walk dots along a wire segment at a speed and opacity proportional to
`|current|`, direction from its sign — so the galvanometer branch visibly
slows to a near-standstill as the bridge approaches balance, which is the
whole point of the demonstration. Respects `prefers-reduced-motion`: falls
back to static, magnitude-sized arrows (reusing `drawCurrentArrow`) instead
of animating.

Because those dots crawl almost imperceptibly near balance, the galvanometer
also has a centre-zero needle. Its deflection is `tanh(Ig / 2 mA)`
(`galvanometerDeflection` in `lib/circuits/wheatstone.ts`), so it stays on
scale far from balance but still moves visibly for a single slider step near
it. It rides an underdamped spring, overshooting and settling the way a
moving-coil meter does, and snaps straight to position under reduced motion.

### Wheatstone sensing mode: a bridge reading a real sensor

The Wheatstone tab has two modes. **Free** puts every arm on a slider.
**Sensing** turns it into a quarter bridge. The student picks a sensor and
which arm (R1–R4) it sits in. The other three arms are fixed at the sensor's
resistance at its reference point, so the bridge reads zero there, and a
physical-quantity slider drives the sensor.

| Sensor                   | Quantity (range, reference) | Model (`lib/circuits/sensors.ts`)    |
| ------------------------ | --------------------------- | ------------------------------------ |
| Light-dependent resistor | 1–10 000 lx, 100 lx         | R = 10 kΩ · (E/100 lx)^−0.7          |
| NTC thermistor           | −20–100 °C, 25 °C           | beta model, R25 = 10 kΩ, B = 3950 K  |
| Pt100 RTD                | −50–200 °C, 0 °C            | Callendar–Van Dusen (IEC 60751 A, B) |
| Strain gauge             | ±2000 µε, 0                 | R = 350 Ω · (1 + 2.0 · ε)            |
| Variable resistor        | 10–2200 Ω, 1 kΩ             | R set directly                       |

Each sensor gets its schematic symbol on its arm, an animated illustration
of the physical effect (photons and freed carriers, a thermistor bead,
a vibrating platinum lattice, a bending cantilever), and response curves of
resistance and bridge output across the whole range. `bridgeSweep()`
computes those curves and also auto-ranges the galvanometer, so a strain
gauge's microamps swing the needle as visibly as an LDR's milliamps.
Moving the sensor between the R1/R4 and R2/R3 positions flips the output's
sign.

**Quarter, half and full bridges.** A configuration switch sets how many
arms are sensors (`armRoles()` / `bridgeArms()`):

| Configuration | Active arms (sensor in R4)                 | Ideal output                      |
| ------------- | ------------------------------------------ | --------------------------------- |
| Quarter       | R4                                         | ≈ V/4 · ΔR/R, slightly non-linear |
| Half          | R4 (+Δ), R3 (−Δ) — same divider, push-pull | ≈ V/2 · ΔR/R, linear              |
| Full          | R1, R4 (+Δ); R2, R3 (−Δ)                   | ≈ V · ΔR/R, linear                |

The "−Δ" arms see the reading mirrored about the reference (−ε,
2·T_ref − T, or E_ref²/E for light), like the gauges on the compressed
face of a bending beam. The output plot overlays all three configurations,
and the meter is ranged by the full bridge, so the 1 : 2 : 4 sensitivity is
visible on the needle as well. Readouts show the loaded output next to the
open-circuit output and the textbook estimate k·V·ΔR/R. That separates the
galvanometer's loading from the quarter bridge's non-linearity. Unit tests
pin the 1 : 2 : 4 ratio, the textbook outputs, and the exact linearity of
half and full bridges.

### Language: English and Thai

A language toggle in every header switches the whole app between English
and Thai. The choice is stored in `localStorage` (`signals-lab:lang`); with
no stored choice, a browser whose preferred language is Thai opens in Thai.
Language is a per-viewer preference, not part of the URL, so a shared link
opens in each reader's own language.

- `lib/i18n/messages/en.ts` is the reference dictionary. `th.ts` is typed
  against it, so adding an English key fails the typecheck until the Thai
  translation exists. Interpolated strings are functions; math notation and
  units stay the same in both languages.
- Client components read strings with `useMessages()`. Question banks are
  `LocalizedQuestion[]` with `{ en, th }` side by side, so answer ids and
  `correct` flags exist once; `useLocalizedQuestions()` picks the language.
- Server-rendered chrome (landing page, module titles) uses `<Localized>`,
  which renders every language and lets CSS on `<html data-lang>` show one.
  An inline script in the root layout sets `lang`/`data-lang` before first
  paint, so Thai readers never see a flash of English and React never sees a
  hydration mismatch.
- Thai text uses Noto Sans Thai (Geist has no Thai glyphs). Page `<title>`
  metadata is still English only.

### Search (SEO)

`lib/seo.ts` holds every page's title, description, keywords and canonical
path, plus the schema.org JSON-LD (`LearningResource` + `WebApplication` per
module; `WebSite` + `ItemList` on the landing page). Titles target the
specific queries students type ("Wheatstone bridge simulator", "convolution
visualizer", "power factor phasor") rather than only "circuit simulator",
where established tools dominate. Also generated:

- `app/robots.ts` and `app/sitemap.ts`
- per-route `opengraph-image.tsx` share cards (`lib/og/card.tsx`)
- a server-rendered **About** section under every module (`ModuleAbout`,
  text in the i18n `about` dictionary). The modules render client-side, so
  without it crawlers see little more than "Loading module…".

Set `NEXT_PUBLIC_SITE_URL` for a custom domain (default:
`https://ece-sim-lab.vercel.app`) and `GOOGLE_SITE_VERIFICATION` to verify
Google Search Console by meta tag.

## Adding another module

The circuits module (`lib/circuits`, `components/modules/circuits`) followed
exactly this recipe — see it for a worked example that isn't DSP.

1. Add a Zod schema + encode/decode pair in `lib/state/schemas.ts` and
   `lib/state/urlState.ts`.
2. Add any new pure math to its own `lib/<topic>` directory (with tests —
   nothing else should start until they're green).
3. Create `components/modules/<name>/questions.ts` — a `PredictionQuestion[]`
   bank of 3-5 questions — and `components/modules/<name>/` with panel
   components (each a `draw(ctx, size, theme)` callback passed to
   `<PlotCanvas>`) and an orchestrating `<NameModule>` component. Wire state,
   a `<LiveRegion>`, and both prediction paths off the same bank: render
   `<PredictionCheck questions={QUESTIONS} .../>` inline at the end when
   `!usePracticeMode()`, else wrap the whole module in `<PredictionGate
question={practiceQuestion.question} options={practiceQuestion.options}
persist={false}>` using `usePracticeQuestion(QUESTIONS)` — every existing
   module follows this exact branch, so copy one rather than improvising a
   new shape. Reuse `Slider`, `SegmentedControl`, `ExpressionReadout` from
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
- **Module 3 is AC circuits** (it replaced the convolution theorem module;
  `/theorem` redirects to `/ac`). `lib/circuits/ac.ts` holds the math: RMS
  and crest factors for sine, square and triangle waves (verified against
  direct numerical integration), and steady-state series R/L/C analysis by
  complex impedance: θ = arg Z, power factor cos θ labelled lagging or
  leading, P/Q/S, component voltages, and series resonance. Defaults are Thai
  mains: 220 V rms (311 V peak), 50 Hz.
- **v, i and p are stacked small multiples on one time axis** (`TimeStack`),
  never two units on one y-axis. Dotted guides through every panel mark the
  voltage's and current's zero crossings, with a Δt = θ/ω bracket between them.
- **One animation clock.** Each `AnimatedCanvas` runs its own loop, so the
  AC canvases read the shared `performance.now()` (`clock.ts`) rather than
  each loop's `phase`. That keeps the rotating phasor and the time plots'
  cursor in step. The animation turns once every 2 s regardless of f, and
  says so.

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
