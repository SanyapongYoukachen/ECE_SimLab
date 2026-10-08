'use client';

import { ElectronicsStateSchema, type ElectronicsState } from '@/lib/state/schemas';
import {
  decodeElectronicsState,
  decodePredictFlag,
  encodeElectronicsState,
} from '@/lib/state/urlState';
import { useUrlFlag, useUrlSyncedState } from '@/lib/state/useUrlState';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
import {
  ModuleTabs,
  PredictionGate,
  TopicNav,
  usePracticeMode,
  usePracticeQuestion,
} from '@/components/ui';
import { ELECTRONICS_TOPICS, topicPath } from '@/lib/topics';
import { JunctionSection } from './JunctionSection';
import { DiodeSection } from './DiodeSection';
import { BjtSection } from './BjtSection';
import { AmpSection } from './AmpSection';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = ElectronicsStateSchema.parse({});
const MODULE_ID = 'electronics';

export function ElectronicsModule({
  topic,
}: {
  readonly topic: ElectronicsState['mode'];
}): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const t = useMessages().electronics;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const [urlState, setState] = useUrlSyncedState(
    decodeElectronicsState,
    encodeElectronicsState,
    DEFAULT_STATE
  );
  // The section comes from the page's URL (/electronics/<topic>).
  const state: ElectronicsState = { ...urlState, mode: topic };
  const set = <K extends keyof ElectronicsState>(key: K, value: ElectronicsState[K]): void =>
    setState((prev) => ({ ...prev, [key]: value }));

  const content = (
    <div className="flex flex-col gap-4">
      <TopicNav
        label={t.navLabel}
        items={ELECTRONICS_TOPICS.map((tp) => ({
          href: topicPath(tp),
          label: t.modes[tp.mode as ElectronicsState['mode']],
          current: tp.mode === topic,
        }))}
      />
      {topic === 'pn' ? (
        <JunctionSection state={state} set={set} />
      ) : topic === 'diode' ? (
        <DiodeSection state={state} set={set} />
      ) : topic === 'bjt' ? (
        <BjtSection state={state} set={set} />
      ) : (
        <AmpSection state={state} set={set} />
      )}
    </div>
  );

  if (!practiceMode) {
    return (
      <ModuleTabs moduleId={MODULE_ID} questions={questions} disabled={!predictEnabled}>
        {content}
      </ModuleTabs>
    );
  }
  return (
    <PredictionGate
      moduleId={MODULE_ID}
      disabled={!predictEnabled}
      question={practiceQuestion.question}
      options={practiceQuestion.options}
      persist={false}
    >
      {content}
    </PredictionGate>
  );
}
