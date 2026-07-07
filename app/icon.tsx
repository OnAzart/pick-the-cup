import { ImageResponse } from 'next/og';

// Branded app icon (served at /icon and auto-linked in <head>). Matches the
// cream/black hero palette so PWA installs and search results look on-brand.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        <div style={{ fontSize: 340, lineHeight: 1 }}>🏆</div>
      </div>
    ),
    { ...size },
  );
}
