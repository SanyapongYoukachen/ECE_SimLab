import { JsonLd, ModuleShell } from '@/components/ui';
import { LANGS, Localized } from '@/lib/i18n';
import { topicJsonLd } from '@/lib/seo';
import { TOPICS, type Topic } from '@/lib/topics';
import { TopicArticle } from './TopicArticle';

/**
 * A topic page: the module's simulator opened on one topic, under the
 * topic's own heading and breadcrumb, with its article below.
 */
export function TopicPage({
  topic,
  children,
}: {
  readonly topic: Topic;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const both = (pick: (lang: (typeof LANGS)[number]) => string): React.ReactNode =>
    LANGS.map((lang) => (
      <span key={lang} lang={lang} data-l={lang}>
        {pick(lang)}
      </span>
    ));
  return (
    <ModuleShell
      page={topic.module}
      heading={both((lang) => topic.text[lang].h1)}
      tagline={both((lang) => topic.text[lang].lead)}
      crumbs={[
        { href: '/', label: 'ECE Labsim' },
        {
          href: `/${topic.module}`,
          label: <Localized pick={(m) => m.landing.modules[topic.module].title} />,
        },
      ]}
      footer={<TopicArticle topic={topic} siblings={TOPICS[topic.module]} />}
    >
      {topicJsonLd(topic).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      {children}
    </ModuleShell>
  );
}
