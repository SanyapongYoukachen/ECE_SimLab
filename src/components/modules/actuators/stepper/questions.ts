import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'discrete',
    question: 'What fundamentally distinguishes a stepping motor from a DC motor?',
    options: [
      { id: 'a', label: 'It spins faster', correct: false },
      {
        id: 'b',
        label: 'It moves in discrete, known angle increments rather than spinning continuously',
        correct: true,
      },
      { id: 'c', label: 'It has no coils', correct: false },
      { id: 'd', label: 'It only works on AC power', correct: false },
    ],
  },
  {
    id: 'half-step',
    question:
      'Switching from full-step to half-step mode, with the same number of coils, does what?',
    options: [
      { id: 'a', label: 'Halves the motor speed', correct: false },
      {
        id: 'b',
        label: 'Doubles the angular resolution — twice as many positions per revolution',
        correct: true,
      },
      { id: 'c', label: 'Reverses the direction of rotation', correct: false },
      { id: 'd', label: 'Nothing changes', correct: false },
    ],
  },
  {
    id: 'reverse',
    question: 'How do you reverse a stepping motor’s direction?',
    options: [
      { id: 'a', label: 'Increase the supply voltage', correct: false },
      {
        id: 'b',
        label: 'Step through the same coil sequence in the opposite order',
        correct: true,
      },
      { id: 'c', label: 'Swap which coil is labeled A', correct: false },
      { id: 'd', label: 'It cannot be reversed once started', correct: false },
    ],
  },
  {
    id: 'rpm',
    question:
      'You double the step rate (steps/sec) without changing anything else. What happens to RPM?',
    options: [
      { id: 'a', label: 'It stays the same', correct: false },
      { id: 'b', label: 'It doubles', correct: true },
      { id: 'c', label: 'It quadruples', correct: false },
      { id: 'd', label: 'It is cut in half', correct: false },
    ],
  },
];
