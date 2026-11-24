import { AC_TOPICS } from './ac';
import { ACTUATOR_TOPICS } from './actuators';
import { CIRCUIT_TOPICS } from './circuits';
import { ELECTRONICS_TOPICS } from './electronics';
import type { Topic, TopicModule } from './types';

export * from './types';
export { AC_TOPICS } from './ac';
export { CIRCUIT_TOPICS } from './circuits';
export { ELECTRONICS_TOPICS } from './electronics';
export { ACTUATOR_TOPICS } from './actuators';

export const TOPICS: Readonly<Record<TopicModule, readonly Topic[]>> = {
  ac: AC_TOPICS,
  circuits: CIRCUIT_TOPICS,
  electronics: ELECTRONICS_TOPICS,
  actuators: ACTUATOR_TOPICS,
};

export function topicPath(topic: Pick<Topic, 'module' | 'slug'>): string {
  return `/${topic.module}/${topic.slug}`;
}

export function findTopic(module: TopicModule, slug: string): Topic | undefined {
  return TOPICS[module].find((t) => t.slug === slug);
}

/** The topic page that opens a module's section — for links and redirects from `?mode=` (`?tab=` on actuators). */
export function topicForMode(module: TopicModule, mode: string): Topic | undefined {
  return TOPICS[module].find((t) => t.mode === mode);
}

export function allTopics(): readonly Topic[] {
  return [...AC_TOPICS, ...CIRCUIT_TOPICS, ...ELECTRONICS_TOPICS, ...ACTUATOR_TOPICS];
}
