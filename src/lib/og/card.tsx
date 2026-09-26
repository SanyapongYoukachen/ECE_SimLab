import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/seo';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/**
 * The social preview card (LINE, Facebook, Discord, X…), drawn in the
 * site's own palette: deep navy, the blue/vermilion/emerald band, one
 * headline. Rendered at build time by each route's opengraph-image.tsx.
 */
export function ogCard({
  kicker,
  title,
  subtitle,
}: {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
}): ImageResponse {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#101326',
        color: '#e8eaf4',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', height: 14 }}>
        <div style={{ flex: 1, background: '#3987e5' }} />
        <div style={{ flex: 1, background: '#d95926' }} />
        <div style={{ flex: 1, background: '#199e70' }} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '0 80px',
        }}
      >
        <div
          style={{ fontSize: 30, letterSpacing: 4, color: '#a5b4fc', textTransform: 'uppercase' }}
        >
          {kicker}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginTop: 20 }}>{title}</div>
        <div style={{ fontSize: 34, color: '#b8bdd3', marginTop: 28, lineHeight: 1.35 }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 80px 44px',
          fontSize: 26,
          color: '#8e95b3',
        }}
      >
        <span>Free · interactive · runs in your browser</span>
        <span>{host}</span>
      </div>
    </div>,
    OG_SIZE
  );
}
