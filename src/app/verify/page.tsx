import type { Metadata } from 'next';
import Link from 'next/link';
import { LanguageToggle, ThemeToggle } from '@/components/ui';
import { Localized } from '@/lib/i18n';
import VerifyForm from '@/components/verify/VerifyFormClient';

export const metadata: Metadata = {
  title: 'Verify an attempt code',
  description: 'Check that a check-your-understanding result and its screenshot are genuine.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/verify' },
};

export default function VerifyPage(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          >
            <Localized pick={(m) => m.common.home} />
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            <Localized pick={(m) => m.verify.title} />
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            <Localized pick={(m) => m.verify.intro} />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main>
        <VerifyForm />
      </main>
    </div>
  );
}
