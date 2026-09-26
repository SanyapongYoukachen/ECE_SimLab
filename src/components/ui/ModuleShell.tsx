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
}

export function ModuleShell({ page, children }: ModuleShellProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          >
            <Localized pick={(m) => m.common.home} />
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            <Localized pick={(m) => m.pages[page].title} />
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--foreground)]/70">
            <Localized pick={(m) => m.pages[page].tagline} />
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
        <ModuleAbout page={page} />
      </main>
    </div>
  );
}
