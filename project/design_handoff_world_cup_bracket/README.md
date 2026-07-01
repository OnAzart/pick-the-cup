# Handoff: Pick The Cup — World Cup 2026 Prediction Bracket

## Overview
**Pick The Cup** is a fun, shareable web app where fans predict the entire FIFA World Cup 2026 knockout stage. A user fills the Round of 32 from group-scoped dropdowns, then taps winners through Round of 16 → Quarters → Semis → Final (picks auto-advance up the bracket). Crowning a champion triggers a celebration + a shareable "road to the title" card for Instagram / X / Threads / Facebook, plus an email capture that feeds a round-weighted leaderboard. A sponsor strip + "Become a sponsor" modal monetize the page.

The aesthetic is **"Stadium Confetti"**: bright, celebratory, sticker-bold — thick black outlines, hard offset shadows (`Npx Npx 0 #161616`), rounded cards, confetti accents, a carnival palette.

## About the Design Files
The files in `design_files/` are **design references created as self-contained HTML prototypes** — they show the intended look, layout, and interaction behavior. They are **not production code to ship directly**. The `.dc.html` files use a small in-house rendering runtime (`support.js`) with inline-styled templates and a `Component` logic class; treat that as a *specification of structure + behavior*, not a framework to adopt.

**Your task:** recreate these designs in a real codebase using its established patterns. If starting fresh, **Next.js (App Router) on Vercel** is the recommended target (pairs cleanly with Vercel Postgres + serverless functions, and the prototype logic is already client-friendly React-style). Port the inline styles to the project's styling system (Tailwind or CSS Modules) and the `Component` classes to React components/hooks.

How to view the prototypes: open any `.dc.html` in `design_files/` directly in a browser (they need network access for Google Fonts). `Pick The Cup.dc.html` is the product; `Bracket Lab.dc.html` and `Share Cards.dc.html` are concept/explorations for the leaderboard, sponsor slots, and share-card variants.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, layout, and interactions. Recreate the UI pixel-closely using the codebase's libraries. Exact hex values, fonts, and the bracket data model are specified below.

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Ink / outline | `#161616` | All borders, text, hard shadows |
| Page bg | `#FFFDF5` | App background (warm off-white) |
| Card cream | `#FBF6E8` | Share card / funnel background |
| Royal blue | `#2D6BFF` | Header bar, primary accents, sponsor banner |
| Pink | `#FF3D8B` | Primary CTA, section accents |
| Green (win) | `#17C988` | Advancing/winning team rows |
| Green alt | `#14B87A` | Email send, "advances" tags |
| Gold a / b | `#FFD23C` → `#FFB01F` | Champion gradient (135deg) |
| Gold flat | `#FFC23C` | Progress bar fill, logo chip, shadows accent |
| Amber text | `#B8860B` / `#6b5a16` | Wildcard / champion subtitle text |
| Muted text | `#56524b` | Body copy |
| Faint text | `#9b978f` | Labels, captions |
| Confetti set | `#FF5A3C` `#2D6BFF` `#14B87A` `#FFC23C` `#FF3D8B` | Falling confetti |
| Dim loser | white box, `opacity: .40–.42`, `text-decoration: line-through` | Eliminated teams |

### Typography (Google Fonts)
- **Archivo Black** — display headings, team names, logo wordmark.
- **Archivo** (400–900) — body, buttons, UI labels (weights 700/800/900 common).
- **Space Mono** (400/700) — eyebrow labels, captions, monospace metadata, `#PickTheCup`.
- Champion name 21px Archivo Black; section H2 ~30px Archivo Black; hero H1 `clamp(36px,6.4vw,64px)`.

### Shape & Elevation
- Border radius: cards `16–20px`, rows/boxes `9–14px`, pills/progress `999px`.
- Borders: `2px`–`3px` solid `#161616` everywhere.
- Signature shadow: **hard offset, no blur** — `3px 3px 0 #161616`, `4px 4px 0 #161616`, `5px 5px 0 #161616`, hero `8px 8px 0 #161616`. Some accent shadows use gold: `3px 3px 0 #FFC23C`.
- Spacing scale used: 6 / 8 / 9 / 11 / 14 / 16 / 18 / 20 / 22 / 26 px.

