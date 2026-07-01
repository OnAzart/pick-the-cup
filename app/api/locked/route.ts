import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { KO, isLeaf } from '@/app/data';

export const dynamic = 'force-dynamic';

// Round-of-32 matches whose both legs are direct group positions (not a
// third-place pool) — these are the only knockout matches we can safely
// resolve to a real winner from the synced data. The other 16 legs (`w:n`)
// depend on FIFA's best-8-of-12-third-place ranking + slot assignment,
// which isn't reproduced here, so those stay user predictions.
function groupLeafKeys(): { key: string; group: string; position: number }[] {
  const out: { key: string; group: string; position: number }[] = [];
  for (const m of KO) {
    for (const side of ['a', 'b'] as const) {
      const ref = m[side].r;
      if (isLeaf(ref) && ref.startsWith('g:')) {
        const [, group, pos] = ref.split(':');
        out.push({ key: `${m.id}|${side}`, group, position: Number(pos) });
      }
    }
  }
  return out;
}

export async function GET() {
  await ensureSchema();

  const [completeRows, standingsRows, r32Rows] = await Promise.all([
    sql`
      SELECT REPLACE(group_name, 'GROUP_', '') AS letter, bool_and(status = 'FINISHED') AS complete
      FROM results
      WHERE stage = 'GROUP_STAGE' AND group_name IS NOT NULL
      GROUP BY group_name;
    `,
    sql`
      SELECT REPLACE(group_name, 'GROUP_', '') AS letter, team_code, position
      FROM standings;
    `,
    sql`
      SELECT home_code, away_code, winner_code
      FROM results
      WHERE stage = 'LAST_32' AND status = 'FINISHED';
    `,
  ]);

  const completeGroups = new Set(
    completeRows.rows.filter(r => r.complete).map(r => r.letter as string)
  );

  const posByGroup: Record<string, Record<number, string>> = {};
  for (const row of standingsRows.rows) {
    const letter = row.letter as string;
    posByGroup[letter] ??= {};
    posByGroup[letter][row.position as number] = row.team_code as string;
  }

  const slots: Record<string, string> = {};
  for (const leaf of groupLeafKeys()) {
    if (!completeGroups.has(leaf.group)) continue;
    const code = posByGroup[leaf.group]?.[leaf.position];
    if (code) slots[leaf.key] = code;
  }

  const winnerByPair = new Map<string, string>();
  for (const row of r32Rows.rows) {
    const home = row.home_code as string | null;
    const away = row.away_code as string | null;
    const winner = row.winner_code as string | null;
    if (!home || !away || !winner) continue;
    const pairKey = [home, away].sort().join('-');
    winnerByPair.set(pairKey, winner);
  }

  const picks: Record<string, string> = {};
  for (const m of KO) {
    const aRef = m.a.r, bRef = m.b.r;
    if (!(isLeaf(aRef) && aRef.startsWith('g:') && isLeaf(bRef) && bRef.startsWith('g:'))) continue;
    const aTeam = slots[`${m.id}|a`];
    const bTeam = slots[`${m.id}|b`];
    if (!aTeam || !bTeam) continue;
    const pairKey = [aTeam, bTeam].sort().join('-');
    const winner = winnerByPair.get(pairKey);
    if (winner) picks[m.id] = winner;
  }

  return NextResponse.json({ slots, picks });
}
