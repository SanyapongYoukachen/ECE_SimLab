/**
 * English UI strings — the reference dictionary. `th.ts` is typed against
 * this shape, so a key added here fails the typecheck until it's translated.
 * Interpolated strings are functions; math notation (x[k], R1·R4, O(N log N))
 * and units stay inline in both languages.
 */
export const en = {
  common: {
    home: '← Signals Lab',
    loading: 'Loading module…',
    exportLog: 'Export log',
    exportLogTitle: "Download this browser's interaction log as JSON",
    theme: {
      system: 'Theme: system',
      light: 'Theme: light',
      dark: 'Theme: dark',
      cycleHint: 'Activate to cycle theme.',
    },
    practice: {
      on: 'Predict first: on',
      off: 'Predict first: off',
      title:
        'Gate each module behind a random prediction question before unlocking it — for extra practice',
    },
    language: {
      /** The button names the language it switches TO, written in that language. */
      switchLabel: 'ไทย',
      ariaLabel: 'Switch language to Thai',
    },
    play: 'Play',
    pause: 'Pause',
    step: 'Step →',
    yes: 'Yes',
    no: 'No',
    prediction: {
      checkHeading: 'Check your understanding',
      correct: '— correct',
      notQuite: '— not quite',
      checkRight: 'Matches what the Explore tab showed.',
      checkWrong: 'Worth another look in the Explore tab.',
      gateDialog: 'Predict before you explore',
      gateKicker: 'Predict first',
      gateRight: 'Watch it play out below to confirm.',
      gateWrong: 'Watch what actually happens below.',
      continue: 'Continue',
      tabsLabel: 'Module sections',
      tabExplore: 'Explore',
      progress: (answered: number, total: number) => `${answered}/${total}`,
      progressAria: (answered: number, total: number) => `${answered} of ${total} answered`,
      summary: (answered: number, total: number, correct: number) =>
        `Answered ${answered} of ${total} · ${correct} correct`,
      notStarted: (total: number) =>
        `${total} questions on what you just explored. Each answer is final, so take a moment before choosing.`,
      allDone: (correct: number, total: number) =>
        correct === total
          ? `All ${total} answered, all correct. Nicely done.`
          : `All ${total} answered: ${correct} correct. Revisit the explore tab for the ones you missed, then clear your answers and try again.`,
      reset: 'Clear my answers',
      ctaTitle: 'Done exploring?',
      ctaBody: (total: number) =>
        `Check your understanding with ${total} short questions on what you just saw.`,
      ctaButton: 'Start the check →',
      back: '← Back to explore',
    },
  },

  landing: {
    kicker: 'Signals Lab',
    title: 'Circuit simulators and signal graphs, made visible',
    intro:
      "You can already do the algebra. These five linked instruments are for the part algebra doesn't teach: what the operation actually does. Manipulate either representation and watch the other respond in real time.",
    modules: {
      convolution: {
        kicker: 'Module 1',
        title: 'Convolution',
        description:
          'Watch a kernel flip and slide across a signal, sample by sample, with the arithmetic shown live.',
      },
      fourier: {
        kicker: 'Module 2',
        title: 'Fourier transform explorer',
        description:
          'Move a frequency off a bin centre and watch — and hear — its peak smear across the spectrum.',
      },
      ac: {
        kicker: 'Module 3',
        title: 'AC circuits',
        description:
          'Sine waves, RMS and phasors, then R, L and C loads: watch current lead or lag the voltage, and see where the power factor comes from.',
      },
      circuits: {
        kicker: 'Module 4',
        title: 'DC circuits',
        description:
          "Ohm's law, series and parallel resistors, and the voltage divider — drag V and R, watch the schematic and the numbers respond together.",
      },
      simulator: {
        kicker: 'Module 5',
        title: 'Circuit simulator',
        description:
          'Animated current flow through a real circuit — starting with the Wheatstone bridge. More circuits land here in tabs as they’re added.',
      },
    },
    footerUrl:
      'Every configuration — signal values, kernel, shift, window, amplitudes, frequencies, voltage, resistance — lives in the URL. Set it up, copy the link, and it reproduces exactly.',
    footerPractice1:
      'Every module opens unlocked, with a check-your-understanding prompt at the end — turn on',
    footerPracticeStrong: 'Predict first',
    footerPractice2:
      "in a module's header to switch to a stricter guess-before-you-see gate for extra practice. Running a live lecture? Append",
    footerPractice3: 'to any module URL to hide that prompt entirely.',
  },

  pages: {
    convolution: {
      title: 'Convolution: flip, slide, multiply, sum',
      tagline:
        'Drag the grey stems to edit the input. Scrub the shift to see the kernel flip and slide underneath it.',
    },
    fourier: {
      title: 'The Fourier transform: from waveform to spectrum',
      tagline:
        "Move the third component off a bin centre and watch its peak smear — that's leakage, not a bug.",
    },
    ac: {
      title: 'AC circuits: sine waves, RMS and power factor',
      tagline:
        'Start with one sine wave and what "220 V" really means, then connect R, L and C loads and watch current lead or lag.',
    },
    circuits: {
      title: "DC circuits: Ohm's law and the voltage divider",
      tagline:
        'Drag the sliders to change the source voltage and the resistors. The schematic and the linked readout update together.',
    },
    simulator: {
      title: 'Circuit simulator',
      tagline:
        'Watch current actually flow through the circuit. Pick a circuit from the tabs; more are coming.',
    },
  },

  /**
   * Server-rendered "About" text under each module: what a search engine
   * reads (the module itself renders client-side), written for students.
   * th.ts must keep the same number of points and FAQ entries.
   */
  about: {
    heading: 'About this simulator',
    whatHeading: 'What you can do here',
    conceptsHeading: 'Concepts covered',
    faqHeading: 'Common questions',
    convolution: {
      intro:
        'This convolution visualizer shows discrete-time convolution the way it is taught by hand: flip the kernel h, slide it across the input x, multiply the overlapping samples and add them up. Every step of y[n] = Σ x[k]·h[n−k] is drawn on the signal graph and written out as arithmetic.',
      points: [
        'Scrub or play the shift n and watch the flipped kernel slide under the input signal.',
        'Drag any input sample to edit the signal and see the output update instantly.',
        'Compare kernels: moving average, triangular, exponential decay and the difference [1, −1].',
        'Check the output length N + M − 1 and see which samples overlap at every shift.',
      ],
      concepts: [
        'Discrete convolution',
        'Impulse response',
        'Moving-average filter',
        'Commutativity',
        'Output length N + M − 1',
      ],
      faq: [
        {
          q: 'How do you compute a convolution graphically?',
          a: 'Flip h[k] to get h[−k], shift it by n to get h[n−k], multiply it sample by sample with x[k], and sum the products. Repeat for every n. The simulator animates exactly these four steps.',
        },
        {
          q: 'Why is the output longer than the input?',
          a: 'The kernel starts overlapping the input before the first sample and stops after the last, so an N-sample input convolved with an M-sample kernel gives N + M − 1 output samples.',
        },
      ],
    },
    fourier: {
      intro:
        'This Fourier transform explorer plots a signal in the time domain and its FFT magnitude spectrum side by side. Move a frequency off an FFT bin and watch its peak smear into spectral leakage; switch window functions to see how tapering the signal trades main-lobe width for lower sidelobes. You can listen to the tones as well.',
      points: [
        'Build a signal from three sinusoids and see each one appear as a spectral peak.',
        'Slide one frequency between FFT bins to see spectral leakage appear and disappear.',
        'Compare rectangular, Hann, Hamming and Blackman windows on a decibel scale.',
        'Play the combined tones through your speakers with Web Audio.',
      ],
      concepts: [
        'Discrete Fourier transform (DFT) and FFT',
        'FFT bins and bin spacing',
        'Spectral leakage',
        'Window functions',
        'Nyquist frequency',
      ],
      faq: [
        {
          q: 'What is spectral leakage?',
          a: 'When a sinusoid does not complete a whole number of cycles in the FFT window, the hard cut at the window edges spreads its energy into neighbouring bins. Its single peak becomes a smeared hump.',
        },
        {
          q: 'Why use a window function before the FFT?',
          a: 'Tapering the signal to zero at both ends (Hann, Hamming, Blackman) greatly reduces the far sidelobes that leakage creates, at the cost of a slightly wider main peak.',
        },
      ],
    },
    ac: {
      intro:
        'This AC circuit simulator starts with a single sine wave: peak, peak-to-peak, RMS and the rotating phasor that draws it. It then connects R, L and C loads to a 220 V, 50 Hz source, so you can watch current lead or lag the voltage, see where real, reactive and apparent power come from, and read the power factor.',
      points: [
        'See why Vrms = Vp/√2 for a sine wave, and why that rule fails for square and triangle waves.',
        'Watch a rotating phasor trace out the sine wave in real time.',
        'Connect R, L, C, RL, RC or RLC loads and read the phase angle, impedance and power factor.',
        'Follow v(t), i(t) and p(t) together, and find series resonance where X_L = X_C.',
      ],
      concepts: [
        'RMS and peak voltage',
        'Phasors and phase angle',
        'Impedance Z = R + jX',
        'Power factor (leading and lagging)',
        'Real, reactive and apparent power',
        'Series RLC resonance',
      ],
      faq: [
        {
          q: 'How do you calculate RMS voltage?',
          a: 'Square the waveform, average it over one period, and take the square root. For a sine wave this gives Vrms = Vp/√2, so 220 V mains has a peak of about 311 V.',
        },
        {
          q: 'What does a lagging power factor mean?',
          a: 'In an inductive load such as a motor, the current peaks after the voltage. Only the in-phase part of the current delivers real power; the rest is reactive. Adding capacitance brings the power factor back toward 1.',
        },
      ],
    },
    circuits: {
      intro:
        "This DC circuit simulator links a live schematic to the numbers behind it. Drag the source voltage and resistances and watch Ohm's law, series and parallel resistors and the voltage divider respond together: the current, the I-V graph, the power in each resistor and the voltage at every node.",
      points: [
        "Explore Ohm's law with a live I-V graph and operating point.",
        'Switch between series and parallel resistors and compare the power each one dissipates.',
        'Build a voltage divider and see Vout move as the resistor ratio changes.',
        'Read every current, voltage and power value update as you drag.',
      ],
      concepts: [
        "Ohm's law V = IR",
        'Series and parallel resistance',
        'Voltage divider',
        'Electrical power P = VI',
      ],
      faq: [
        {
          q: 'What stays the same in series and parallel circuits?',
          a: 'Resistors in series carry the same current; resistors in parallel have the same voltage across them.',
        },
        {
          q: 'How does a voltage divider work?',
          a: 'Two resistors in series split the source voltage in proportion to their resistance: Vout = V × R2 / (R1 + R2).',
        },
      ],
    },
    simulator: {
      intro:
        'This Wheatstone bridge circuit simulator animates current flowing through all four arms and the galvanometer, and shows the output voltage Vo = VB − VC as you change the resistors. Sensing mode turns it into a real measurement bridge: quarter, half and full bridges built from light-dependent resistors, thermistors, Pt100 RTDs and strain gauges.',
      points: [
        'Balance the bridge and watch the galvanometer current fall to zero at R1·R4 = R2·R3.',
        'See the output voltage Vo at the galvanometer change live as each resistor moves.',
        'Measure light, temperature and strain with LDR, NTC thermistor, RTD and strain gauge sensors.',
        'Compare quarter, half and full bridge sensitivity (×1, ×2, ×4) and linearity.',
      ],
      concepts: [
        'Wheatstone bridge balance',
        'Bridge output voltage',
        'Resistive sensors',
        'Strain gauge bridges',
        'Quarter, half and full bridges',
      ],
      faq: [
        {
          q: 'When is a Wheatstone bridge balanced?',
          a: 'When R1·R4 = R2·R3. The two dividers then give the same voltage, so no current flows through the galvanometer, whatever its own resistance.',
        },
        {
          q: 'What is the difference between a quarter, half and full bridge?',
          a: 'They use one, two or four active sensor arms. With the partners changing in opposite directions, the output is about V/4, V/2 and V times ΔR/R, and the half and full bridges are linear.',
        },
      ],
    },
  },

  convolution: {
    legendX: 'x[k] — drag a stem to edit it',
    legendH: 'h[n−k] — the kernel, flipped and shifted',
    inputAria: (n: number) =>
      `Input signal and flipped kernel at shift n=${n}. Use arrow keys to select and edit a sample.`,
    legendY: 'y[n] — solid = computed, faint = not yet reached',
    outputLength: (len: number) => `length = N + M − 1 = ${len}`,
    outputAria: (len: number, n: number, yn: string) =>
      `Output signal y[n], ${len} samples total. Currently showing shift n=${n}, y[${n}] = ${yn}.`,
    noOverlap: '(no overlap yet)',
    liveText: (n: number, last: number, expression: string) =>
      `Shift n=${n} of ${last}. ${expression}`,
    currentShift: 'Current shift',
    shiftSlider: 'Shift n',
    kernel: 'Kernel',
    flipped: 'flipped',
    kernels: {
      rect: {
        label: 'Rectangular',
        note: 'An unweighted moving average — every sample in the window counts equally.',
      },
      tri: {
        label: 'Triangular',
        note: 'A weighted average that favours the centre sample — smoother than the rectangular kernel.',
      },
      expo: {
        label: 'Exponential decay',
        note: 'Weights recent samples most heavily — the impulse response of a simple RC-style filter.',
      },
      diff: {
        label: 'Difference [1, −1]',
        note: 'Not a smoother: it responds to change, not level. Constant regions of x collapse to zero.',
      },
    },
  },

  fourier: {
    windows: {
      rect: 'Rectangular',
      hann: 'Hann',
      hamming: 'Hamming',
      blackman: 'Blackman',
    },
    liveText: (freq: string, onBin: boolean, window: string) =>
      `Component 3 at ${freq} Hz, ${onBin ? 'on a bin centre' : 'between bins — leakage visible'}. Window: ${window}.`,
    onBin: (bin: string) => `Component 3 sits exactly on a bin (${bin} Hz) — a single clean peak.`,
    offBin: (bin: string) =>
      `Component 3 sits between bins (nearest: ${bin} Hz) — this is spectral leakage, a consequence of the finite observation window, not a bug.`,
    binSpacing: 'Bin spacing',
    nyquist: 'Nyquist limit',
    component3: 'Component 3',
    onBinQ: 'On a bin?',
    amp1: 'Amplitude 1 (250 Hz, fixed)',
    amp2: 'Amplitude 2 (625 Hz, fixed)',
    amp3: 'Amplitude 3',
    freq3: 'Frequency 3',
    snap: 'Snap to nearest bin',
    hear: 'Hear the three tones combined',
    windowFunction: 'Window function',
    rectNote:
      'Rectangular is really no window at all — a hard cutoff at the edges of the observation, which is what causes leakage in the first place.',
    taperNote:
      'Tapering the signal toward zero at both edges before transforming reduces (but never fully removes) leakage.',
    spectrumAxis: 'vertical axis: dB, full scale = 0',
    aboveThreshold: 'bins above threshold',
    rectReference: 'rectangular-window reference',
    trueFreq: "component 3's true frequency",
    spectrumAria:
      'Magnitude spectrum of the observed signal, in decibels relative to full scale, versus frequency in Hertz.',
    observed: 'observed signal (sum of 3 components)',
    windowed: 'after windowing — tapered at the edges',
    timeAria: (n: number) =>
      `Time-domain signal, ${n} samples, built from three sinusoidal components.`,
  },

  ac: {
    modeLabel: 'Section',
    modes: {
      sine: 'Sine wave & RMS',
      load: 'RLC load & power factor',
    },
    // Sine-wave section
    shapeLabel: 'Waveform',
    shapes: { sine: 'Sine', square: 'Square', triangle: 'Triangle' },
    peak: 'Peak voltage Vp',
    frequency: 'Frequency f',
    phase: 'Phase φ',
    statPeak: 'Peak Vp',
    statPeakToPeak: 'Peak-to-peak Vpp',
    statRms: 'RMS Vrms',
    statRectified: 'Average of |v|',
    statCrest: 'Crest factor Vp/Vrms',
    statPeriod: 'Period T = 1/f',
    statOmega: 'Angular frequency ω = 2πf',
    statRule: 'Vp/√2',
    ruleHolds: 'equals Vrms: true for a sine',
    ruleFails: 'not Vrms: the √2 rule is sine-only',
    panelV: 'v(t)',
    panelV2: 'v²(t): its average is Vrms²',
    rmsLine: '±Vrms',
    meanSquare: 'mean of v²',
    rmsExplain:
      'RMS means root of the mean of the square: square the waveform (every part becomes positive), average it over one period, take the square root. For a sine the average of v² is exactly half of Vp², so Vrms = Vp/√2. A resistor fed Vrms of DC heats up exactly as much as it does on this AC.',
    phasorTitle: 'Phasor: a rotating arrow whose height is v(t)',
    phasorNote:
      'Animation slowed to about one turn every 2 s; the real wave turns f times per second.',
    notSine:
      'Phasors only describe pure sine waves. A square or triangle wave is a sum of many sines (see the Fourier module), so it has no single rotating arrow.',
    sineAria: (shape: string, peak: string, rms: string, f: string) =>
      `${shape} wave, peak ${peak}, RMS ${rms}, frequency ${f}. Upper plot v(t) with ±RMS lines; lower plot v squared with its mean.`,
    phasorAria: (angle: string) =>
      `Phasor diagram: an arrow rotating anticlockwise, its vertical projection tracing the sine wave. Phase ${angle}.`,
    // Load section
    loadLabel: 'Load (series)',
    loads: { r: 'R', l: 'L', c: 'C', rl: 'RL', rc: 'RC', rlc: 'RLC' },
    sourceRms: 'Source voltage Vrms',
    resistance: 'Resistance R',
    inductance: 'Inductance L',
    capacitance: 'Capacitance C',
    tuneResonance: (f0: string) => `Tune to resonance (${f0})`,
    statZ: 'Impedance Z = R + jX',
    statZMag: '|Z|',
    statTheta: 'Phase angle θ',
    statI: 'Current Irms',
    statPf: 'Power factor cos θ',
    statP: 'Real power P',
    statQ: 'Reactive power Q',
    statS: 'Apparent power S',
    statXl: 'X_L = ωL',
    statXc: 'X_C = 1/(ωC)',
    statVr: 'V_R',
    statVl: 'V_L',
    statVc: 'V_C',
    statF0: 'Resonance f₀',
    lagging: 'lagging',
    leading: 'leading',
    unity: 'unity',
    panelI: 'i(t)',
    panelP: 'p(t) = v·i',
    averageP: 'P (average)',
    returned: 'negative: energy flowing back to the source',
    lagText: (deg: string) => `current lags voltage by ${deg}`,
    leadText: (deg: string) => `current leads voltage by ${deg}`,
    inPhaseText: 'current in phase with voltage',
    phasorLoadTitle: 'Phasors: V and I',
    phasorScale: 'V and I drawn to separate scales; the angle between them is what matters.',
    triangleTitle: 'Power triangle',
    loadHow: {
      r: 'A resistor turns every joule into heat. Current rises and falls with the voltage, in phase (θ = 0), so p(t) never goes negative and the power factor is 1.',
      l: 'An inductor opposes changes in current, so the current peaks a quarter cycle after the voltage: it lags by 90°. Energy is stored in the magnetic field and handed back every half cycle, so the average power is zero; it is all reactive (Q > 0).',
      c: 'A capacitor has to charge before its voltage can rise, so the current peaks a quarter cycle before the voltage: it leads by 90°. Energy is stored in the electric field and returned, so the average power is zero; Q < 0.',
      rl: 'Motors, transformers and fluorescent ballasts look like R plus L: the current lags by θ between 0° and 90°. Only the in-phase part of the current does work (P); the rest sloshes back and forth (Q). That is a lagging power factor.',
      rc: 'An RC load draws a leading current: θ between 0° and −90°. Capacitors are added across inductive loads on purpose to cancel their lagging Q; that is power-factor correction.',
      rlc: 'In series RLC, X_L and X_C pull in opposite directions. Below resonance the capacitor wins (leading); above it, the inductor wins (lagging). At f₀ they cancel exactly: Z = R, the current is largest, the power factor is 1, and V_L and V_C can each be far larger than the source voltage.',
    },
    loadAria: (load: string, theta: string, pf: string) =>
      `${load} load. Voltage, current and instantaneous power over two cycles. Phase angle ${theta}, power factor ${pf}.`,
    phasorLoadAria: (relation: string) => `Phasor diagram of V and I: ${relation}.`,
    triangleAria: (p: string, q: string, s: string) =>
      `Power triangle: real power ${p} along the bottom, reactive power ${q} upright, apparent power ${s} along the hypotenuse.`,
    liveSine: (rms: string, peak: string) => `RMS ${rms}, peak ${peak}.`,
    liveLoad: (i: string, relation: string, pf: string) =>
      `Current ${i}, ${relation}, power factor ${pf}.`,
  },

  circuits: {
    modes: {
      ohm: "Ohm's law",
      network: 'Series & parallel',
      divider: 'Voltage divider',
    },
    topologies: {
      series: 'Series',
      parallel: 'Parallel',
    },
    sourceVoltage: 'Source voltage V',
    resistanceR: 'Resistance R',
    resistanceR1: 'Resistance R1',
    resistanceR2: 'Resistance R2',
    governingEquation: 'Governing equation',
    circuit: 'Circuit',
    topology: 'Topology',
    currentI: 'Current I',
    powerP: 'Power P = VI',
    voltageV: 'Voltage V',
    equivalent: 'Equivalent resistance',
    totalCurrent: 'Total current',
    vAcrossR1: 'Voltage across R1',
    vAcrossR2: 'Voltage across R2',
    iThroughR1: 'Current through R1',
    iThroughR2: 'Current through R2',
    vout: 'Vout (across R2)',
    current: 'Current',
    dividerRatio: 'Divider ratio R2/(R1+R2)',
    readoutOhmAria: (v: string, mA: string) =>
      `I-V load line for the resistor, with the operating point at ${v}, ${mA} milliamps.`,
    readoutNetworkAria: (p1: string, p2: string) =>
      `Power dissipated: R1 draws ${p1}, R2 draws ${p2}.`,
    readoutDividerAria: (vR1: string, vOut: string) =>
      `Voltage ladder: ${vR1} dropped across R1, ${vOut} across R2 as Vout.`,
    schematicOhmAria: (v: string, r: string) => `Schematic: a ${v} source driving a ${r} resistor.`,
    schematicNetworkAria: (r1: string, r2: string, topology: 'series' | 'parallel', v: string) =>
      `Schematic: two resistors, ${r1} and ${r2}, in ${topology} across a ${v} source.`,
    schematicDividerAria: (r1: string, r2: string, v: string) =>
      `Schematic: a voltage divider — ${r1} and ${r2} in series across ${v}, tapped between them.`,
  },

  simulator: {
    circuit: 'Circuit',
    tabs: {
      wheatstone: 'Wheatstone bridge',
    },
    wheatstone: {
      balanceCondition: 'Balance condition: R1·R4 = R2·R3',
      balanceRatio: 'Balance condition, as ratios: R1/R2 = R3/R4',
      ig: 'Galvanometer current',
      vb: 'Node B voltage',
      vc: 'Node C voltage',
      vbc: 'Bridge voltage VB − VC',
      r4Balance: 'R4 for balance (R2·R3/R1)',
      balancedQ: 'Balanced?',
      sourceVoltage: 'Source voltage V',
      r4: 'R4 (the unknown, in a real bridge)',
      rg: 'Galvanometer resistance Rg',
      balanceButton: 'Balance the bridge (solve R4)',
      balanceHint: (r4: string, min: string, max: string) =>
        `Balance needs R4 = ${r4}, outside the R4 slider's ${min}–${max} range. Change the ratio arms R1–R3 first.`,
      liveText: (balanced: boolean, ig: string) =>
        `Bridge is ${balanced ? 'balanced' : 'unbalanced'}. Galvanometer current ${ig}.`,
      needleRest: 'rests at centre zero',
      needleDeflects: (right: boolean) => `deflects ${right ? 'right' : 'left'}`,
      needlePinned: (right: boolean) => `is pinned hard ${right ? 'right' : 'left'}`,
      schematicAria: (vo: string, ig: string, balanced: boolean, needle: string) =>
        `Wheatstone bridge schematic. Output voltage Vo = VB − VC = ${vo}. Galvanometer current ${ig}, bridge is ${
          balanced ? 'balanced' : 'unbalanced'
        }. Current flow is animated through every branch, direction and speed reflecting each branch's current. The galvanometer needle ${needle}.`,

      modeLabel: 'Bridge mode',
      modes: {
        free: 'Free (every arm adjustable)',
        sensing: 'Sensing (one sensor arm)',
      },
      sensorLabel: 'Sensor',
      armLabel: 'Sensor position',
      sensors: {
        ldr: {
          name: 'Light (LDR)',
          quantity: 'Light level',
          how: 'A light-dependent resistor is a track of cadmium sulphide, a semiconductor. Each photon with enough energy frees an electron to conduct, so more light means more charge carriers and lower resistance: roughly R ∝ E^−0.7, about 5× lower for every tenfold increase in light.',
        },
        ntc: {
          name: 'Temperature (NTC thermistor)',
          quantity: 'Temperature',
          how: 'An NTC thermistor is a bead of semiconducting metal oxide. Heat frees more charge carriers, so its resistance falls steeply and non-linearly as it warms: about −4 % per °C near room temperature (beta model, B = 3950 K).',
        },
        rtd: {
          name: 'Temperature (Pt100 RTD)',
          quantity: 'Temperature',
          how: 'A Pt100 is a fine platinum wire, 100 Ω at 0 °C. Heat makes the metal lattice vibrate harder, scattering the electrons flowing through it, so resistance rises almost linearly: about +0.39 Ω per °C. A small change, but very stable and repeatable.',
        },
        strain: {
          name: 'Strain gauge',
          quantity: 'Strain',
          how: 'A strain gauge is a zig-zag metal foil bonded to a part. Stretching the part makes the foil longer and thinner, so its resistance rises by GF·ε (gauge factor ≈ 2); compressing it does the opposite. At 1000 µε the change is only 0.2 %, which is exactly why strain gauges are read with a bridge.',
        },
        pot: {
          name: 'Variable resistor',
          quantity: 'Resistance',
          how: "A plain variable resistor, with no physics in between: set the sensor arm's resistance directly and watch how the bridge responds.",
        },
      },
      sensorR: 'Sensor resistance',
      bridgeOut: 'Bridge output VB − VC',
      meterRange: 'Meter full scale (auto)',
      referenceNote: (reference: string, r: string) =>
        `Every arm, fixed or sensing, equals the sensor's resistance at ${reference} (${r}), so the bridge reads zero there. Any change in the physical quantity unbalances it.`,
      armNote: 'A sensor in R1 or R4 swings the output one way; in R2 or R3, the other.',
      configLabel: 'Bridge configuration',
      configs: {
        quarter: 'Quarter (1 active arm)',
        half: 'Half (2 active arms)',
        full: 'Full (4 active arms)',
      },
      configShort: {
        quarter: 'quarter',
        half: 'half',
        full: 'full',
      },
      configHow: {
        quarter:
          'Quarter bridge: one active sensor, three fixed completion resistors. Output ≈ V/4 · ΔR/R, and not quite linear, because only one divider moves and its own resistance change shifts its current.',
        half: 'Half bridge: two sensors in the same divider, changing in opposite directions (+Δ and −Δ), like a gauge on top of a bending beam in tension and one underneath in compression. Output ≈ V/2 · ΔR/R: twice the quarter bridge, and linear for a linear sensor. A change both sensors share (a temperature drift, say) cancels out.',
        full: 'Full bridge: all four arms are sensors. Opposite arms change together (+Δ), adjacent arms oppositely (−Δ). Output ≈ V · ΔR/R: four times the quarter bridge, linear for a linear sensor, and compensated for anything common to all four. This is how load cells and pressure sensors are built.',
      },
      activeArms: 'Active arms',
      armReading: (arm: string, sign: string, reading: string, r: string) =>
        `${arm} (${sign}): ${reading} → ${r}`,
      sensitivity: 'Sensitivity vs quarter bridge',
      openCircuit: 'Open-circuit output (no meter)',
      estimate: (k: string) => `Textbook estimate ${k}·V·ΔR/R`,
      loadNote:
        'The galvanometer (Rg) draws current and loads the bridge, so the real VB − VC is smaller than the open-circuit output the textbook formulas describe. Raise Rg and watch the two converge. The gap between the open-circuit output and the textbook estimate is the non-linearity.',
      compareLegend: 'all three configurations, the selected one bold',
      meterNote:
        "The meter's range is set by the full bridge, so the needle swings further as you add active arms.",
      resetReference: (reference: string) => `Back to reference (${reference})`,
      responseR: 'Sensor resistance',
      responseV: 'Bridge output VB − VC',
      logScale: 'log scale',
      referenceLegend: 'reference',
      responseAria: (sensor: string, reading: string, r: string, vout: string) =>
        `Response curves for the ${sensor}: sensor resistance and bridge output across the whole range. Current reading ${reading}: ${r}, bridge output ${vout}.`,
      illustrationAria: (sensor: string, reading: string, r: string) =>
        `Illustration of the ${sensor} at ${reading}, resistance ${r}.`,
      exaggerated: 'deformation exaggerated for visibility',
      tension: 'tension',
      compression: 'compression',
    },
  },
};

export type Messages = typeof en;
