# Session log

Handoff notes across sessions. **No secrets in this file** (repo is public) — where a value matters, it says which Vercel env var holds it, not the value itself.

Format: **Current state** (below) always reflects the latest known status — update it each session. **Sessions** further down is an append-only history: each entry gets a one-line summary, then details. Don't rewrite old entries; add a new one.

## Current state

- Live at **pick-the-cup.vercel.app**, deployed on Vercel, GitHub repo `OnAzart/pick-the-cup` (public).
- Vercel project ID: `prj_KCNR2SyAjP1HltGhHKTrds0FQ26C`, team ID: `team_8AM39nrIXQtfr51RSILex14m`.
- Postgres (Neon, via Vercel Storage) connected. Results sync from football-data.org via a daily Vercel Cron (`vercel.json`, `0 6 * * *`) hitting `/api/cron/sync-results`, auth'd with `CRON_SECRET` env var. Can be triggered manually with `curl -H "Authorization: Bearer $CRON_SECRET" https://pick-the-cup.vercel.app/api/cron/sync-results`.

### Known gotchas worth remembering

- **Satori (`next/og`'s renderer) limitations**, hit twice: (a) bare unicode glyphs like `✓` trigger a dynamic-font-fetch that can fail and silently abort the render mid-stream — use emoji (`✅`) instead, which routes through Twemoji successfully; (b) React fragments (`<>...</>`) break Satori's layout resolution — every group of siblings needs a real wrapping `<div>`.
- **`justify-content: safe center`** is the correct fix for "center content when it fits, but don't clip the start side when it overflows and needs to scroll" — plain `center` clips.
- **Next.js route handlers**: `export const revalidate = N` forces the route to execute at *build time* (fails without `POSTGRES_URL` locally, and isn't the right tool for DB-backed routes anyway) — use `Cache-Control` response headers instead for edge caching without build-time execution.
- **`html-to-image` beats re-implementing in Satori** for anything beyond a simple card — it screenshots the actual rendered DOM, so it can't drift from the live design and doesn't hit Satori's CSS subset limitations.
- Local dev has no `POSTGRES_URL`, so `/api/locked`/`/api/results`/etc. can't be exercised locally — verification for those happens against the live deployment via curl + Vercel MCP (`get_runtime_errors`, `list_deployments`). Playwright works locally for pure-frontend verification (`npm install --no-save playwright && npx playwright install chromium`); always `git checkout -- next-env.d.ts` after (it gets rewritten by `next dev` vs `next build`) and `npm uninstall playwright` when done since it's not a real dependency.

### Pending / not yet done

- `SPONSOR_NOTIFY_EMAIL` env var not set — sponsor inquiries are stored in Postgres either way, but no notification email goes out until this is added in Vercel.
- Referral-link tracking and creator-branded share cards (discussed as the two things the outreach plan depends on) — **not built yet**.
- Creator outreach research is done (real candidate list, contact methods, messaging templates, offer structure) but **not yet saved to `docs/05-outreach-assets.md`**.
- `future.md` roadmap items 1-2 (match dates, highlight-wrong-picks) shipped 2026-07-02 — see below. Items 3-4 (leaderboard, scoring) and a new "compare with a friend" idea are scoped in `future.md` but **not started**.
- Growth plan's Day 1-2 action items (Fiverr briefs, first content) are the user's own real-world actions, not code — not something verifiable from here.

## Sessions

### 2026-07-02

**Summary:** shipped `future.md` items 1-2 — kickoff dates and correct/wrong pick borders on the bracket. Discussed leaderboard/social-interaction ideas; decided leaderboard identity will be anonymous rank only (no name/email shown), deferred implementation.

Details:
1. **Kickoff dates** — `/api/locked` now also returns a `dates: Record<localId, isoString>` map. Round-of-32 dates resolve unconditionally (fixed FIFA schedule, doesn't need both teams known yet); later-round dates only resolve once the real team pair can be matched (same constraint the existing `picks` cascade already had). Rendered as a small label next to each match's ID (`app/BracketApp.tsx`), and the Final's previously-hardcoded `07/19/2026` now uses the live value with that hardcoded string as fallback.
2. **Correct/wrong pick borders** — the key discovery: `state.picks` (the user's own raw prediction, in `localStorage`) was never being overwritten by `locked.picks` (the real result) — only the *merged* view (`effPicks`) was. That meant the data needed to diff "what the user guessed" vs. "what actually happened" already existed; no schema or persistence change was needed, purely a frontend diff + border color (`app/BracketApp.tsx`'s new `pickVerdict()` helper). Border is green (`#14B87A`) if the user's own pick for that match equals the real winner, red (`#E5484D`) if it doesn't, and left plain black if the user never actually made a pick for that specific match (so a diverged bracket path doesn't get falsely marked wrong).
3. **Verification** — local dev has no `POSTGRES_URL` (per the gotcha above), so `/api/locked` 500s locally. Mocked it via Playwright's `page.route()` to return fake locked data (one correct pick, one wrong pick, both with dates) and confirmed visually: red border + strikethrough on the wrong guess, green + checkmark on the correct one, dates rendering under both match IDs and the Final. No regressions elsewhere in the bracket.

### 2026-07-01

**Summary:** merged the results-sync backend, fixed the bracket's real-world data integrity (fictional group draw + fictional Round-of-32 topology), built results-locking, sharing, sponsors, and a save-image export. 19 commits, all deployed and verified.

Details:
1. **Repo cleanup** — added `.gitignore`, rewrote history to strip `node_modules`/`.next` that were committed from the start (GitHub was rejecting the push over a 116MB file).
2. **Backend merge** — pulled in `lib/db.ts`, `/api/cron/sync-results`, `/api/results` from a second "update" export: Postgres schema (`results`, `standings`, `sync_log`) + daily sync from football-data.org.
3. **Data integrity fixes (the big one)** — `app/data.ts`'s `TEAMS`/`GROUPS` were a fictional placeholder draw (11 real teams weren't even in the list). Deeper than that: the `KO` array's Round-of-32 topology (which group position plays which) was also fictional — verified the real FIFA draw via web search + cross-checked all 16 real matches against synced data, fixed the leaves (the R16-through-Final cascade wiring was already correct, only needed the R32 leaves fixed).
4. **`/api/locked`** — resolves real, already-decided results from Postgres and locks them into the bracket (non-editable), using a verified football-data.org match-ID mapping for Round of 32, then cascading into later rounds by matching team pairs against synced fixtures.
5. **Predictions persistence** — `predictions` table + `/api/predictions` (GET/POST), "Load bracket" button, confirmation emails via Resend.
6. **Sharing** — branded `og:image` (Next `next/og`/Satori), then a **personalized share image** showing the user's actual predicted "road to the title" (semifinalists → finalists → champion), matching the in-app champion modal's visual design exactly (bracket-style elbow connectors, checkmark on the winner). Instagram/Facebook buttons are **commented out** (not removed) — user reported they weren't working.
7. **Sponsors** — DB-driven `sponsors` table (was hardcoded), seeded with charity funds (United24, UAnimals, Come Back Alive, UNICEF, Red Cross) as placeholder content until real paid sponsors exist. `/api/sponsor-inquiry` stores real inquiries + sends notification/confirmation emails via Resend (`picks@openclaw-consulting.com`, domain verified).
8. **Caching** — `/api/locked`, `/api/results`, `/api/sponsors` use `Cache-Control` headers (`s-maxage`) instead of `force-dynamic`, since the underlying data only changes once/day via cron.
9. **Growth/monetization research** — `docs/00-executive-plan.md` through `docs/04-viral-growth-tactics.md`. Strategy: traffic-first, no SEO this cycle, sponsor slots sold *after* real traffic exists with dynamic pricing, not a cold flat-rate pitch.
10. **Bug fixes found along the way** (all pre-existing bugs from the original code, not introduced this session, except where noted):
    - Right-side bracket connector lines: `p > 0 && p % 2 === 0` should have been `p < matchIds.length - 1 && p % 2 === 0` — was silently dropping the first connector pair in every right-side column.
    - Lock-badge/blue-border on every locked cell was visually smothering the bracket once many results got locked — removed the badge/border, kept the actual non-editable enforcement.
    - Bracket centering: `margin: '0 auto'` didn't center reliably inside the `overflow-x: auto` scroll container on wide viewports → switched to `justify-content: center` on the container → **that** then clipped the left edge when content overflowed on narrower viewports (classic flex-centering-overflow gotcha) → fixed with `justify-content: safe center` (CSS spec's purpose-built fix for exactly this).
11. **"Save bracket image"** — client-side PNG export (via `html-to-image`, screenshots the real DOM rather than re-implementing the bracket in Satori a second time) at 4 scopes: full bracket / since Round of 16 / since Quarterfinals / Final only. No social posting needed.
