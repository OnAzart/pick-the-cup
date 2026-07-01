import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { TEAMS } from '@/app/data';

export const dynamic = 'force-dynamic';

const size = { width: 1200, height: 630 };

export async function GET(req: NextRequest) {
  const champCode = req.nextUrl.searchParams.get('champion');
  const team = champCode ? TEAMS[champCode] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFDF5',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#161616',
            color: '#fff',
            borderRadius: 999,
            padding: '12px 26px',
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          <span style={{ fontSize: 26 }}>🏆</span>
          FIFA WORLD CUP 2026 · PICK THE CUP
        </div>

        {team ? (
          <>
            <div style={{ display: 'flex', fontSize: 24, color: '#9b978f', marginTop: 34, letterSpacing: 3 }}>
              MY PREDICTED CHAMPION
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                marginTop: 18,
                background: 'linear-gradient(135deg,#FFD23C,#FFB01F)',
                border: '6px solid #161616',
                borderRadius: 28,
                padding: '26px 50px',
              }}
            >
              <span style={{ fontSize: 90 }}>{team.f}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 60, fontWeight: 900, color: '#161616' }}>{team.n}</div>
                <div style={{ display: 'flex', fontSize: 20, color: '#6b5a16', letterSpacing: 3, marginTop: 4 }}>
                  WORLD CHAMPION
                </div>
              </div>
              <span style={{ fontSize: 64 }}>👑</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, color: '#161616', marginTop: 32, textAlign: 'center' }}>
            Predict the entire World Cup
          </div>
        )}

        <div style={{ display: 'flex', fontSize: 24, color: '#56524b', marginTop: 32 }}>
          Build your bracket at pick-the-cup.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
