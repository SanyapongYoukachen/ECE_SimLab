import Link from 'next/link';
import { LanguageToggle, ThemeToggle } from '@/components/ui';
import { Localized, type Messages } from '@/lib/i18n';

type ModuleKey = keyof Messages['landing']['modules'];

const MODULES: readonly { readonly href: string; readonly key: ModuleKey }[] = [
  { href: '/convolution', key: 'convolution' },
  { href: '/fourier', key: 'fourier' },
  { href: '/theorem', key: 'theorem' },
  { href: '/circuits', key: 'circuits' },
  { href: '/simulator', key: 'simulator' },
];

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
            <Localized pick={(m) => m.landing.kicker} />
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            <Localized pick={(m) => m.landing.title} />
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--foreground)]/70">
            <Localized pick={(m) => m.landing.intro} />
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <nav className="grid gap-4 sm:grid-cols-1">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
          >
            {/* The link's accessible name is just the title, in the active language. */}
            <span className="sr-only">
              <Localized pick={(msg) => msg.landing.modules[m.key].title} />
            </span>
            <span
              className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50"
              aria-hidden="true"
            >
              <Localized pick={(msg) => msg.landing.modules[m.key].kicker} />
            </span>
            <span
              className="text-xl font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]"
              aria-hidden="true"
            >
              <Localized pick={(msg) => msg.landing.modules[m.key].title} /> →
            </span>
            <span className="text-sm text-[var(--foreground)]/70" aria-hidden="true">
              <Localized pick={(msg) => msg.landing.modules[m.key].description} />
            </span>
          </Link>
        ))}
      </nav>

      <footer className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-6 text-sm text-[var(--foreground)]/60">
        <p>
          <Localized pick={(m) => m.landing.footerUrl} />
        </p>
        <p>
          <Localized pick={(m) => m.landing.footerPractice1} />{' '}
          <strong>
            <Localized pick={(m) => m.landing.footerPracticeStrong} />
          </strong>{' '}
          <Localized pick={(m) => m.landing.footerPractice2} />{' '}
          <code className="font-mono text-xs">?predict=off</code>{' '}
          <Localized pick={(m) => m.landing.footerPractice3} />
        </p>
      </footer>
    </div>
  );
}
