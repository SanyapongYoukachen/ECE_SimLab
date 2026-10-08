import { AC_TOPICS } from './ac';
import { CIRCUIT_TOPICS } from './circuits';
import type { Topic, TopicModule } from './types';

export * from './types';
export { AC_TOPICS } from './ac';
export { CIRCUIT_TOPICS } from './circuits';

export const TOPICS: Readonly<Record<TopicModule, readonly Topic[]>> = {
  ac: AC_TOPICS,
  circuits: CIRCUIT_TOPICS,
};

export function topicPath(topic: Pick<Topic, 'module' | 'slug'>): string {
  return `/${topic.module}/${topic.slug}`;
}

export function findTopic(module: TopicModule, slug: string): Topic | undefined {
  return TOPICS[module].find((t) => t.slug === slug);
}

/** The topic page that opens a module's section — for links and redirects from `?mode=`. */
export function topicForMode(module: TopicModule, mode: string): Topic | undefined {
  return TOPICS[module].find((t) => t.mode === mode);
}

export function allTopics(): readonly Topic[] {
  return [...AC_TOPICS, ...CIRCUIT_TOPICS];
}
