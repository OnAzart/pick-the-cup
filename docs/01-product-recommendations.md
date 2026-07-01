# Product recommendations

**Context check:** Round of 32 runs through July 6, Round of 16 July 7–10, quarterfinals July 11–14, semifinals July 15–16, Final July 19. That's 18 days left, with a new round locking every 3–4 days — a compressed, recurring "deadline" cadence that's the app's single biggest asset. A direct competitor (a World Cup bracket predictor described as a "passion project that went viral") already ships private groups, invite-a-friend, and a weighted leaderboard (champion pick = 50 pts) — proof this exact model works in this exact niche right now.

## 1. future.md features, ranked by effort vs. impact

1. **Match dates/kickoff times — ship first (hours, not days).** Data already syncs from football-data.org; this is display-only. Low effort, and it's the *dependency* for every urgency mechanic below (countdowns, lock reminders).
2. **Simple scoring — ship next (1–2 days).** Don't build round-weighted scoring yet; ship flat points-per-correct-pick with a small final-round multiplier. It's a prerequisite for the leaderboard and for shareable "report card" mechanics.
3. **Leaderboard — highest virality/retention payoff, sequenced after scoring (2–3 days).** The single biggest social-proof and return-visit driver — gives users a reason to come back after every round locks, and "I'm #1 in my group" is inherently shareable. Ship global first; group-scoped comes with the challenge-link mechanic below.
4. **Highlight-wrong-picks — retention feature, lower urgency (3–4 days).** Valuable because it triggers a return visit the moment each round's results lock, but more UI/diffing work and less viral than the leaderboard. Sequence it last.

## 2. Viral mechanics worth adding beyond future.md

- **Private group/league brackets with invite links** — the proven mechanic (see competitor above). Highest-leverage addition overall: converts a solo prediction tool into a multiplayer competition, and every invite is a self-funded acquisition unit instead of a passive impression.
- **"Beat your friend" comparison share card** — reuse the existing branded share-card pipeline and add a variant rendering two brackets side by side with a score delta. Low incremental effort (the hard part already exists), high shareability.
- **Round-lock "report card" auto-share** — the moment each round's results are confirmed, auto-generate a personalized card ("I nailed 5/8 Round of 32 picks") and push it into the share flow. Turns the results-locking cadence into a recurring content trigger.
- **Kickoff countdown + lock reminder emails** — repurpose the existing "save your bracket" email capture for lifecycle nudges: "Round of 16 picks lock in 3 hours." Real deadlines convert better than fake countdown timers and cost almost nothing once match dates are live.
- **Streaks** — "3 correct picks in a row" badge, reinforcing the same round-cadence return loop as the report card.
- Referral unlocks are lower priority: gating *core* functionality behind referrals adds friction on top of the existing email-capture step — reserve unlocks for cosmetic rewards (group badge, bracket theme) if pursued at all.

## 3. Single highest-leverage 48-hour ship

Full private groups (membership tables, invite-link infra, group-scoped leaderboards) is more than a 48-hour build for a solo team. The realistic, high-leverage cut: **a shareable "Challenge" link per saved bracket** — no new group data model needed, just a unique URL tied to the existing email-saved bracket that renders a friend-facing comparison ("Sarah picked Brazil to win it all — make your bracket and see how you stack up"), landing on the existing share-card + save-to-email flow. This is the minimum viable version of the group mechanic, ships in the 48-hour window, and turns every share into a two-sided loop (view → make bracket → get your own challenge link → share) instead of a one-way broadcast. Pair it with match-date display (near-zero effort) so the challenge link also carries urgency ("Round of 16 locks in 6 days").

## Sources

- [2026 FIFA World Cup knockout stage - Wikipedia](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
- [FIFA World Cup 2026 knockout stage match schedule](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket)
- [TikTok Organic + Paid: A 2026 App Growth Playbook](https://semnexus.com/tiktok-organic-and-paid-a-2026-app-growth-playbook)
