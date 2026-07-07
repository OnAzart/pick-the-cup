/**
 * Single source of truth for site-wide SEO/branding constants.
 *
 * Swap the production domain by setting NEXT_PUBLIC_SITE_URL in the environment
 * (e.g. https://pickthecup.com). Everything — metadata, canonical URLs, sitemap,
 * robots, structured data — reads from here, so switching to a real domain later
 * is a one-line env change with no code edits.
 */

const RAW_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pick-the-cup.vercel.app';

/** Canonical origin, no trailing slash. */
export const SITE_URL = RAW_URL.replace(/\/+$/, '');

export const SITE_NAME = 'Pick The Cup';

export const SITE_TAGLINE = 'World Cup 2026 Prediction Bracket';

export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  'Fill out your free FIFA World Cup 2026 bracket. Predict every knockout match from the Round of 32 to the final, crown your champion, and challenge friends to beat your picks — no signup required.';

/** Keyword set targeting real World Cup bracket search intent. */
export const SITE_KEYWORDS = [
  'world cup 2026 bracket',
  'world cup bracket predictor',
  'fifa world cup 2026 predictions',
  'make your world cup bracket',
  'world cup 2026 knockout bracket',
  'predict world cup 2026',
  'world cup bracket challenge',
  'free world cup bracket maker',
  'world cup bracket 2026 online',
  'world cup prediction game',
];

/** Absolute URL helper. `path` should start with "/". */
export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * FAQ used both in the visible on-page section and in FAQPage JSON-LD.
 * Keep answers plain-text (no markup) — they're injected into structured data.
 */
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'How does Pick The Cup work?',
    a: 'Tap your winner in every knockout match of the 2026 FIFA World Cup — from the Round of 32 all the way to the Final. Your picks auto-propagate through the bracket, you crown a champion, and you get a personalized share card and challenge link to send to friends.',
  },
  {
    q: 'Is it free to make a World Cup 2026 bracket?',
    a: 'Yes. Pick The Cup is completely free and there is no signup or account required. You can build and share a full World Cup 2026 bracket in under a minute.',
  },
  {
    q: 'How is my bracket scored?',
    a: 'Scoring is round-weighted: correct picks are worth more the deeper the round. Round of 32 picks are worth 1 point, Round of 16 worth 2, Quarterfinals 4, Semifinals 8, and calling the Final correctly is worth 16. The maximum possible score is 84.',
  },
  {
    q: 'When do brackets lock?',
    a: 'Matches lock as they kick off. Once real results land, decided matches can no longer be edited, so brackets are scored fairly against the actual World Cup results.',
  },
  {
    q: 'Can I challenge my friends?',
    a: 'Yes. Every bracket encodes into a shareable link. Sending that link is the challenge — friends open it, see your picks, then build their own bracket to try to beat your score on the anonymous leaderboard.',
  },
  {
    q: 'What is the format of the 2026 FIFA World Cup?',
    a: 'The 2026 FIFA World Cup features 48 nations and an expanded knockout stage that begins with a Round of 32, followed by the Round of 16, Quarterfinals, Semifinals, a third-place playoff, and the Final.',
  },
];
