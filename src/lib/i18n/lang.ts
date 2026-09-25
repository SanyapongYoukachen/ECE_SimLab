export type Lang = 'en' | 'th';

export const LANGS: readonly Lang[] = ['en', 'th'];

/** localStorage key for the viewer's explicit choice; absent means "follow the browser". */
export const LANG_KEY = 'signals-lab:lang';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'th';
}

/**
 * The language to show before (or without) an explicit choice: Thai for a
 * browser that prefers Thai, English otherwise. Kept dependency-free and
 * duplicated verbatim into the layout's pre-paint init script.
 */
export function detectLang(stored: string | null, navigatorLanguage: string | undefined): Lang {
  if (isLang(stored)) return stored;
  return navigatorLanguage?.toLowerCase().startsWith('th') ? 'th' : 'en';
}
