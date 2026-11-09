import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'rest-contact',
    question:
      'The coil draws current below the pull-in threshold. Which contact is the common pole resting on?',
    options: [
      { id: 'a', label: 'NC — normally closed', correct: true },
      { id: 'b', label: 'NO — normally open', correct: false },
      { id: 'c', label: 'Neither — it floats in the middle', correct: false },
      { id: 'd', label: 'Both at once', correct: false },
    ],
  },
  {
    id: 'pull-in',
    question:
      'You raise the coil voltage until coil current reaches the pull-in threshold. What happens?',
    options: [
      { id: 'a', label: 'Nothing, until it exceeds twice the threshold', correct: false },
      { id: 'b', label: 'The armature pulls in and switches onto NO', correct: true },
      { id: 'c', label: 'The coil burns out', correct: false },
      { id: 'd', label: 'The load circuit reverses direction', correct: false },
    ],
  },
  {
    id: 'independent-circuits',
    question: "Does the pull-in threshold depend on the load circuit's voltage or resistance?",
    options: [
      { id: 'a', label: 'Yes — a bigger load needs more pull-in current', correct: false },
      {
        id: 'b',
        label:
          'No — the coil and the load are electrically separate circuits; only coil current decides pull-in',
        correct: true,
      },
      { id: 'c', label: 'Only if the load resistance exceeds the coil resistance', correct: false },
      { id: 'd', label: 'Only for AC coils', correct: false },
    ],
  },
  {
    id: 'purpose',
    question: "What is a relay's main purpose, electrically?",
    options: [
      { id: 'a', label: 'To amplify the load voltage', correct: false },
      {
        id: 'b',
        label: 'To let a small coil current control a separate, often much larger, load current',
        correct: true,
      },
      { id: 'c', label: 'To convert AC to DC', correct: false },
      { id: 'd', label: 'To store energy like a capacitor', correct: false },
    ],
  },
];
