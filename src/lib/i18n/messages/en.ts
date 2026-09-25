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
      checkRight: 'Matches what you just saw above.',
      checkWrong: 'Worth another look at the panels above.',
      gateDialog: 'Predict before you explore',
      gateKicker: 'Predict first',
      gateRight: 'Watch it play out below to confirm.',
      gateWrong: 'Watch what actually happens below.',
      continue: 'Continue',
    },
  },

  landing: {
    kicker: 'Signals Lab',
    title: 'Signals and circuits, made visible',
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
      theorem: {
        kicker: 'Module 3',
        title: 'The convolution theorem',
        description:
          'Two independent paths to the same answer, with a live operation count showing why one of them won.',
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
    theorem: {
      title: 'The convolution theorem: two paths, one answer',
      tagline:
        "Drag the length slider up and watch the direct method's cost curve pull away from the FFT's.",
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

  theorem: {
    presets: {
      smooth: 'Smooth',
      noisy: 'Noisy',
      pulse: 'Pulse',
    },
    liveText: (len: number, direct: string, fft: string, err: string) =>
      `Length ${len}. Direct: ${direct} operations. FFT: ${fft} operations. Maximum error between the two paths: ${err}.`,
    agreement: 'Agreement between the two paths',
    directOps: 'Direct operations',
    fftOps: 'FFT operations',
    ratio: 'Operation ratio',
    outputLength: 'Output length',
    lengthSlider: 'Signal length N (x and h are both this long)',
    signalShape: 'Signal shape',
    legendDirect: 'x * h, computed directly',
    legendFft: 'IFFT(FFT(x) · FFT(h)) — dashed, should trace the same curve',
    overlayAria:
      'Direct convolution and FFT-based convolution results overlaid — they should be visually indistinguishable.',
    costDirect: 'direct: O(N·M) operations',
    costFft: 'FFT-based: O(N log N) operations',
    costAria: (maxN: number, n: number) =>
      `Operation count versus signal length, up to N=${maxN}. Direct convolution grows quadratically; the FFT path grows almost flat by comparison. Current length: ${n}.`,
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
      schematicAria: (ig: string, balanced: boolean, needle: string) =>
        `Wheatstone bridge schematic. Galvanometer current ${ig}, bridge is ${
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
      fixedR: 'Each fixed arm',
      bridgeOut: 'Bridge output VB − VC',
      meterRange: 'Meter full scale (auto)',
      referenceNote: (reference: string, r: string) =>
        `The three fixed arms equal the sensor's resistance at ${reference} (${r}), so the bridge reads zero there. Any change in the physical quantity unbalances it.`,
      armNote: 'A sensor in R1 or R4 swings the output one way; in R2 or R3, the other.',
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
