# STATE — session handoff
_Last updated: 2026-07-08_

## In flight
- SEO pass landed (branch `update-readme`, **uncommitted**). Technical + on-page SEO
  implemented and verified in prod-build HTML. Not yet committed/deployed.

## Next actions (off-site — only the user can do these)
1. **Deploy** the branch (or merge to `main`) so the new routes go live on Vercel.
2. **Google Search Console**: add the property, verify via the `HTML tag` method →
   paste the token into Vercel env var `GOOGLE_SITE_VERIFICATION`, redeploy, then
   submit `https://pick-the-cup.vercel.app/sitemap.xml`.
3. **(Recommended) real domain**: buy one, point DNS at Vercel, set env
   `NEXT_PUBLIC_SITE_URL=https://<domain>` — all SEO switches over in one place.
4. **Distribution > SEO for this cycle** (see `docs/02-seo-assessment.md`): a new
   domain can't rank competitive World Cup terms in the ~11 days left before the
   final. Real traffic this cycle comes from Reddit/short-form video, not Google.
   The SEO work here is correctness + a 2030-cycle / evergreen investment.

## Pending decisions
- Whether to buy a real domain now vs. stay on vercel.app.

## What was built (files)
- `lib/site.ts` — single source of truth; swappable domain via `NEXT_PUBLIC_SITE_URL`.
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.tsx` (generated 512 icon).
- `app/JsonLd.tsx` — WebApplication + WebSite + Organization + SportsEvent + FAQPage.
- `app/SeoContent.tsx` — server-rendered, keyword-rich copy + FAQ (fixes the
  client-only empty-HTML problem — the biggest ranking lever).
- `app/layout.tsx` — canonical, keywords, robots directives, OG/Twitter, theme-color,
  env-driven Search Console verification.
- `app/page.tsx` — renders SeoContent + JsonLd after the bracket.

## Environment gotchas (carry every session)
- Whole bracket UI is `app/BracketApp.tsx` (`'use client'`) → keep crawlable text in
  server components (`SeoContent`, `JsonLd`), never rely on client render for SEO.
- Prod build verified with `PORT=3111 npm run start` + `curl` (no DB needed for home
  SSR / robots / sitemap / manifest / icon).
