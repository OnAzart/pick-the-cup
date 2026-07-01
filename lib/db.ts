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
    })();
  }
  return schemaReady;
}
