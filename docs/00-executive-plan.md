# Executive plan: quick money from Pick The Cup

**Window:** today (July 1) to the Final (July 19) — 18 days. Round of 16 starts July 7, quarterfinals July 11, semifinals July 15.

**Strategy (updated 2026-07-01): traffic first, no SEO, viral product.** Sponsor slots are sold *after* there's real traffic to show, priced dynamically off actual numbers instead of a guessed flat rate — a cold pitch with no proof is a hard sell; "we did 40k brackets this week, slots start at $X and rise with traffic" is an easy one. Passive monetization (tip jar) runs quietly in parallel from day one since it doesn't require selling anyone anything and doesn't compete with saving sponsor slots for later leverage. Nothing gates on monetization infra being ready — traffic/content starts immediately.

SEO is off the table entirely this cycle — a zero-authority site cannot rank against ESPN/CBS Sports in 18 days regardless of effort (see 02). That time goes into TikTok/Threads/YouTube and community seeding instead, which reward relevance and shares over domain age.

## Day 1–2 (today/tomorrow)

- [ ] Ship match dates/kickoff countdown on the bracket (near-zero effort, unlocks urgency messaging for everything else).
- [ ] Ship a lightweight "Challenge link" share flow — reuse the existing share-card image pipeline, no new group/DB model needed. This is the realistic 48-hour version of "private leagues" and the core viral loop: view → make bracket → get your own challenge link → share.
- [ ] Film 3–5 "I let [AI/creator] predict the whole World Cup" videos using the app live, plus reaction content to today's real Round of 32 results.
- [ ] Post 3–5 one-off briefs on Fiverr for US sports-niche UGC creators (cheapest entry point, $50–150/video) — see 04 for the full creator-marketplace comparison.
- [ ] Quietly start Stripe/Ko-fi identity verification in the background (multi-day dependency) — not blocking anything, just don't want it to be the bottleneck later when there's traffic to convert.

## Day 3–5

- [ ] Ship simple flat-points scoring (prerequisite for the leaderboard).
- [ ] DM 15–20 micro football-content creators (10K–100K followers, prioritize US-based) for duet-style "predict with me" posts — not scripted ads.
- [ ] Post daily reaction/upset content with the champion card visible on-screen, US timezone posting windows, American spelling/units in captions.
- [ ] Seed genuinely useful posts in r/soccer, r/worldcup, and country subreddits (free distribution, doubles as a long-tail discoverability channel even with SEO off the table).

## Week 2 (Round of 16 onward, July 7+)

- [ ] Ship the leaderboard — the single biggest retention/virality feature (return-visit trigger every time a round locks).
- [ ] Run TikTok/YouTube ads geo-targeted to the US behind whichever organic post is showing traction — cold organic virality without a seed audience essentially doesn't happen.
- [ ] **Once real traffic numbers exist**, open sponsor-slot sales with a dynamic price tied to actual visitor/share counts (not the old flat $100 mock price) — replaces cold outreach with an easy, numbers-backed pitch.
- [ ] Get Ko-fi live, tied explicitly to the existing charity-partner strip.
- [ ] Ship "highlight what's wrong" (lower priority — retention feature, less viral than the leaderboard).

## Hard no's this cycle

- **SEO / own-domain ranking** — no time budget at all; see 02 for why.
- **AdSense / Ezoic** — review timelines (days to months) risk outlasting the tournament; Ezoic now requires 250K monthly users regardless.
- **Sports-betting affiliate deals** — real per-state licensing exposure ($500–$10K+ fees in some states). Do not add without dedicated legal review.
- **Misleading clickbait titles/thumbnails** — both TikTok and YouTube actively detect and throttle title/content mismatches; this backfires specifically during the window when reach matters most.

See the linked docs for the full reasoning and sources behind each item.
