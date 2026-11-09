import { Localized, MESSAGES, type Messages } from '@/lib/i18n';

type AboutPage = Exclude<
  keyof Messages['about'],
  'heading' | 'whatHeading' | 'conceptsHeading' | 'faqHeading'
>;

/**
 * Server-rendered prose under each module: what the simulator does, the
 * concepts it covers, and the questions students actually search for. The
 * interactive module renders client-side, so without this a crawler sees
 * little more than a title and "Loading module…". Both languages are in the
 * HTML (see <Localized>); CSS shows the reader's.
 */
export function ModuleAbout({ page }: { readonly page: AboutPage }): React.JSX.Element {
  // English sets the shape; th.ts carries the same number of entries.
  const en = MESSAGES.en.about[page];

  return (
    <section
      aria-labelledby={`about-${page}`}
      className="flex flex-col gap-5 border-t border-[var(--border)] pt-6 text-sm text-[var(--foreground)]/80"
    >
      <h2 id={`about-${page}`} className="text-lg font-semibold text-[var(--foreground)]">
        <Localized pick={(m) => m.about.heading} />
      </h2>
      <p className="max-w-3xl leading-relaxed">
        <Localized pick={(m) => m.about[page].intro} />
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-medium text-[var(--foreground)]">
            <Localized pick={(m) => m.about.whatHeading} />
          </h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
            {en.points.map((_, i) => (
              <li key={i}>
                <Localized pick={(m) => m.about[page].points[i]} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-[var(--foreground)]">
            <Localized pick={(m) => m.about.conceptsHeading} />
          </h3>
          <ul className="flex flex-wrap gap-2">
            {en.concepts.map((_, i) => (
              <li
                key={i}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs"
              >
                <Localized pick={(m) => m.about[page].concepts[i]} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-[var(--foreground)]">
          <Localized pick={(m) => m.about.faqHeading} />
        </h3>
        <dl className="flex flex-col gap-3">
          {en.faq.map((_, i) => (
            <div key={i}>
              <dt className="font-medium text-[var(--foreground)]">
                <Localized pick={(m) => m.about[page].faq[i].q} />
              </dt>
              <dd className="mt-0.5 leading-relaxed">
                <Localized pick={(m) => m.about[page].faq[i].a} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
