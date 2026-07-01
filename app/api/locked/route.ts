import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { KOby } from '@/app/data';

export const dynamic = 'force-dynamic';

// football-data.org's own match IDs for the 16 Round-of-32 fixtures,
// cross-verified against the official FIFA match numbers (73-88) by
// matching each fixture's real group-position pairing and — for the
// third-place-pool legs — the actual team that filled the slot.
const R32_FD_MATCH_ID: Record<string, string> = {
  M74: '537415', M77: '537416', M73: '537417', M75: '537418',
  M83: '537419', M84: '537420', M81: '537421', M82: '537422',
  M76: '537423', M78: '537424', M79: '537425', M80: '537426',
  M86: '537427', M88: '537428', M85: '537429', M87: '537430',
};

// Later rounds don't have stable pre-assigned fixture IDs we can hardcode
// (their participants aren't known until earlier rounds finish), so they're
// resolved by matching the expected team pair against whatever
// football-data.org has posted for that stage.
const LATER_ROUNDS: { stage: string; ids: string[] }[] = [
  { stage: 'LAST_16', ids: ['M89', 'M90', 'M91', 'M92', 'M93', 'M94', 'M95', 'M96'] },
  { stage: 'QUARTER_FINALS', ids: ['M97', 'M98', 'M99', 'M100'] },
  { stage: 'SEMI_FINALS', ids: ['M101', 'M102'] },
  { stage: 'THIRD_PLACE', ids: ['M103'] },
  { stage: 'FINAL', ids: ['M104'] },
];

function groupExpected(ref: string, pos: Record<string, Record<number, string>>): string | null {
  if (!ref.startsWith('g:')) return null;
  const [, group, p] = ref.split(':');
  return pos[group]?.[Number(p)] ?? null;
}

function resolveRef(ref: string, picks: Record<string, string>, losers: Record<string, string>): string | null {
  const [kind, id] = ref.split(':');
  if (kind === 'win') return picks[id] ?? null;
  if (kind === 'lose') return losers[id] ?? null;
  return null;
}

interface ResultRow {
  home: string | null;
  away: string | null;
  status: string;
  winner: string | null;
}

export async function GET() {
  await ensureSchema();

  const [standingsRows, r32Rows, laterRows] = await Promise.all([
    sql`SELECT REPLACE(group_name, 'GROUP_', '') AS letter, team_code, position FROM standings;`,
    sql`SELECT match_id, home_code, away_code, status, winner_code FROM results WHERE stage = 'LAST_32';`,
    sql`
      SELECT stage, home_code, away_code, status, winner_code FROM results
      WHERE stage IN ('LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL');
    `,
  ]);

  const posByGroup: Record<string, Record<number, string>> = {};
  for (const row of standingsRows.rows) {
    const letter = row.letter as string;
    posByGroup[letter] ??= {};
    posByGroup[letter][row.position as number] = row.team_code as string;
  }

  const r32ByMatchId = new Map<string, ResultRow>();
  for (const row of r32Rows.rows) {
    r32ByMatchId.set(row.match_id as string, {
      home: row.home_code as string | null,
      away: row.away_code as string | null,
      status: row.status as string,
      winner: row.winner_code as string | null,
    });
  }

  const laterByStage = new Map<string, ResultRow[]>();
  for (const row of laterRows.rows) {
    const stage = row.stage as string;
    const list = laterByStage.get(stage) ?? [];
    list.push({
      home: row.home_code as string | null,
      away: row.away_code as string | null,
      status: row.status as string,
      winner: row.winner_code as string | null,
    });
    laterByStage.set(stage, list);
  }

  const slots: Record<string, string> = {};
  const picks: Record<string, string> = {};
  const losers: Record<string, string> = {};

  // Round of 32: resolve both leaves directly from the real fixture.
  for (const [localId, fdId] of Object.entries(R32_FD_MATCH_ID)) {
    const real = r32ByMatchId.get(fdId);
    if (!real || !real.home || !real.away) continue;
    const m = KOby[localId];
    const aExpected = groupExpected(m.a.r, posByGroup);
    const bExpected = groupExpected(m.b.r, posByGroup);

    let teamA: string | null = null, teamB: string | null = null;
    if (aExpected && real.home === aExpected) { teamA = real.home; teamB = real.away; }
    else if (aExpected && real.away === aExpected) { teamA = real.away; teamB = real.home; }
    else if (bExpected && real.home === bExpected) { teamB = real.home; teamA = real.away; }
    else if (bExpected && real.away === bExpected) { teamB = real.away; teamA = real.home; }

    if (teamA) slots[`${localId}|a`] = teamA;
    if (teamB) slots[`${localId}|b`] = teamB;
    if (teamA && teamB && real.status === 'FINISHED' && real.winner) {
      picks[localId] = real.winner;
      losers[localId] = real.winner === teamA ? teamB : teamA;
    }
  }

  // Later rounds cascade: only resolvable once both feeder picks are locked.
  for (const round of LATER_ROUNDS) {
    const candidates = laterByStage.get(round.stage) ?? [];
    for (const localId of round.ids) {
      const m = KOby[localId];
      const teamA = resolveRef(m.a.r, picks, losers);
      const teamB = resolveRef(m.b.r, picks, losers);
      if (!teamA || !teamB) continue;
      const real = candidates.find(r =>
        (r.home === teamA && r.away === teamB) || (r.home === teamB && r.away === teamA)
      );
      if (!real || real.status !== 'FINISHED' || !real.winner) continue;
      picks[localId] = real.winner;
      losers[localId] = real.winner === teamA ? teamB : teamA;
    }
  }

  return NextResponse.json({ slots, picks });
}
