import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'off-bin',
    question:
      "You slide component 3's frequency so it lands exactly between two FFT bins. What happens in the spectrum?",
    options: [
      { id: 'a', label: 'A single peak, just shifted to the nearest bin', correct: false },
      { id: 'b', label: 'Energy spreads across several neighbouring bins', correct: true },
      { id: 'c', label: 'The peak disappears entirely', correct: false },
      { id: 'd', label: 'Nothing changes — bins are continuous', correct: false },
    ],
  },
  {
    id: 'on-bin',
    question: 'A sinusoid whose frequency lands exactly on an FFT bin centre produces:',
    options: [
      { id: 'a', label: 'A single, clean spectral peak', correct: true },
      { id: 'b', label: 'Energy smeared across many bins', correct: false },
      { id: 'c', label: 'No peak at all', correct: false },
      { id: 'd', label: 'A peak that drifts on every redraw', correct: false },
    ],
  },
  {
    id: 'window-tradeoff',
    question:
      'Why apply a window (Hann, Hamming, Blackman) before the FFT instead of leaving the signal rectangular?',
    options: [
      { id: 'a', label: 'It removes leakage completely', correct: false },
      {
        id: 'b',
        label: 'It reduces sidelobe leakage, at the cost of a slightly wider main lobe',
        correct: true,
      },
      { id: 'c', label: 'It increases the effective sample rate', correct: false },
      { id: 'd', label: 'It forces every frequency to land exactly on a bin', correct: false },
    ],
  },
  {
    id: 'nyquist',
    question:
      'The sample rate is 8000 Hz. What is the highest frequency the spectrum can represent (the Nyquist limit)?',
    options: [
      { id: 'a', label: '8000 Hz', correct: false },
      { id: 'b', label: '4000 Hz', correct: true },
      { id: 'c', label: '2000 Hz', correct: false },
      { id: 'd', label: '16000 Hz', correct: false },
    ],
  },
  {
    id: 'rect-window',
    question: 'What is the "rectangular window" actually doing to the signal?',
    options: [
      { id: 'a', label: 'A special taper that eliminates leakage', correct: false },
      {
        id: 'b',
        label:
          'Nothing — it is no window at all, just a hard cutoff at the edges of the observation, which is what causes leakage in the first place',
        correct: true,
      },
      { id: 'c', label: 'It only affects amplitude 1’s component', correct: false },
      { id: 'd', label: 'It is mathematically identical to the Hann window', correct: false },
    ],
  },
];
