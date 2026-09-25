import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'balance-current',
    question:
      'A Wheatstone bridge is balanced when R1·R4 = R2·R3. At balance, the current through the galvanometer is:',
    options: [
      { id: 'a', label: 'Zero', correct: true },
      { id: 'b', label: 'Maximum', correct: false },
      { id: 'c', label: 'Equal to the total supply current', correct: false },
      { id: 'd', label: 'Undefined', correct: false },
    ],
  },
  {
    id: 'off-balance',
    question:
      'Starting from balance, you nudge R4 slightly higher (R1, R2, R3 unchanged). What happens to the galvanometer current?',
    options: [
      { id: 'a', label: 'It stays zero', correct: false },
      { id: 'b', label: 'A small nonzero current appears, in one direction', correct: true },
      { id: 'c', label: 'It becomes infinite', correct: false },
      { id: 'd', label: 'The bridge stops conducting entirely', correct: false },
    ],
  },
  {
    id: 'rg-independence',
    question: "Does the galvanometer's own resistance Rg affect where the balance point is?",
    options: [
      { id: 'a', label: 'Yes — a smaller Rg needs different resistor ratios', correct: false },
      {
        id: 'b',
        label: "No — the balance condition R1·R4 = R2·R3 doesn't depend on Rg at all",
        correct: true,
      },
      { id: 'c', label: 'Only if Rg exceeds 1 kΩ', correct: false },
      { id: 'd', label: 'Only for AC sources', correct: false },
    ],
  },
];