### Keyframe animations
- `wcfloat` — confetti bob: translateY(-7px) + rotate(10deg), 3–3.7s ease-in-out infinite.
- `conffall` — confetti fall: translateY(-30px)→112vh + rotate 720deg, 2.6–5.2s linear, random delay.
- `wcpulse` — champion flag pulse: scale(1)→scale(1.18).
- Winner row background transitions `background .15s`.

---

## Screens / Views

### 1. Landing Hero (`Pick The Cup`, top of page)
- **Purpose:** Sell the concept and push the user into the bracket.
- **Layout:** Full-width, centered, max-width 920px, padding `42px 20px 46px`, bottom border `3px #161616`. Floating confetti dots absolutely positioned. Scrolls away (not sticky).
- **Components:**
  - Eyebrow pill: black `#161616`, white text, `999px`, Space Mono 11px — "🏆 FIFA WORLD CUP 2026 · 48 NATIONS".
  - H1 Archivo Black `clamp(36px,6.4vw,64px)`, line-height .96: "Predict the entire World Cup."
  - Sub-paragraph 16.5px `#56524b`, max-width 540px.
  - Primary CTA button: pink `#FF3D8B`, white text, `3px #161616` border, `4px 4px 0 #161616` shadow, radius 14px, "⚽ Build my bracket →" → smooth-scrolls to `#bracket`.
  - Secondary button: white bg, gold shadow, "🎲 Surprise me" → autofills + opens champion modal.
  - Trust row: Space Mono 12px faint — "✓ Free & instant · ✓ No signup to play · ✓ 64 picks to glory".

### 2. Sticky Header (all of `Pick The Cup`)
- **Purpose:** Persistent progress + global actions.
- **Layout:** `position:sticky; top:0; z-index:30`, royal blue `#2D6BFF`, `3px #161616` bottom border, max-width 1320px inner, flex-wrap, floating confetti.
- **Components:** gold logo chip "🏆" + "PICK THE CUP" wordmark + Space Mono subtitle; a **progress bar** (rounded, gold fill, width = `picks/64 * 100%`, min 2%) with "X / 64 PICKS" label; buttons **Reset**, **🎲 Surprise me**, **📲 Share** (Share is disabled/`🔒` until a champion exists).

### 3. Instruction Band
- Two numbered steps (blue "1", green "2" circular badges) explaining: (1) fill the Round of 32 from dropdowns; (2) tap a team to advance them. White bg, `3px #161616` bottom border.

### 4. The Bracket (core)
- **Purpose:** The prediction surface — a FIFA-style mirrored bracket.
- **Layout:** Horizontally scrollable (`overflow-x:auto`), inner `min-width:1660px; height:880px`, `width:max-content`, centered. Three regions left-to-right: **left columns** (R32→R16→QF→SF), **center** (Final + 3rd-place), **right columns** (SF→QF→R16→R32, mirrored). Each column is a vertical flex; matches distribute with `flex:1` so spacing fans out per round.
- **Match card:** width 148px, `2.5px #161616` border, radius 12px, white, `3px 3px 0 #161616` shadow. Two stacked team rows separated by a `2px #161616` divider. Small Space Mono match label (e.g. "M74") above each.
- **Team row states:**
  - *Empty R32 slot:* a `<select>` dropdown (custom caret), italic placeholder showing the slot code (e.g. "Win · A", "2nd · C", "3rd · ABCDF"). Options are **scoped to the slot's group pool** and **exclude already-picked teams** (no duplicates).
  - *Filled, undecided:* white row, flag + 3-letter code, bold.
  - *Winner (advanced):* green `#17C988`, white text, weight 900, "✓" badge.
  - *Champion (Final winner only):* gold gradient `linear-gradient(135deg,#FFD23C,#FFB01F)`, black text, `inset 0 0 0 2px #161616`.
  - *Loser:* white, `opacity:.40`, `line-through`.
  - R32 filled slots show a small **✎ edit** button to clear/re-pick that entrant.
- **Connector lines:** between rounds, drawn as absolutely-positioned `2px #161616` divs — a horizontal stub out of each match, plus a vertical joiner merging each pair into the next round. Mirrored on the right side.
- **Center column:** "🏆 THE FINAL" label + date; a larger Final card (cream→white gradient); below it a smaller "3RD PLACE" card. Tapping a team in the Final sets the champion and opens the champion modal.

