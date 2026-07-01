import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { TEAMS } from '@/app/data';

export const dynamic = 'force-dynamic';

// Standard OG/Twitter card ratio (1.91:1) — a non-standard ratio gets
// pillarboxed/cropped by platform link-preview frames (iMessage, X, etc.).
const size = { width: 1200, height: 630 };

const CHIP_WIDTH = 148;
const CHIP_GAP = 14;
const PAIR_WIDTH = CHIP_WIDTH * 2 + CHIP_GAP;
const CARD_CONTENT_WIDTH = 1028; // 1120 card width - 2*46 padding

function team(code: string | null) {
  if (!code) return null;
  const t = TEAMS[code];
  return { code, name: t?.n ?? code, flag: t?.f ?? '' };
}

// Mirrors the "road to the title" card in the in-app champion modal.
function TeamChip({ code, state }: { code: string | null; state: 'active' | 'out' }) {
  const t = team(code);
  const isOut = state === 'out';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: CHIP_WIDTH,
        height: 54,
        border: '3px solid #161616',
        borderRadius: 14,
        background: '#fff',
        opacity: isOut ? 0.42 : 1,
        boxShadow: isOut ? 'none' : '4px 4px 0 #161616',
      }}
    >
      <span style={{ fontSize: 22 }}>{t?.flag ?? ''}</span>
      <span
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: '#161616',
          textDecoration: isOut ? 'line-through' : 'none',
        }}
      >
        {t?.code ?? ''}
      </span>
    </div>
  );
}

function FinalistChip({ code, isChampion }: { code: string | null; isChampion: boolean }) {
  const t = team(code);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: CHIP_WIDTH,
        height: 54,
        border: '3px solid #161616',
        borderRadius: 14,
        background: isChampion ? '#17C988' : '#fff',
        opacity: isChampion ? 1 : 0.42,
        boxShadow: isChampion ? '4px 4px 0 #161616' : 'none',
      }}
    >
      <span style={{ fontSize: 22 }}>{t?.flag ?? ''}</span>
      <span style={{ fontSize: 18, fontWeight: 900, color: isChampion ? '#fff' : '#161616' }}>{t?.code ?? ''}</span>
      {isChampion && <span style={{ display: 'flex', fontSize: 16 }}>✅</span>}
    </div>
  );
}

// Bracket-style "elbow" connector: two stems down from a pair of boxes,
// merging into a single horizontal bar, then one stem down to the next box.
// Built with pure flexbox centering (no absolute + percentage transforms —
// that combination doesn't render reliably under Satori/next-og) — each
// half of `width` centers its own stem, which lands exactly under the
// corresponding box because the box row above uses the same halving.
function Elbow({ width }: { width: number }) {
  const half = width / 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', width: half, justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: 3, height: 9, background: '#161616' }} />
        </div>
        <div style={{ display: 'flex', width: half, justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: 3, height: 9, background: '#161616' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: half, height: 3, background: '#161616' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: 3, height: 9, background: '#161616' }} />
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const champCode = p.get('champion');
  const semiLA = p.get('semiLA');
  const semiLB = p.get('semiLB');
  const semiLW = p.get('semiLW');
  const semiRA = p.get('semiRA');
  const semiRB = p.get('semiRB');
  const semiRW = p.get('semiRW');
  const champ = team(champCode);

  const hasFullCard = champCode && semiLA && semiLB && semiLW && semiRA && semiRB && semiRW;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFDF5',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1120,
            height: 566,
            background: '#FBF6E8',
            border: '6px solid #161616',
            borderRadius: 30,
            padding: '22px 46px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 16, letterSpacing: 3, color: '#9b978f' }}>FIFA WORLD CUP 2026</div>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, color: '#FF3D8B', marginTop: 4 }}>
              🏆 MY ROAD TO THE TITLE
            </div>
          </div>

          {hasFullCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', fontSize: 14, letterSpacing: 3, color: '#9b978f', justifyContent: 'center', marginTop: 26 }}>
                SEMI-FINALISTS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
                <div style={{ display: 'flex', gap: CHIP_GAP }}>
                  <TeamChip code={semiLA} state={semiLA === semiLW ? 'active' : 'out'} />
                  <TeamChip code={semiLB} state={semiLB === semiLW ? 'active' : 'out'} />
                </div>
                <div style={{ display: 'flex', gap: CHIP_GAP }}>
                  <TeamChip code={semiRA} state={semiRA === semiRW ? 'active' : 'out'} />
                  <TeamChip code={semiRB} state={semiRB === semiRW ? 'active' : 'out'} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Elbow width={PAIR_WIDTH} />
                <Elbow width={PAIR_WIDTH} />
              </div>

              <div style={{ display: 'flex', fontSize: 14, letterSpacing: 3, color: '#9b978f', justifyContent: 'center' }}>
                FINALISTS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
                <FinalistChip code={semiLW} isChampion={semiLW === champCode} />
                <FinalistChip code={semiRW} isChampion={semiRW === champCode} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Elbow width={CARD_CONTENT_WIDTH} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'linear-gradient(135deg,#FFD23C,#FFB01F)',
                    border: '4px solid #161616',
                    borderRadius: 18,
                    padding: '10px 26px',
                    boxShadow: '4px 4px 0 #161616',
                  }}
                >
                  <span style={{ fontSize: 34 }}>{champ?.flag ?? '🏆'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: '#161616' }}>{champ?.name ?? '—'}</div>
                    <div style={{ display: 'flex', fontSize: 12, letterSpacing: 2, color: '#6b5a16', marginTop: 1 }}>
                      WORLD CHAMPION
                    </div>
                  </div>
                  <span style={{ fontSize: 28 }}>👑</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
                color: '#161616',
                textAlign: 'center',
              }}
            >
              Predict the entire World Cup
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid #161616',
              paddingTop: 10,
              marginTop: 'auto',
            }}
          >
            <span style={{ display: 'flex', fontSize: 18, fontWeight: 900, color: '#161616' }}>PICK THE CUP</span>
            <span style={{ display: 'flex', fontSize: 14, color: '#9b978f' }}>#PickTheCup</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
