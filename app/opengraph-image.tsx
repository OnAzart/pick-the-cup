import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
            gap: 16,
            background: '#161616',
            color: '#fff',
            borderRadius: 999,
            padding: '14px 30px',
            fontSize: 26,
            letterSpacing: 2,
          }}
        >
          <span style={{ fontSize: 32 }}>🏆</span>
          FIFA WORLD CUP 2026 · 48 NATIONS
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 900,
            marginTop: 34,
            color: '#161616',
            letterSpacing: -2,
          }}
        >
          PICK THE CUP
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#56524b',
            marginTop: 14,
          }}
        >
          Predict the entire World Cup knockout bracket
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginTop: 40,
          }}
        >
          {['#FF5A3C', '#2D6BFF', '#14B87A', '#FFC23C', '#FF3D8B'].map((c) => (
            <div key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '3px solid #161616' }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
