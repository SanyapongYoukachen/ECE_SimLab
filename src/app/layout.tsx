import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Thai } from 'next/font/google';
import Script from 'next/script';
import { LANG_KEY } from '@/lib/i18n/lang';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Geist has no Thai glyphs; this sits after it in the font stack so Latin
// text keeps Geist and Thai falls through to a matching sans.
const notoSansThai = Noto_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai'],
});

export const metadata: Metadata = {
  title: 'Signals Lab — Convolution & the Fourier Transform',
  description:
    'An interactive teaching instrument for convolution and the discrete Fourier transform, built for undergraduate signals courses.',
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem('signals-lab:theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

// Same logic as detectLang() in lib/i18n/lang.ts, inlined so it runs before
// first paint: <Localized> chrome keys off data-lang via CSS.
const LANG_INIT_SCRIPT = `
(function () {
  var lang = 'en';
  try {
    var stored = window.localStorage.getItem('${LANG_KEY}');
    if (stored === 'en' || stored === 'th') {
      lang = stored;
    } else if ((navigator.language || '').toLowerCase().indexOf('th') === 0) {
      lang = 'th';
    }
  } catch (e) {}
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);
})();
`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable} h-full antialiased`}
      // The init script rewrites lang/data-lang before hydration.
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Script id="lang-init" strategy="beforeInteractive">
          {LANG_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
