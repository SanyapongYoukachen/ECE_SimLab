'use client';

import { useState } from 'react';
import type { PredictionQuestion } from './PredictionGate';

/**
 * Picks one random question from a module's bank for practice-mode gating.
 * Stable for the component's lifetime (the index is picked once, at mount)
 * so the options don't shuffle out from under a student mid-answer — but
 * re-read from `questions` each render, so switching language re-labels the
 * same question rather than keeping a stale translation.
 */
export function usePracticeQuestion(questions: readonly PredictionQuestion[]): PredictionQuestion {
  const [index] = useState(() => Math.floor(Math.random() * questions.length));
  return questions[index];
}
