import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { TelemetryExportButton } from './TelemetryExportButton';
import { PracticeModeToggle } from './PracticeModeToggle';

interface ModuleShellProps {
  readonly title: string;
  readonly tagline: string;
  readonly children: React.ReactNode;
}

export function ModuleShell({ title, tagline, children }: ModuleShellProps): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          >
            ← Signals Lab
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--foreground)]/70">{tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <PracticeModeToggle />
          <TelemetryExportButton />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
