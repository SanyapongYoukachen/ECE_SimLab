import Link from 'next/link';
import { LANGS, MESSAGES } from '@/lib/i18n';
import { topicPath, type Topic, type TopicText } from '@/lib/topics';

/**
 * The topic's article, server-rendered in both languages (CSS on
 * <html data-lang> shows one; see <Localized>): explanation, formulas, a
 * worked example with the simulator's numbers, common mistakes and FAQ —
 * the crawlable substance of the page — then links to the module's other
 * topics.
 */
export function TopicArticle({
  topic,
  siblings,
}: {
  readonly topic: Topic;
  readonly siblings: readonly Topic[];
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-6 border-t border-[var(--border)] pt-6">
      {LANGS.map((lang) => (
        <div key={lang} lang={lang} data-l={lang}>
          <Article text={topic.text[lang]} labels={MESSAGES[lang].topic} />
        </div>
      ))}
      <nav aria-labelledby="more-topics" className="flex flex-col gap-2">
        {LANGS.map((lang) => (
          <h2
            key={lang}
            id={lang === 'en' ? 'more-topics' : undefined}
            lang={lang}
            data-l={lang}
            className="text-base font-semibold text-[var(--foreground)]"
          >
            {MESSAGES[lang].topic.more(MESSAGES[lang].landing.modules[topic.module].title)}
          </h2>
        ))}
        <ul className="flex flex-wrap gap-2">
          {siblings
            .filter((s) => s.slug !== topic.slug)
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={topicPath(s)}
                  className="inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {LANGS.map((lang) => (
                    <span key={lang} lang={lang} data-l={lang}>
                      {s.text[lang].nav}
                    </span>
                  ))}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </section>
  );
}

function Article({
  text,
  labels,
}: {
  readonly text: TopicText;
  readonly labels: (typeof MESSAGES)['en']['topic'];
}): React.JSX.Element {
  return (
    <article className="flex max-w-3xl flex-col gap-6 text-sm leading-relaxed text-[var(--foreground)]/85">
      {text.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{s.heading}</h2>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.formulas && (
            <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)]">
              {s.formulas.join('\n')}
            </pre>
          )}
          {s.bullets && (
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{text.example.heading}</h2>
        <ol className="flex list-decimal flex-col gap-1 pl-5 font-mono text-[13px] text-[var(--foreground)]">
          {text.example.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{labels.mistakes}</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {text.mistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{labels.faq}</h2>
        {text.faq.map((f) => (
          <div key={f.q}>
            <h3 className="font-medium text-[var(--foreground)]">{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
