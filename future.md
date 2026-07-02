# Future work

1. ~~Add match dates to the bracket~~ — done 2026-07-02, see SESSION_LOG.md.
2. ~~Highlight what's wrong~~ — done 2026-07-02, see SESSION_LOG.md.
3. Add a leaderboard (rank users by bracket accuracy once emails/predictions are persisted). Identity display decided: anonymous rank only, no name/email shown. (Champion-modal email capture copy already says "& join the leaderboard" — UI is ahead of the backend here.)
4. Add scoring (points per correct pick, likely weighted by round — e.g. group winners worth less than a correct Final pick). Feeds the leaderboard above.
5. "Compare with a friend" — extend the existing personalized share link (`?semiLA=...&champion=...`) to a `?compare=<token>` mode showing two people's roads-to-the-title side by side. No new accounts needed, reuses share-image infra.
6. ~~Flag-color winner backgrounds + green/red win-lose ring on every match row~~ — done 2026-07-02, see SESSION_LOG.md.
7. ~~Lower share-unlock threshold to "4 semifinalists known" instead of full champion~~ — done 2026-07-02, see SESSION_LOG.md.
