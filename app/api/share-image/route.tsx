import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { TEAMS } from '@/app/data';

export const dynamic = 'force-dynamic';

const size = { width: 1080, height: 820 };

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
        gap: 10,
        width: 190,
        height: 74,
        border: `4px solid #161616`,
        borderRadius: 18,
        background: '#fff',
        opacity: isOut ? 0.42 : 1,
        boxShadow: isOut ? 'none' : '5px 5px 0 #161616',
      }}
    >
      <span style={{ fontSize: 30 }}>{t?.flag ?? ''}</span>
      <span
        style={{
          fontSize: 24,
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
        gap: 10,
        width: 190,
        height: 74,
        border: '4px solid #161616',
        borderRadius: 18,
        background: isChampion ? '#17C988' : '#fff',
        opacity: isChampion ? 1 : 0.42,
        boxShadow: isChampion ? '5px 5px 0 #161616' : 'none',
      }}
    >
      <span style={{ fontSize: 30 }}>{t?.flag ?? ''}</span>
      <span style={{ fontSize: 24, fontWeight: 900, color: isChampion ? '#fff' : '#161616' }}>{t?.code ?? ''}</span>
    </div>
  );
}

function Connector() {
  return (
    <div style={{ display: 'flex', width: 190, justifyContent: 'center' }}>
      <div style={{ display: 'flex', width: 4, height: 26, background: '#161616' }} />
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
            width: 960,
            height: 740,
            background: '#FBF6E8',
            border: '8px solid #161616',
            borderRadius: 40,
            padding: '44px 46px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: '#9b978f' }}>FIFA WORLD CUP 2026</div>
            <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, color: '#FF3D8B', marginTop: 6 }}>
              🏆 MY ROAD TO THE TITLE
            </div>
          </div>

          {hasFullCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', fontSize: 20, letterSpacing: 4, color: '#9b978f', justifyContent: 'center', marginTop: 40 }}>
                SEMI-FINALISTS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <TeamChip code={semiLA} state={semiLA === semiLW ? 'active' : 'out'} />
                  <TeamChip code={semiLB} state={semiLB === semiLW ? 'active' : 'out'} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <TeamChip code={semiRA} state={semiRA === semiRW ? 'active' : 'out'} />
                  <TeamChip code={semiRB} state={semiRB === semiRW ? 'active' : 'out'} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
                <Connector />
                <Connector />
              </div>

              <div style={{ display: 'flex', fontSize: 20, letterSpacing: 4, color: '#9b978f', justifyContent: 'center' }}>
                FINALISTS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
                <FinalistChip code={semiLW} isChampion={semiLW === champCode} />
                <FinalistChip code={semiRW} isChampion={semiRW === champCode} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <div style={{ display: 'flex', width: 4, height: 26, background: '#161616' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    background: 'linear-gradient(135deg,#FFD23C,#FFB01F)',
                    border: '6px solid #161616',
                    borderRadius: 24,
                    padding: '20px 40px',
                    boxShadow: '6px 6px 0 #161616',
                  }}
                >
                  <span style={{ fontSize: 56 }}>{champ?.flag ?? '🏆'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, color: '#161616' }}>{champ?.name ?? '—'}</div>
                    <div style={{ display: 'flex', fontSize: 18, letterSpacing: 3, color: '#6b5a16', marginTop: 2 }}>
                      WORLD CHAMPION
                    </div>
                  </div>
                  <span style={{ fontSize: 44 }}>👑</span>
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
                fontSize: 40,
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
              borderTop: '3px solid #161616',
              paddingTop: 20,
              marginTop: 'auto',
            }}
          >
            <span style={{ display: 'flex', fontSize: 26, fontWeight: 900, color: '#161616' }}>PICK THE CUP</span>
            <span style={{ display: 'flex', fontSize: 20, color: '#9b978f' }}>#PickTheCup</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
