import type { Lang } from '@/lib/i18n';

/**
 * A topic page: one search intent, one URL (`/<module>/<slug>`), the
 * module's simulator opened on that topic, and a server-rendered article
 * — what a search engine reads, since the simulator draws on canvas.
 */
export type TopicModule = 'ac' | 'circuits';

export interface TopicSection {
  readonly heading: string;
  readonly body: readonly string[];
  /** Displayed as a formula block. */
  readonly formulas?: readonly string[];
  readonly bullets?: readonly string[];
}

export interface TopicText {
  /** Short name: section tabs, hub cards, breadcrumbs. */
  readonly nav: string;
  readonly h1: string;
  /** One or two sentences under the H1. */
  readonly lead: string;
  /** Hub card description. */
  readonly card: string;
  readonly sections: readonly TopicSection[];
  /** A worked example with the simulator's default values. */
  readonly example: { readonly heading: string; readonly steps: readonly string[] };
  readonly mistakes: readonly string[];
  readonly faq: readonly { readonly q: string; readonly a: string }[];
}

export interface TopicSeo {
  /** ≤ ~60 characters; the " | ECE Labsim" suffix is added by the title template. */
  readonly title: string;
  /** ~150–160 characters. */
  readonly description: string;
  readonly keywords: readonly string[];
  readonly teaches: readonly string[];
}

export interface Topic<Mode extends string = string> {
  readonly module: TopicModule;
  readonly slug: string;
  /** The simulator section this page opens. */
  readonly mode: Mode;
  readonly seo: TopicSeo;
  readonly text: Readonly<Record<Lang, TopicText>>;
}
