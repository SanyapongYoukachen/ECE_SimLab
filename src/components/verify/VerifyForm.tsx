'use client';

import { useState } from 'react';
import { MESSAGES, useLanguage, useMessages } from '@/lib/i18n';
import { decodeAttempt } from '@/lib/state/attemptCode';

/** Quiz module IDs → the landing-page module they belong to. */
const MODULE_KEY: Readonly<Record<string, string>> = {
  'simulator-wheatstone': 'simulator',
};

/**
 * Paste an attempt code and the student's name: the code decodes to the
 * result it was issued for, and the checksum says whether that name, score
 * and time are the ones it was sealed with.
 */
export function VerifyForm(): React.JSX.Element {
  const t = useMessages().verify;
  const lang = useLanguage();
  const [code, setCode] = useState(
    () => new URLSearchParams(window.location.search).get('code') ?? ''
  );
  const [name, setName] = useState('');
  const decoded = code.trim() ? decodeAttempt(code, name) : null;

  const modules = MESSAGES[lang].landing.modules as Readonly<Record<string, { title: string }>>;
  const fmt = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs text-[var(--foreground)]/60">{t.codeLabel}</span>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="XXXXXX-XXXXXX-XXXXXX"
          spellCheck={false}
          autoCapitalize="characters"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-base tracking-wider text-[var(--foreground)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs text-[var(--foreground)]/60">{t.nameLabel}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
        />
      </label>

      {code.trim() !== '' && decoded === null && (
        <p role="status" className="rounded-md border border-[var(--border)] p-3 text-sm">
          {t.notACode}
        </p>
      )}

      {decoded && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-md border p-4 text-sm"
          style={{
            borderColor: decoded.valid ? 'var(--plot-output)' : 'var(--plot-danger)',
          }}
        >
          <p
            className="text-base font-semibold"
            style={{ color: decoded.valid ? 'var(--plot-output)' : 'var(--plot-danger)' }}
          >
            {decoded.valid ? t.valid : t.invalid}
          </p>
          {decoded.valid ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-[var(--foreground)]/60">{t.module}</dt>
              <dd>
                {modules[MODULE_KEY[decoded.moduleId] ?? decoded.moduleId]?.title ??
                  decoded.moduleId}
              </dd>
              <dt className="text-[var(--foreground)]/60">{t.score}</dt>
              <dd className="font-mono">{t.scoreValue(decoded.score, decoded.total)}</dd>
              <dt className="text-[var(--foreground)]/60">{t.finished}</dt>
              <dd className="font-mono">{fmt.format(decoded.finishedAt)}</dd>
              <dt className="text-[var(--foreground)]/60">{t.timeTaken}</dt>
              <dd className="font-mono">
                {t.duration(Math.floor(decoded.durationS / 60), decoded.durationS % 60)}
              </dd>
            </dl>
          ) : (
            <p className="text-[var(--foreground)]/80">{t.invalidHelp}</p>
          )}
        </div>
      )}
      <p className="text-xs text-[var(--foreground)]/60">{t.limits}</p>
    </div>
  );
}
