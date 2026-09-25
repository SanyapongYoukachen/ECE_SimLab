import type { PredictionQuestion } from '@/components/ui/PredictionGate';
import type { Lang } from './lang';

export type LocalizedText = Readonly<Record<Lang, string>>;

/**
 * A prediction question with every language side by side, so the answer
 * ids and `correct` flags are defined once rather than per translation.
 */
export interface LocalizedQuestion {
  readonly id: string;
  readonly question: LocalizedText;
  readonly options: readonly {
    readonly id: string;
    readonly label: LocalizedText;
    readonly correct: boolean;
  }[];
}

export function localizeQuestions(
  bank: readonly LocalizedQuestion[],
  lang: Lang
): PredictionQuestion[] {
  return bank.map((q) => ({
    id: q.id,
    question: q.question[lang],
    options: q.options.map((o) => ({ id: o.id, label: o.label[lang], correct: o.correct })),
  }));
}
