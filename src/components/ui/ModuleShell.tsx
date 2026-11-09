import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { TelemetryExportButton } from './TelemetryExportButton';
import { PracticeModeToggle } from './PracticeModeToggle';
import { LanguageToggle } from './LanguageToggle';
import { ModuleAbout } from './ModuleAbout';
import { Localized } from '@/lib/i18n';
import type { Messages } from '@/lib/i18n';

interface ModuleShellProps {
  /** Which page's title/tagline to show, from the `pages` dictionary section. */
  readonly page: keyof Messages['pages'];
  readonly children: React.ReactNode;
  /** Topic pages: their own heading and lead instead of the module's. */
  readonly heading?: React.ReactNode;
  readonly tagline?: React.ReactNode;
  /** Trail above the heading, e.g. ECE Labsim › AC circuits. Replaces the plain home link. */
  readonly crumbs?: readonly { readonly href: string; readonly label: React.ReactNode }[];
  /** Below the content; defaults to the module's About section. */
  readonly footer?: React.ReactNode;
}

export function ModuleShell({
  page,
  children,
  heading,
  tagline,
  crumbs,
  footer,
}: ModuleShellProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {crumbs ? (
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--foreground)]/60">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden="true">›</span>}
                    <Link href={c.href} className="hover:text-[var(--foreground)]">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <Link
              href="/"
              className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            >
              <Localized pick={(m) => m.common.home} />
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {heading ?? <Localized pick={(m) => m.pages[page].title} />}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--foreground)]/70">
            {tagline ?? <Localized pick={(m) => m.pages[page].tagline} />}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PracticeModeToggle />
          <TelemetryExportButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-10">
        <div>{children}</div>
        {footer ?? <ModuleAbout page={page} />}
      </main>
    </div>
  );
}
