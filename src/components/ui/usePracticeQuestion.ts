'use client';

import { useState } from 'react';
import type { PredictionQuestion } from './PredictionGate';

/**
 * Picks one random question from a module's bank for practice-mode gating.
 * Stable for the component's lifetime (picked once, at mount) so the
 * options don't shuffle out from under a student mid-answer.
 */
export function usePracticeQuestion(questions: readonly PredictionQuestion[]): PredictionQuestion {
  const [question] = useState(() => questions[Math.floor(Math.random() * questions.length)]);
  return question;
}
