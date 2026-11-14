import type { PredictionQuestion } from '@/components/ui';

export const QUESTIONS: readonly PredictionQuestion[] = [
  {
    id: 'more-load',
    question:
      "You increase the load torque Tl while V, Ra, and K stay fixed. What happens to the motor's steady-state speed?",
    options: [
      { id: 'a', label: 'It increases', correct: false },
      { id: 'b', label: 'It decreases', correct: true },
      { id: 'c', label: 'It stays exactly the same', correct: false },
      { id: 'd', label: 'Speed is unrelated to load torque', correct: false },
    ],
  },
  {
    id: 'armature-loop',
    question: "At steady state, which equation balances the motor's electrical (armature) side?",
    options: [
      {
        id: 'a',
        label: 'V = I·Ra + Ke·ω — supply voltage = resistive drop + back-EMF',
        correct: true,
      },
      { id: 'b', label: 'V = I·ω', correct: false },
      { id: 'c', label: 'V = Ra / I', correct: false },
      { id: 'd', label: 'V depends only on Ke, not on I or ω', correct: false },
    ],
  },
  {
    id: 'unloaded-current',
    question:
      'An unloaded (Tl=0), frictionless (B=0) DC motor reaches its steady speed. What is the armature current at that point?',
    options: [
      {
        id: 'a',
        label: "Zero — there's no torque to produce, so no current is needed",
        correct: true,
      },
      { id: 'b', label: 'Maximum — the motor stalls', correct: false },
      { id: 'c', label: 'Equal to V / Ra', correct: false },
      { id: 'd', label: 'Undefined', correct: false },
    ],
  },
  {
    id: 'back-emf',
    question:
      'Back-EMF (Ke·ω) always opposes the supply voltage. What does this mean as the motor speeds up?',
    options: [
      { id: 'a', label: 'Current increases without bound', correct: false },
      {
        id: 'b',
        label: 'The net voltage driving current through Ra shrinks, so current self-limits',
        correct: true,
      },
      { id: 'c', label: 'The supply voltage also increases automatically', correct: false },
      { id: 'd', label: 'Back-EMF has no effect on current', correct: false },
    ],
  },
  {
    id: 'pwm-duty',
    question:
      'A 12 V supply drives the motor through a PWM switch at 50 % duty. With no load, roughly how fast does it spin compared with plain 12 V DC?',
    options: [
      { id: 'a', label: 'The same speed — the pulses are still 12 V', correct: false },
      {
        id: 'b',
        label: 'About half — the motor responds to the average voltage, 6 V',
        correct: true,
      },
      { id: 'c', label: 'A quarter — power goes with voltage squared', correct: false },
      { id: 'd', label: 'It does not turn until the duty reaches 100 %', correct: false },
    ],
  },
];
