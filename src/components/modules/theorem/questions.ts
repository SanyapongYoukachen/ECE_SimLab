import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'doubling-n',
    question:
      'You double the signal length N. How does the operation count change for each method?',
    options: [
      { id: 'a', label: 'Both roughly double', correct: false },
      {
        id: 'b',
        label: 'Direct roughly quadruples; FFT barely more than doubles',
        correct: true,
      },
      { id: 'c', label: 'Direct doubles; FFT quadruples', correct: false },
      { id: 'd', label: 'Neither changes', correct: false },
    ],
  },
  {
    id: 'complexity-class',
    question:
      'Direct convolution of two length-N signals costs O(N²). FFT-based convolution costs approximately:',
    options: [
      { id: 'a', label: 'O(N²) also — the same order', correct: false },
      { id: 'b', label: 'O(N log N)', correct: true },
      { id: 'c', label: 'O(N)', correct: false },
      { id: 'd', label: 'O(log N)', correct: false },
    ],
  },
  {
    id: 'why-they-agree',
    question: 'Why do the direct and FFT-based paths produce (almost) identical output?',
    options: [
      { id: 'a', label: "They don't — the FFT path is only an approximation", correct: false },
      {
        id: 'b',
        label:
          'Multiplying spectra and taking the inverse FFT is mathematically equivalent to convolving in time; floating-point error is the only difference',
        correct: true,
      },
      { id: 'c', label: 'The FFT path secretly falls back to direct convolution', correct: false },
      { id: 'd', label: 'They only agree when N is a power of two', correct: false },
    ],
  },
  {
    id: 'crossover',
    question: 'As N grows very large, which method eventually wins on operation count?',
    options: [
      { id: 'a', label: 'Direct convolution — fewer steps per element', correct: false },
      {
        id: 'b',
        label: 'FFT-based convolution, because O(N log N) grows far slower than O(N²)',
        correct: true,
      },
      { id: 'c', label: 'They stay tied forever', correct: false },
      { id: 'd', label: 'Neither — cost is independent of N', correct: false },
    ],
  },
  {
    id: 'output-length',
    question:
      'Both paths convolve two length-N signals (x and h are the same length here). What is the length of the result?',
    options: [
      { id: 'a', label: 'N', correct: false },
      { id: 'b', label: '2N − 1', correct: true },
      { id: 'c', label: 'N²', correct: false },
      { id: 'd', label: 'N / 2', correct: false },
    ],
  },
];
