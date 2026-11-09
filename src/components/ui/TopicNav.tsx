'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface TopicNavItem {
  readonly href: string;
  readonly label: string;
  readonly current: boolean;
}

/**
 * A module's sections as links to their own topic pages, styled like the
 * segmented control they replace. Following one keeps the current query
 * string, so shared settings (frequency, resistor values) carry across.
 */
export function TopicNav({
  label,
  items,
}: {
  readonly label: string;
  readonly items: readonly TopicNavItem[];
}): React.JSX.Element {
  const router = useRouter();
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              onClick={(e) => {
                if (item.current || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                router.push(`${item.href}${window.location.search}`, { scroll: false });
              }}
              className={
                'block rounded px-3 py-1.5 text-sm transition-colors ' +
                (item.current
                  ? 'bg-[var(--surface)] font-medium text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]')
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
