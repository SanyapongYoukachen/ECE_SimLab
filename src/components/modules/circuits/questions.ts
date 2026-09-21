import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'ohm-double-r',
    question:
      'A resistor sits across a fixed voltage V. You double R without changing V. What happens to the current I = V/R?',
    options: [
      { id: 'a', label: 'It doubles', correct: false },
      { id: 'b', label: 'It stays the same', correct: false },
      { id: 'c', label: "It's cut in half", correct: true },
      { id: 'd', label: 'It quadruples', correct: false },
    ],
  },
  {
    id: 'power-double-v',
    question:
      'You double the voltage V across a fixed resistor R. What happens to the power P = VI = V²/R?',
    options: [
      { id: 'a', label: 'It doubles', correct: false },
      { id: 'b', label: 'It quadruples', correct: true },
      { id: 'c', label: 'It stays the same', correct: false },
      { id: 'd', label: "It's cut in half", correct: false },
    ],
  },
  {
    id: 'series-current',
    question:
      'Two resistors are in series across a battery. Which quantity is the SAME through both of them?',
    options: [
      { id: 'a', label: 'Voltage', correct: false },
      { id: 'b', label: 'Current', correct: true },
      { id: 'c', label: 'Power', correct: false },
      { id: 'd', label: 'Resistance', correct: false },
    ],
  },
  {
    id: 'parallel-voltage',
    question:
      'Two resistors are in parallel across a battery. Which quantity is the SAME across both of them?',
    options: [
      { id: 'a', label: 'Current', correct: false },
      { id: 'b', label: 'Voltage', correct: true },
      { id: 'c', label: 'Power', correct: false },
      { id: 'd', label: 'Equivalent resistance', correct: false },
    ],
  },
  {
    id: 'divider-ratio',
    question:
      'In a voltage divider (R1 on top, R2 on bottom, Vout tapped between them), if R2 is much larger than R1, Vout is:',
    options: [
      { id: 'a', label: 'Close to 0 V', correct: false },
      { id: 'b', label: 'Close to the full source voltage V', correct: true },
      { id: 'c', label: 'Always exactly V/2, regardless of R1 and R2', correct: false },
      { id: 'd', label: 'Undefined', correct: false },
    ],
  },
];
