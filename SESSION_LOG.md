# Session log — 2026-07-01

Handoff notes for picking this back up in a fresh session. **No secrets in this file** (repo is public) — where a value matters, it says which Vercel env var holds it, not the value itself.

## App status

- Live at **pick-the-cup.vercel.app**, deployed on Vercel, GitHub repo `OnAzart/pick-the-cup` (public).
- Vercel project ID: `prj_KCNR2SyAjP1HltGhHKTrds0FQ26C`, team ID: `team_8AM39nrIXQtfr51RSILex14m`.
- Postgres (Neon, via Vercel Storage) connected. Results sync from football-data.org via a daily Vercel Cron (`vercel.json`, `0 6 * * *`) hitting `/api/cron/sync-results`, auth'd with `CRON_SECRET` env var. Can be triggered manually with `curl -H "Authorization: Bearer $CRON_SECRET" https://pick-the-cup.vercel.app/api/cron/sync-results`.
- 19 commits this session, all pushed to `main`, all verified `READY` with zero runtime errors via Vercel MCP after each deploy.

## What was built, roughly in order

1. **Repo cleanup** — added `.gitignore`, rewrote history to strip `node_modules`/`.next` that were committed from the start (GitHub was rejecting the push over a 116MB file).
2. **Backend merge** — pulled in `lib/db.ts`, `/api/cron/sync-results`, `/api/results` from a second "update" export: Postgres schema (`results`, `standings`, `sync_log`) + daily sync from football-data.org.
3. **Data integrity fixes (the big one)** — `app/data.ts`'s `TEAMS`/`GROUPS` were a fictional placeholder draw (11 real teams weren't even in the list). Deeper than that: the `KO` array's Round-of-32 topology (which group position plays which) was also fictional — verified the real FIFA draw via web search + cross-checked all 16 real matches against synced data, fixed the leaves (the R16-through-Final cascade wiring was already correct, only needed the R32 leaves fixed).
4. **`/api/locked`** — resolves real, already-decided results from Postgres and locks them into the bracket (non-editable), using a verified football-data.org match-ID mapping for Round of 32, then cascading into later rounds by matching team pairs against synced fixtures.
5. **Predictions persistence** — `predictions` table + `/api/predictions` (GET/POST), "Load bracket" button, confirmation emails via Resend.
6. **Sharing** — branded `og:image` (Next `next/og`/Satori), then a **personalized share image** showing the user's actual predicted "road to the title" (semifinalists → finalists → champion), matching the in-app champion modal's visual design exactly (bracket-style elbow connectors, checkmark on the winner). Instagram/Facebook buttons are **commented out** (not removed) — user reported they weren't working.
7. **Sponsors** — DB-driven `sponsors` table (was hardcoded), seeded with charity funds (United24, UAnimals, Come Back Alive, UNICEF, Red Cross) as placeholder content until real paid sponsors exist. `/api/sponsor-inquiry` stores real inquiries + sends notification/confirmation emails via Resend (`picks@openclaw-consulting.com`, domain verified).
8. **Caching** — `/api/locked`, `/api/results`, `/api/sponsors` use `Cache-Control` headers (`s-maxage`) instead of `force-dynamic`, since the underlying data only changes once/day via cron.
9. **Growth/monetization research** — `docs/00-executive-plan.md` through `docs/05-outreach-assets.md` (outreach targets doc not yet written to disk, see Pending below). Strategy: traffic-first, no SEO this cycle, sponsor slots sold *after* real traffic exists with dynamic pricing, not a cold flat-rate pitch.
10. **Bug fixes found along the way** (all pre-existing bugs from the original code, not introduced this session, except where noted):
    - Right-side bracket connector lines: `p > 0 && p % 2 === 0` should have been `p < matchIds.length - 1 && p % 2 === 0` — was silently dropping the first connector pair in every right-side column.
    - Lock-badge/blue-border on every locked cell was visually smothering the bracket once many results got locked — removed the badge/border, kept the actual non-editable enforcement.
    - Bracket centering: `margin: '0 auto'` didn't center reliably inside the `overflow-x: auto` scroll container on wide viewports → switched to `justify-content: center` on the container → **that** then clipped the left edge when content overflowed on narrower viewports (classic flex-centering-overflow gotcha) → fixed with `justify-content: safe center` (CSS spec's purpose-built fix for exactly this).
11. **"Save bracket image"** — client-side PNG export (via `html-to-image`, screenshots the real DOM rather than re-implementing the bracket in Satori a second time) at 4 scopes: full bracket / since Round of 16 / since Quarterfinals / Final only. No social posting needed.

## Known gotchas worth remembering

- **Satori (`next/og`'s renderer) limitations**, hit twice: (a) bare unicode glyphs like `✓` trigger a dynamic-font-fetch that can fail and silently abort the render mid-stream — use emoji (`✅`) instead, which routes through Twemoji successfully; (b) React fragments (`<>...</>`) break Satori's layout resolution — every group of siblings needs a real wrapping `<div>`.
- **`justify-content: safe center`** is the correct fix for "center content when it fits, but don't clip the start side when it overflows and needs to scroll" — plain `center` clips.
- **Next.js route handlers**: `export const revalidate = N` forces the route to execute at *build time* (fails without `POSTGRES_URL` locally, and isn't the right tool for DB-backed routes anyway) — use `Cache-Control` response headers instead for edge caching without build-time execution.
- **`html-to-image` beats re-implementing in Satori** for anything beyond a simple card — it screenshots the actual rendered DOM, so it can't drift from the live design and doesn't hit Satori's CSS subset limitations.
- Local dev has no `POSTGRES_URL`, so `/api/locked`/`/api/results`/etc. can't be exercised locally — verification for those happens against the live deployment via curl + Vercel MCP (`get_runtime_errors`, `list_deployments`). Playwright works locally for pure-frontend verification (`npm install --no-save playwright && npx playwright install chromium`); always `git checkout -- next-env.d.ts` after (it gets rewritten by `next dev` vs `next build`) and `npm uninstall playwright` when done since it's not a real dependency.

## Pending / not yet done

- `SPONSOR_NOTIFY_EMAIL` env var not set — sponsor inquiries are stored in Postgres either way, but no notification email goes out until this is added in Vercel.
- Referral-link tracking and creator-branded share cards (discussed as the two things the outreach plan depends on) — **not built yet**.
- Creator outreach research is done (real candidate list, contact methods, messaging templates, offer structure — all in this conversation's history) but **not yet saved to `docs/05-outreach-assets.md`** — worth writing that file in the next session if it's still wanted.
- `future.md` roadmap items (match dates, highlight-wrong-picks, leaderboard, scoring) — not started.
- Growth plan's Day 1-2 action items (Fiverr briefs, first content) are the user's own real-world actions, not code — not something I can verify from here.
