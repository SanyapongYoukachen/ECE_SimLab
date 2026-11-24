'use client';

import type { ActuatorTab } from '@/lib/state/schemas';
import { TopicNav } from '@/components/ui';
import { ACTUATOR_TOPICS, topicPath } from '@/lib/topics';
import { DcMotor } from './dc-motor/DcMotor';
import { Stepper } from './stepper/Stepper';
import { Relay } from './relay/Relay';
import { ACTUATOR_LABELS } from './constants';

/** The actuator comes from the page's URL (/actuators/<topic>); each keeps its own URL state. */
export function ActuatorsModule({ topic }: { readonly topic: ActuatorTab }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <TopicNav
        label="Actuator"
        items={ACTUATOR_TOPICS.map((tp) => ({
          href: topicPath(tp),
          label: ACTUATOR_LABELS[tp.mode],
          current: tp.mode === topic,
        }))}
      />
      {topic === 'dcmotor' && <DcMotor />}
      {topic === 'stepper' && <Stepper />}
      {topic === 'relay' && <Relay />}
    </div>
  );
}
