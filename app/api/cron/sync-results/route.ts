import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// football-data.org's competition code for the FIFA World Cup.
const COMPETITION = 'WC';

interface FDTeam {
  tla?: string;
  name?: string;
}
interface FDScore {
  winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  fullTime?: { home: number | null; away: number | null };
}
interface FDMatch {
  id: number;
  utcDate: string;
  stage: string;
  group?: string | null;
  status: string;
  homeTeam?: FDTeam;
  awayTeam?: FDTeam;
  score?: FDScore;
}
interface FDStandingRow {
  position: number;
  team?: FDTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}
interface FDStandingGroup {
  type: string;
  group?: string | null;
  table?: FDStandingRow[];
}

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

// football-data.org returns "GROUP_A" on the matches endpoint but "Group A"
// on the standings endpoint — normalize both to the same form so the two
// tables can be joined on group_name.
function normalizeGroupName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.trim().toUpperCase().replace(/\s+/g, '_');
}

export async function GET(req: NextRequest) {
  // Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when
  // this route is invoked by a configured Cron Job, once CRON_SECRET is set.
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return unauthorized();
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not configured' }, { status: 500 });
  }

  await ensureSchema();

  const headers = { 'X-Auth-Token': apiKey };
  const errors: string[] = [];
  let matchesSynced = 0;
  let standingsSynced = 0;

  const [matchesRes, standingsRes] = await Promise.all([
    fetch(`https://api.football-data.org/v4/competitions/${COMPETITION}/matches`, { headers, cache: 'no-store' }),
    fetch(`https://api.football-data.org/v4/competitions/${COMPETITION}/standings`, { headers, cache: 'no-store' }),
  ]);

  if (matchesRes.ok) {
    const data: { matches?: FDMatch[] } = await matchesRes.json();
    for (const m of data.matches ?? []) {
      const homeCode = m.homeTeam?.tla ?? null;
      const awayCode = m.awayTeam?.tla ?? null;
      const homeScore = m.score?.fullTime?.home ?? null;
      const awayScore = m.score?.fullTime?.away ?? null;
      let winnerCode: string | null = null;
      if (m.score?.winner === 'HOME_TEAM') winnerCode = homeCode;
      else if (m.score?.winner === 'AWAY_TEAM') winnerCode = awayCode;

      await sql`
        INSERT INTO results (
          match_id, utc_date, stage, group_name, home_code, away_code,
          home_name, away_name, home_score, away_score, status, winner_code, updated_at
        )
        VALUES (
          ${String(m.id)}, ${m.utcDate}, ${m.stage}, ${normalizeGroupName(m.group)},
          ${homeCode}, ${awayCode}, ${m.homeTeam?.name ?? null}, ${m.awayTeam?.name ?? null},
          ${homeScore}, ${awayScore}, ${m.status}, ${winnerCode}, now()
        )
        ON CONFLICT (match_id) DO UPDATE SET
          utc_date = EXCLUDED.utc_date,
          stage = EXCLUDED.stage,
          group_name = EXCLUDED.group_name,
          home_code = EXCLUDED.home_code,
          away_code = EXCLUDED.away_code,
          home_name = EXCLUDED.home_name,
          away_name = EXCLUDED.away_name,
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          status = EXCLUDED.status,
          winner_code = EXCLUDED.winner_code,
          updated_at = now();
      `;
      matchesSynced++;
    }
  } else {
    errors.push(`matches fetch failed: HTTP ${matchesRes.status}`);
  }

  if (standingsRes.ok) {
    const data: { standings?: FDStandingGroup[] } = await standingsRes.json();
    // Standings are always synced as a full snapshot, so clear the table
    // first — this also drops any rows left over in the pre-normalization
    // "Group A" format.
    await sql`DELETE FROM standings;`;
    for (const group of data.standings ?? []) {
      if (group.type !== 'TOTAL') continue;
      const groupName = normalizeGroupName(group.group);
      for (const row of group.table ?? []) {
        const teamCode = row.team?.tla ?? null;
        if (!teamCode || !groupName) continue;
        await sql`
          INSERT INTO standings (
            group_name, team_code, team_name, position, played, won, draw, lost,
            points, goals_for, goals_against, goal_difference, updated_at
          )
          VALUES (
            ${groupName}, ${teamCode}, ${row.team?.name ?? null}, ${row.position},
            ${row.playedGames}, ${row.won}, ${row.draw}, ${row.lost}, ${row.points},
            ${row.goalsFor}, ${row.goalsAgainst}, ${row.goalDifference}, now()
          )
          ON CONFLICT (group_name, team_code) DO UPDATE SET
            team_name = EXCLUDED.team_name,
            position = EXCLUDED.position,
            played = EXCLUDED.played,
            won = EXCLUDED.won,
            draw = EXCLUDED.draw,
            lost = EXCLUDED.lost,
            points = EXCLUDED.points,
            goals_for = EXCLUDED.goals_for,
            goals_against = EXCLUDED.goals_against,
            goal_difference = EXCLUDED.goal_difference,
            updated_at = now();
        `;
        standingsSynced++;
      }
    }
  } else {
    errors.push(`standings fetch failed: HTTP ${standingsRes.status}`);
  }

  await sql`
    INSERT INTO sync_log (matches_synced, standings_synced, errors)
    VALUES (${matchesSynced}, ${standingsSynced}, ${errors.length ? errors.join('; ') : null});
  `;

  return NextResponse.json({ matchesSynced, standingsSynced, errors });
}
