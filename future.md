# Future work

1. ~~Add match dates to the bracket~~ — done 2026-07-02, see SESSION_LOG.md.
2. ~~Highlight what's wrong~~ — done 2026-07-02, see SESSION_LOG.md.
3. ~~Add a leaderboard~~ — done 2026-07-02 (second session), see SESSION_LOG.md. Anonymous rank only as decided: `/api/leaderboard` + a 🏅 Ranks modal (top 10, champion pick + score per row, gold "YOU #n of N" strip via saved email).
4. ~~Add scoring~~ — done 2026-07-02 (second session): round-weighted points in `lib/scoring.ts` (1/2/4/8 doubling per round, 3rd place 4, Final 16 — max 84).
5. ~~"Compare with a friend"~~ — done 2026-07-02 (second session), see SESSION_LOG.md. Built directly on the existing share params (no `?compare=` token needed): a shared link now shows a challenge banner, and the champion modal gains a "You vs. Your Friend" comparison.
6. ~~Flag-color winner backgrounds + green/red win-lose ring on every match row~~ — done 2026-07-02, see SESSION_LOG.md.
7. ~~Lower share-unlock threshold to "4 semifinalists known" instead of full champion~~ — done 2026-07-02, see SESSION_LOG.md.
