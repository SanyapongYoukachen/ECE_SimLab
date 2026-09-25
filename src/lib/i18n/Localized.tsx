import { MESSAGES, type Messages } from './messages';
import { LANGS } from './lang';

interface LocalizedProps {
  readonly pick: (m: Messages) => string;
}

/**
 * For server-rendered chrome (landing page, module headers), which can't
 * read the viewer's language during the server render. Renders every
 * language and lets CSS on <html data-lang> (set pre-paint by the layout's
 * init script) show one, so there is neither a hydration mismatch nor a
 * flash of English. Client components use `useMessages()` instead.
 */
export function Localized({ pick }: LocalizedProps): React.JSX.Element {
  return (
    <>
      {LANGS.map((lang) => (
        <span key={lang} lang={lang} data-l={lang}>
          {pick(MESSAGES[lang])}
        </span>
      ))}
    </>
  );
}
