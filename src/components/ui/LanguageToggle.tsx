'use client';

import { setLanguage, useLanguage, useMessages } from '@/lib/i18n';

/**
 * English <-> Thai. Labelled with the language it switches TO, written in
 * that language, so a reader who can't read the current one can still find
 * their way back.
 */
export function LanguageToggle(): React.JSX.Element {
  const lang = useLanguage();
  const t = useMessages();
  const next = lang === 'en' ? 'th' : 'en';

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      lang={next}
      aria-label={t.common.language.ariaLabel}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
    >
      {t.common.language.switchLabel}
    </button>
  );
}
