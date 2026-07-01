# Monetization plan

## The core framing: "more traffic = more money" — needs pushback

Traffic only converts to money through a monetization channel that's *already live*. Right now there are zero working payment rails — the sponsor slot is a mock checkout, no ads are installed, no tip jar exists. A traffic spike hitting an unmonetized site converts to zero dollars and a missed opportunity, since those visitors won't come back after the Final. Traffic is a *multiplier* on whatever channel is live before it decays, not a channel itself. Priority #1 is getting at least one payment rail working, then pushing traffic into it.

## 1. What can realistically turn around in days

- **Ko-fi / Buy Me a Coffee tip jar (fastest — do this first).** Ko-fi has no payout hold and pays instantly via Stripe/PayPal; setup is minutes once Stripe/PayPal identity verification clears (that verification can take hours to a few days — start it immediately). Frame it explicitly around the existing charity strip ("support the app, or we'll match/redirect a cut to [charity]") — this converts the current placeholder goodwill content into an actual ask instead of implying money is already going to those charities.
- **Real $100 sponsor slots — direct sales, not self-serve checkout.** Don't wait on payment integration. Cold-email/DM 15–30 sports-bars, local sportsbooks-adjacent brands (where legal), fantasy-sports tools, football gear shops, betting-odds comparison sites, or regional businesses wanting World Cup visibility. Take payment via a Stripe Payment Link or even Venmo/manual invoice — the mock checkout doesn't need to be wired up, a human needs to close 3–5 deals this week. Highest-probability "quick money" item since it doesn't depend on any ad network's review queue.
- **Premium features (private leagues, ad-free, deadline reminders)** behind a small one-time or per-tournament fee — buildable in days since bracket/email infra already exists; gate with Stripe Checkout.
- **Programmatic ad networks with low/no traffic gates.** Media.net offers review within days and has no hard traffic minimum, unlike Ezoic (now requires 250K monthly users unless grandfathered pre-Feb 2026) or AdSense (2–14 day review, frequently rejects brand-new sites/thin content). Adsterra/Monetag/PropellerAds approve fast with minimal traffic but are lower-quality/lower-CPM and can look spammy — acceptable only as a stopgap, not a long-term stack.

## 2. What looks like quick money but isn't

- **AdSense** — even at best-case 2–14 days, by the time approval lands the tournament may be near/at the Final; new sites are commonly rejected outright.
- **Ezoic** — effectively closed to this site now (250K monthly user minimum as of Feb 2026); the Incubator program for smaller sites can take months.
- **Payment processor edge cases** — Stripe account *activation* is often near-instant, but first *payout* typically lands 7–14 days after first payment. Fine for premium features (money still moves), but means the site can't rely on ad-network payout cycles (most pay net-30/net-60 minimum thresholds, e.g. $100) landing before the Final.
- **Affiliate networks generally** — most require an approved site with traffic history and take 1–4 weeks for application review — not a "this week" lever.

## Legal/risk callout — sports betting affiliate marketing

**Do not add sportsbook affiliate links or CPA/revenue-share betting deals without dedicated legal review.** Several states (Indiana, Pennsylvania, New Jersey, Illinois, Washington DC) require affiliates to hold state-specific licenses, with application fees from $500 to $10,000, and unlicensed promotion carries real regulatory exposure. Fantasy-sports/DFS affiliate programs are exempt from betting-affiliate licensing in most states and are a safer adjacent option if pursued at all — but even that should not be rushed into this week without checking each program's platform terms.

## This week — ranked action list

1. Cold-outreach 20+ prospects for real $100 sponsor slots; close via Stripe Payment Link, not the mock flow.
2. Stand up Ko-fi/Buy Me a Coffee tied to the charity messaging; start Stripe/PayPal identity verification today (the one multi-day dependency).
3. Ship one premium feature (private leagues or reminders) behind Stripe Checkout.
4. Apply to Media.net as an ad-revenue floor while sponsor outreach runs.
5. Skip AdSense/Ezoic/affiliate programs entirely for this cycle — review timelines exceed the remaining tournament window.

## Sources

- [Google AdSense Eligibility](https://support.google.com/adsense/answer/9724?hl=en)
- [Ezoic Requirements](https://support.ezoic.com/kb/article/getting-started-ezoics-requirements)
- [BettingUSA Affiliate Licensing](https://www.bettingusa.com/affiliate/)
- [Stripe New Account Approval](https://support.stripe.com/questions/new-stripe-account-approval-process)
- [Ko-fi vs Buy Me a Coffee 2026](https://talks.co/p/kofi-vs-buy-me-a-coffee/)
- [CPM Ad Networks for Small Publishers](https://reacheffect.com/blog/best-cpm-ad-networks-for-small-publishers/)
