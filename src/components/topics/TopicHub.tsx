import Link from 'next/link';
import { LANGS, MESSAGES } from '@/lib/i18n';
import { topicPath, type Topic } from '@/lib/topics';

/**
 * A module's hub: one card per topic page. Server-rendered links, so search
 * engines find every topic from the module page and the sitemap.
 */
export function TopicHub({ topics }: { readonly topics: readonly Topic[] }): React.JSX.Element {
  return (
    <nav aria-label="Topics" className="flex flex-col gap-3">
      {LANGS.map((lang) => (
        <p key={lang} lang={lang} data-l={lang} className="text-sm text-[var(--foreground)]/70">
          {MESSAGES[lang].topic.hubIntro}
        </p>
      ))}
      <ol className="grid gap-3 sm:grid-cols-2">
        {topics.map((t, i) => (
          <li key={t.slug}>
            <Link
              href={topicPath(t)}
              className="group flex h-full flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]"
            >
              <span className="font-mono text-xs text-[var(--foreground)]/50">{i + 1}</span>
              {LANGS.map((lang) => (
                <span key={lang} lang={lang} data-l={lang} className="flex flex-col gap-1">
                  <span className="text-base font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">
                    {t.text[lang].nav} →
                  </span>
                  <span className="text-sm text-[var(--foreground)]/70">{t.text[lang].card}</span>
                </span>
              ))}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
