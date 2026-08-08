import Link from 'next/link';
import { ThemeToggle } from '@/components/ui';

interface ModuleCard {
  readonly href: string;
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
}

const MODULES: readonly ModuleCard[] = [
  {
    href: '/convolution',
    kicker: 'Module 1',
    title: 'Convolution',
    description:
      'Watch a kernel flip and slide across a signal, sample by sample, with the arithmetic shown live.',
  },
  {
    href: '/fourier',
    kicker: 'Module 2',
    title: 'Fourier transform explorer',
    description:
      'Move a frequency off a bin centre and watch — and hear — its peak smear across the spectrum.',
  },
  {
    href: '/theorem',
    kicker: 'Module 3',
    title: 'The convolution theorem',
    description:
      'Two independent paths to the same answer, with a live operation count showing why one of them won.',
  },
];

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--plot-active)]">
            Signals Lab
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Convolution and the Fourier transform, made visible
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--foreground)]/70">
            You can already do the algebra. These three linked instruments are for the part algebra
            doesn&apos;t teach: what the operation actually does. Manipulate either representation
            and watch the other respond in real time.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <nav className="grid gap-4 sm:grid-cols-1">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            aria-label={m.title}
            className="group flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--plot-active)]"
          >
            <span
              className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50"
              aria-hidden="true"
            >
              {m.kicker}
            </span>
            <span
              className="text-xl font-medium text-[var(--foreground)] group-hover:text-[var(--plot-active)]"
              aria-hidden="true"
            >
              {m.title} →
            </span>
            <span className="text-sm text-[var(--foreground)]/70" aria-hidden="true">
              {m.description}
            </span>
          </Link>
        ))}
      </nav>

      <footer className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-6 text-sm text-[var(--foreground)]/60">
        <p>
          Every configuration — signal values, kernel, shift, window, amplitudes, frequencies —
          lives in the URL. Set it up, copy the link, and it reproduces exactly.
        </p>
        <p>
          Running a live lecture? Append <code className="font-mono text-xs">?predict=off</code> to
          any module URL to skip the prediction gate and unlock the controls immediately.
        </p>
      </footer>
    </div>
  );
}
