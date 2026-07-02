import { sql } from '@vercel/postgres';

let schemaReady: Promise<void> | null = null;

/**
 * football-data.org doesn't yet expose a confirmed stage/group schema for the
 * 48-team 2026 format, so `stage`/`group_name` are stored as raw text rather
 * than an enum — inspect them via /api/results after the first sync and adjust
 * downstream mapping logic (KO-slot resolution) once the real values are known.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS results (
          match_id TEXT PRIMARY KEY,
          utc_date TIMESTAMPTZ,
          stage TEXT,
          group_name TEXT,
          home_code TEXT,
          away_code TEXT,
          home_name TEXT,
          away_name TEXT,
          home_score INT,
          away_score INT,
          status TEXT,
          winner_code TEXT,
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS standings (
          group_name TEXT,
          team_code TEXT,
          team_name TEXT,
          position INT,
          played INT,
          won INT,
          draw INT,
          lost INT,
          points INT,
          goals_for INT,
          goals_against INT,
          goal_difference INT,
          updated_at TIMESTAMPTZ DEFAULT now(),
          PRIMARY KEY (group_name, team_code)
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sync_log (
          id SERIAL PRIMARY KEY,
          ran_at TIMESTAMPTZ DEFAULT now(),
          matches_synced INT,
          standings_synced INT,
          errors TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS predictions (
          email TEXT PRIMARY KEY,
          slots JSONB NOT NULL DEFAULT '{}',
          picks JSONB NOT NULL DEFAULT '{}',
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sponsors (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          tag TEXT,
          logo TEXT,
          bg TEXT,
          fg TEXT,
          url TEXT,
          sort_order INT NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `;
      // Seeded once with volunteer/charity funds as placeholder sponsor
      // content — swap rows in this table for real paid sponsors later,
      // no code changes needed.
      await sql`
        INSERT INTO sponsors (name, tag, logo, bg, fg, url, sort_order) VALUES
          ('United24', 'Official Ukraine Platform', '🇺🇦', '#0057B7', '#ffffff', 'https://u24.gov.ua', 1),
          ('UAnimals', 'Animal Rescue & Rights', '🐾', '#FFD500', '#161616', 'https://uanimals.org', 2),
          ('Come Back Alive', 'Ukrainian Defense Charity', '🛡️', '#0057B7', '#ffffff', 'https://savelife.in.ua', 3),
          ('UNICEF', 'Children''s Fund', '🌐', '#1CABE2', '#ffffff', 'https://www.unicef.org', 4),
          ('Red Cross', 'Humanitarian Aid', '➕', '#ED1B2E', '#ffffff', 'https://www.icrc.org', 5)
        ON CONFLICT (name) DO NOTHING;
      `;
      // Referral attribution (creator outreach): which creator link brought
      // a visitor in. First-touch ref is also stamped onto saved predictions.
      await sql`ALTER TABLE predictions ADD COLUMN IF NOT EXISTS ref TEXT;`;
      await sql`
        CREATE TABLE IF NOT EXISTS ref_visits (
          ref TEXT NOT NULL,
          day DATE NOT NULL,
          visits INT NOT NULL DEFAULT 0,
          PRIMARY KEY (ref, day)
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sponsor_inquiries (
          id SERIAL PRIMARY KEY,
          company TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `;
    })();
  }
  return schemaReady;
}
