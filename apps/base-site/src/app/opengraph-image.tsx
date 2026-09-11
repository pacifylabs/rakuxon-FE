import { ImageResponse } from 'next/og';

/**
 * The default social-share card — applies to every route that does not
 * define its own `opengraph-image`/`twitter-image`, which today is every
 * route (Next wires this file into `og:image`/`twitter:image` automatically,
 * no per-page code needed).
 *
 * Built with `ImageResponse` rather than a static PNG so the brand colours
 * stay the single source of truth in `tokens.base.ts` — a palette change
 * updates this card without anyone remembering it exists.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COBALT = '#0038B8';
const CYAN = '#0090F8';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: `linear-gradient(135deg, ${COBALT} 0%, #041A66 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
              color: COBALT,
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#FFFFFF' }}>
            Rakuxon
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15 }}>
            Where Minds Meet Maps
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: CYAN, fontWeight: 500 }}>
            Your degree abroad, guided end to end.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.75)' }}>
          rakuxon.com
        </div>
      </div>
    ),
    { ...size },
  );
}
