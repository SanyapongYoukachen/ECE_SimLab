import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'length',
    question: 'x has 5 samples and h has 3 samples. How many samples will y = x * h have?',
    options: [
      { id: 'a', label: '5 — output matches the input length', correct: false },
      { id: 'b', label: '8 — output is the sum of both lengths', correct: false },
      { id: 'c', label: '7 — output is N + M − 1', correct: true },
      { id: 'd', label: '3 — output matches the shorter kernel', correct: false },
    ],
  },
  {
    id: 'commutative',
    question: 'Does it matter which signal you call x and which you call h?',
    options: [
      { id: 'a', label: 'Yes — swapping them changes the result', correct: false },
      { id: 'b', label: 'No — x * h = h * x, convolution is commutative', correct: true },
      { id: 'c', label: 'Only if both signals are the same length', correct: false },
      { id: 'd', label: 'Only for the rectangular kernel', correct: false },
    ],
  },
  {
    id: 'flip',
    question: 'In y[n] = Σ x[k]·h[n−k], what happens to the kernel as n increases?',
    options: [
      { id: 'a', label: "It's flipped once, then slid across the input", correct: true },
      { id: 'b', label: "It's slid across the input, never flipped", correct: false },
      { id: 'c', label: "It's flipped at every step but stays in place", correct: false },
      { id: 'd', label: 'Nothing — only the input moves', correct: false },
    ],
  },
  {
    id: 'rect-kernel',
    question: 'What does the rectangular kernel [0.33, 0.33, 0.33] compute at each shift?',
    options: [
      { id: 'a', label: 'A weighted average favouring the center sample', correct: false },
      { id: 'b', label: 'An unweighted moving average of 3 samples', correct: true },
      { id: 'c', label: 'The derivative of the input', correct: false },
      { id: 'd', label: 'The maximum of 3 neighbouring samples', correct: false },
    ],
  },
  {
    id: 'diff-kernel',
    question:
      'The difference kernel [1, −1] is convolved with a signal. What does the output show?',
    options: [
      { id: 'a', label: 'A smoothed version of the input', correct: false },
      {
        id: 'b',
        label: 'A discrete derivative — it highlights changes between neighbouring samples',
        correct: true,
      },
      { id: 'c', label: 'The running sum of the input', correct: false },
      { id: 'd', label: 'An exact copy of the input, shifted by one', correct: false },
    ],
  },
];