### 5. Champion Modal — "Road to the Title" (the share moment)
- **Purpose:** Celebrate + drive sharing + capture email.
- **Trigger:** Setting the Final winner (`M104`), or "Surprise me".
- **Layout:** Fixed overlay `z-index:60`, scrim `rgba(22,22,22,.62)`, falling **confetti** (90 pieces), centered card max-width 430px, `3px #161616`, radius 24px, `8px 8px 0 #161616`, ✕ close.
- **Header:** "🎉 BRACKET LOCKED 🎉" (Space Mono pink) + H2 "Bold call — here's your road to the title".
- **Share card (the C2 "funnel"):** cream `#FBF6E8` card. Built **live from the bracket**:
  - Eyebrow "FIFA WORLD CUP 2026" + "🏆 MY ROAD TO THE TITLE".
  - **SEMI-FINALISTS** row: 4 boxes in 2 pairs (the two semifinal matchups). The 2 that lost their semi are dimmed + struck through.
  - Connector merges each pair down to → **FINALISTS** row: 2 boxes (the finalists). The Final winner is green with ✓; the loser dimmed/struck.
  - Connector merges down to → **CHAMPION**: gold gradient box, flag + full name + "👑", subtitle "WORLD CHAMPION".
  - Connectors are symmetric: each child centers under its pair (use `justify-content:space-around` for 2 items = centers at exactly 25%/75%, `justify-content:center` for the single child = 50%; bar spans 25%→75%, drop at 50%).
  - Footer: "PICK THE CUP" / "#PickTheCup".
- **Share buttons:** Instagram (gradient), 𝕏, @ (Threads), f (Facebook). Currently open web-share intents; Instagram has no prefill API (links to instagram.com) — production should generate a real downloadable image (see Assets).
- **Email capture:** "📬 EMAIL ME MY BRACKET (& JOIN THE LEADERBOARD)" — email input + green Send; success state "✓ Sent! Check your inbox for your bracket."

### 6. Sponsor Strip + Footer (`Pick The Cup`, below bracket)
- Full-width strip, white, "OFFICIAL PARTNERS" / "Powering Pick The Cup 2026". A responsive grid of partner cards (logo chip + name + tag) and a dashed **"＋ Become a sponsor"** card. Dark footer with wordmark + "powered by ACME Sports" (placeholder — replace with a real sponsor or remove).

### 7. Become-a-Sponsor Modal
- **Trigger:** clicking the "＋ Become a sponsor" card.
- **Layout:** centered modal, blue header banner "PARTNER WITH PICK THE CUP" + headline.
- **Content:** three stat cards (12.4k brackets / 86k match picks / 7min avg on page), three benefit lines (logo in strip, "powered by" on shares, "matchday presented by" banner), a price block **$100 / tournament** ("LAUNCH PRICE · LIMITED SLOTS"), and a form (Company, Name, Work email) with a green "Reserve my slot → $100" button (enabled only when all 3 valid). Success state: "🎉 Slot reserved!". Labeled "Mock checkout — no real payment taken" → wire to Stripe in production.

### 8. Leaderboard (concept, in `Bracket Lab.dc.html`)
- Masked-email ranking table: rank (🥇🥈🥉/number), avatar emoji, masked email (`a••••@gmail.com`), predicted champion flag, points. The current user's row highlighted amber. Round-weighted scoring legend: **R32 1pt · R16 2pt · QF 4pt · SF 8pt · FINAL 12pt · CHAMP 20pt**. Header stat "12,408 players". A join-the-board email input.

### 9. Share Card Variants (concept, in `Share Cards.dc.html`)
- Exploration of Instagram + X formats. The **chosen production style is "C2 / Road to the Title"** (the funnel), now implemented in the Champion Modal. Other variants (flag-color backdrop, bottom-up climb, scoreline, podium strip) are kept for reference.

---

## Interactions & Behavior

### The pick / auto-advance engine (most important logic)
The bracket is 32 knockout matches (`M73`–`M104`, with `M103` = 3rd-place). Each match has two slots; a slot is either a **leaf** (filled from a group dropdown / wildcard) or a **reference** to the winner/loser of an earlier match.

