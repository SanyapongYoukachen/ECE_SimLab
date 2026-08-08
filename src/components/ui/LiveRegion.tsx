'use client';

/**
 * A visually-hidden ARIA live region. Callers are responsible for throttling
 * how often `text` changes (e.g. once per animation step, not once per
 * frame) — assistive tech announces every update and a 60fps feed would be
 * unusable.
 */
export function LiveRegion({ text }: { readonly text: string }): React.JSX.Element {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
