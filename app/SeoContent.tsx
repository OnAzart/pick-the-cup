import { FAQ } from '@/lib/site';

/**
 * Server-rendered SEO content. Because the interactive bracket is a client
 * component, the initial HTML would otherwise be nearly text-free — crawlers
 * (and AI answer engines) would have almost nothing to index. This section
 * ships real, keyword-relevant copy and an FAQ in the server HTML, styled to
 * match the hero. It mirrors lib/site.ts FAQ so the visible answers and the
 * FAQPage structured data stay in sync.
 */

const DISPLAY = "var(--font-archivo-black), sans-serif";
const MONO = "var(--font-space-mono), monospace";

const STEPS = [
  {
    color: '#FF3D8B',
    title: 'Pick every match',
    body: 'Tap your winner in all 63 knockout games — Round of 32 through the Final. Picks auto-advance through the bracket.',
  },
  {
    color: '#2D6BFF',
    title: 'Crown your champion',
    body: 'Choose who lifts the trophy, then export a share card of your completed World Cup 2026 bracket.',
  },
  {
    color: '#14B87A',
    title: 'Challenge your friends',
    body: 'Send your link. Friends see your picks, build their own bracket, and climb the anonymous leaderboard.',
  },
];

export function SeoContent() {
  return (
    <section
      aria-label="About Pick The Cup"
      style={{
        borderTop: '3px solid #161616',
        background: '#FFFDF5',
        color: '#161616',
        padding: '56px 20px 72px',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#161616',
            color: '#fff',
            borderRadius: 999,
            padding: '7px 15px',
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.08em',
          }}
        >
          ⚽ FREE · NO SIGNUP
        </div>

        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,4.4vw,44px)', lineHeight: 1.02, margin: '16px 0 0', letterSpacing: '-.015em' }}>
          Make your free World Cup 2026 bracket
        </h2>
        <p style={{ maxWidth: 640, fontSize: 16.5, lineHeight: 1.6, color: '#56524b', margin: '14px 0 0' }}>
          Pick The Cup is a free, online <strong>FIFA World Cup 2026 bracket predictor</strong>. Predict every
          knockout match of the expanded 48-nation tournament — from the Round of 32 to the Final — crown your
          champion, and dare your friends to beat your picks. No account, no download, no cost. Build and share a
          complete World Cup bracket in under a minute.
        </p>

        {/* How it works */}
        <h3 style={{ fontFamily: DISPLAY, fontSize: 22, margin: '40px 0 0' }}>How it works</h3>
        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: 18,
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{
                background: '#fff',
                border: '3px solid #161616',
                borderRadius: 16,
                boxShadow: '4px 4px 0 #161616',
                padding: '18px 18px 20px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '2.5px solid #161616',
                  background: s.color,
                  color: '#fff',
                  fontFamily: DISPLAY,
                  fontSize: 16,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, margin: '12px 0 6px' }}>{s.title}</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.5, color: '#56524b', margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Scoring */}
        <h3 style={{ fontFamily: DISPLAY, fontSize: 22, margin: '44px 0 0' }}>How scoring works</h3>
        <p style={{ maxWidth: 640, fontSize: 16, lineHeight: 1.6, color: '#56524b', margin: '12px 0 0' }}>
          Scoring is round-weighted, so calling the deep rounds right matters most. A correct Round of 32 pick is
          worth 1 point, Round of 16 is worth 2, Quarterfinals 4, Semifinals 8, and nailing the Final is worth 16.
          Get everything right and you top out at a perfect <strong>84</strong>. As real matches finish, brackets
          lock and an anonymous leaderboard ranks every player against the actual results.
        </p>

        {/* FAQ */}
        <h3 style={{ fontFamily: DISPLAY, fontSize: 22, margin: '44px 0 8px' }}>
          Frequently asked questions
        </h3>
        <div>
          {FAQ.map((item) => (
            <div key={item.q} style={{ borderTop: '2px solid #e9e6dd', padding: '18px 0' }}>
              <h4 style={{ fontFamily: DISPLAY, fontSize: 16.5, margin: '0 0 8px' }}>{item.q}</h4>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#56524b', margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: MONO, fontSize: 11.5, color: '#9b978f', margin: '36px 0 0' }}>
          Built for the 2026 FIFA World Cup. Not affiliated with FIFA.
        </p>
      </div>
    </section>
  );
}
