<div align="center">

# ⚽ Pick The Cup

### Predict the entire FIFA World Cup 2026 knockout stage — crown your champion, then dare your friends to beat your bracket.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

**[▶ Live demo](https://pick-the-cup.vercel.app)**

</div>

---

## What it is

Pick The Cup is an interactive knockout bracket for the 2026 FIFA World Cup. Tap your way from the Round of 32 to the Final, crown a champion, and get a personalized share card + challenge link to send to friends. As real matches finish, brackets lock and an anonymous leaderboard ranks everyone against reality using round-weighted scoring.

The whole thing is built as a viral loop with zero login friction:

> **view a friend's bracket → build your own → get your own challenge link → share it.**

## Features

- 🏆 **Full knockout bracket** — Round of 32 → Round of 16 → Quarters → Semis → 3rd place → Final, with team flags and auto-propagating picks.
- 🔗 **Challenge links & share cards** — every bracket encodes into a URL that renders a personalized OpenGraph image. A shared link *is* the challenge link — no accounts, no backend state.
- 📊 **Anonymous leaderboard** — saved brackets are scored against live results and ranked. Rank/score/champion only — no identities exposed.
- ⚖️ **Round-weighted scoring** — a correct pick is worth more the deeper the round. Points double per round (R32 = 1 → Final = 16); calling the Final right beats sweeping the Round of 32. Max score: **84**.
- 🔒 **Live locking** — as fixtures kick off and results land, decided matches lock so brackets can't be edited after the fact.
- 🔄 **Daily results sync** — a Vercel Cron job pulls real fixtures and winners from [football-data.org](https://www.football-data.org/) every morning.
- 💌 **Email confirmations** — optional "bracket saved" receipts and sponsor-inquiry notifications via [Resend](https://resend.com/).
- 💰 **Monetization built in** — sponsor slots, a sponsor-inquiry pipeline, and referral tracking for creator outreach.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Database | [Vercel Postgres](https://vercel.com/storage/postgres) |
| Email | [Resend](https://resend.com/) |
| Share images | [`html-to-image`](https://github.com/bubkoo/html-to-image) + dynamic OG routes |
| Results feed | [football-data.org](https://www.football-data.org/) API |
| Hosting | [Vercel](https://vercel.com/) (Cron for daily sync) |

## Getting started

**Prerequisites:** Node 20+ and a Postgres database (Vercel Postgres, or any `POSTGRES_URL`).

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
#    then fill in the values (see below)

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Postgres schema is created automatically on first API call.

### Environment variables

| Variable | Required | Purpose |
|---|:---:|---|
| `POSTGRES_URL` | ✅ | Postgres connection string (auto-injected by Vercel's Postgres integration). |
| `FOOTBALL_DATA_API_KEY` | ✅ | Free API key from [football-data.org](https://www.football-data.org/client/register) for live results. |
| `CRON_SECRET` | ✅ | Random secret guarding the sync cron route (Vercel sends it as `Authorization: Bearer …`). |
| `RESEND_API_KEY` | – | Enables confirmation & sponsor-inquiry emails. Emails are skipped silently if unset. |
| `RESEND_FROM_EMAIL` | – | Verified sender address. Falls back to Resend's sandbox sender. |
| `SPONSOR_NOTIFY_EMAIL` | – | Where new sponsor inquiries are emailed. Inquiries still persist to Postgres without it. |

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
app/
├── BracketApp.tsx        # the interactive bracket (client component)
├── data.ts               # teams, fixtures, bracket-propagation logic
├── page.tsx              # home + per-share dynamic OG metadata
├── opengraph-image.tsx   # default social preview
└── api/
    ├── predictions/      # save / load brackets
    ├── leaderboard/      # anonymous ranked standings
    ├── locked/           # real, already-decided bracket state
    ├── results/          # tournament results
    ├── share-image/      # dynamic bracket share card
    ├── referrals/        # creator referral tracking
    ├── sponsors/         # sponsor slots
    ├── sponsor-inquiry/  # inbound sponsor leads
    ├── track/            # lightweight analytics
    └── cron/sync-results # daily football-data.org sync (Vercel Cron)
lib/
├── db.ts        # Postgres schema + helpers
├── results.ts   # maps football-data.org fixtures → local bracket shape
├── scoring.ts   # round-weighted bracket scoring
├── ref.ts       # referral code handling
└── email.ts     # Resend integration
docs/            # growth & monetization research
marketing/       # launch playbook & per-platform copy
```

## Scoring

Points scale with how far into the tournament a match is — every round doubles the previous one:

| Round | Points / match | Matches | Subtotal |
|---|:---:|:---:|:---:|
| Round of 32 | 1 | 16 | 16 |
| Round of 16 | 2 | 8 | 16 |
| Quarterfinals | 4 | 4 | 16 |
| Semifinals | 8 | 2 | 16 |
| 3rd place | 4 | 1 | 4 |
| **Final** | **16** | 1 | 16 |
| | | | **84 max** |

A pick scores if it names the real winner — independent of whether your path to that match was right (standard bracket-pool scoring, so a correct champion counts even with a busted semifinal).

## Deployment

Deployed on Vercel. The daily results sync is wired via `vercel.json`:

```json
{ "crons": [ { "path": "/api/cron/sync-results", "schedule": "0 6 * * *" } ] }
```

Set the environment variables in the Vercel project settings, connect a Postgres store, and the schema self-initializes on first request.

---

<div align="center">
<sub>Built for the 2026 FIFA World Cup. Not affiliated with FIFA.</sub>
</div>