- Selecting a team in a R32 dropdown fills that leaf slot.
- Tapping a team in any decided match sets it as that match's `winner`; the opponent becomes `loser`.
- A winner **propagates** to every downstream match that references it (`win:Mxx`) — and the 3rd-place match references the two semifinal **losers** (`lose:M101`, `lose:M102`).
- **Pruning:** if an upstream pick changes such that a previously-picked downstream winner is no longer in that match, the stale downstream pick is cleared (iterate until stable). This keeps the bracket always-consistent.
- Champion = winner of `M104`. Setting it opens the modal.
- **Dropdown de-duplication:** a R32 slot's options = its group pool minus all teams already used in other slots.
- **Surprise me:** randomly fills all R32 slots (group-valid, no dupes) and random winners through the Final, then opens the modal.
- **Reset:** clears all slots + picks.

### Other behavior
- **Persistence:** entire state (`slots`, `picks`, `email`) saved to `localStorage` under `wc26bracket2` on every change; restored on load. *(In production, persist server-side keyed to the user/email instead.)*
- **Progress:** `made = #slots filled + #match winners`; total 64; drives the header bar.
- **Share button** disabled until a champion exists.
- **Responsive:** header + sponsor grid wrap; bracket scrolls horizontally on small screens; modals are width-capped and scroll.

---

## State Management
Per-user bracket state:
- `slots: { [matchId|side]: teamCode }` — the R32 leaf selections (e.g. `"M74|a": "ARG"`).
- `picks: { [matchId]: teamCode }` — chosen winner per match.
- Derived each render via `computeKO(slots, picks)` → `{ [matchId]: {a, b, winner, loser} }` (resolves references, applies pruning).
- UI state: `showChampion`, `showSponsor`, `sponsorDone`, `emailDone`, form fields.

**Data the app needs (for a real backend):**
- **Teams:** code, name, flag, group (the prototype hardcodes 48 teams in 12 groups A–L; replace with the official 2026 draw when finalized).
- **Bracket template:** the 32-match graph with slot references (see `KO` array in `Pick The Cup.dc.html` — port this verbatim; it encodes the real 2026 R32 pairings incl. the best-third-place wildcard pools like `"3ABCDF"`).
- **Submitted brackets:** id, email, picks JSON, created_at.
- **Actual results:** match_id → winner, updated as the real tournament plays out (scraper/API).
- **Scores:** computed by diffing a bracket's picks vs results using the round-weight table above.

---

## Suggested Production Architecture (build order)
1. **Deploy the front-end** (recreated in Next.js) to Vercel — static/SSR, works before any backend.
2. **Seed data**: JSON of teams + groups + the `KO` bracket template + match schedule (free source e.g. football-data.org). Scraper/poller comes later as a Vercel Cron writing results to the DB.
3. **DB** (Vercel Postgres / Supabase): tables `brackets(id, email, picks jsonb, created_at)` and `results(match_id, winner)`.
4. **Email** (Resend / Postmark): "here's your bracket" on submit; later, scoring-update emails.
5. **Scoring + leaderboard** endpoint: compare picks vs results with round weights (R32 1 → CHAMP 20); the leaderboard UI exists in `Bracket Lab`.
6. **Sponsors/payments**: Stripe behind the sponsor modal; replace "ACME" placeholder.

---

## Assets
- **No image assets** — all flags are **emoji** (e.g. 🇦🇷). For production share images and crisper flags, switch to an SVG flag set (e.g. `flag-icons`) or render the share card server-side to a PNG (e.g. Satori / `@vercel/og`) so users get a real downloadable/Instagram-ready image.
- **Fonts:** Google Fonts — Archivo, Archivo Black, Space Mono.
- **Icons:** emoji + simple CSS shapes (no icon library).

## Files
In `design_files/`:
- `Pick The Cup.dc.html` — **the product**: hero, header, bracket engine, champion/funnel modal, sponsor strip + modal, footer. Contains the authoritative `TEAMS`, `GROUPS`, and `KO` bracket data + the `computeKO`/`prune`/`pick` logic to port.
- `Bracket Lab.dc.html` — concept dashboard: tiered-share (superseded), **leaderboard**, **sponsor slot** placements.
- `Share Cards.dc.html` — share-card explorations; production style = **C2 "Road to the Title"** funnel.
- `support.js` — the prototype runtime (reference only; do not port).

Screenshots of the main screens are in `screens/`.
