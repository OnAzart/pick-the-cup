import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveLocked } from '@/lib/results';
import { scoreBracket, maxScoreSoFar } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

// Scores change only when results sync (daily cron) or someone saves a
// bracket — 60s edge cache keeps the modal snappy without meaningful
// staleness. Kept shorter than /api/locked since predictions churn more.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' };

const TOP_N = 20;

// Anonymous by design (deliberate privacy decision): rows expose rank, score,
// and the predicted champion — never an email or name. The caller can pass
// their own saved email to locate themselves; it's compared server-side and
// not echoed back.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('email');
  const email = raw ? raw.trim().toLowerCase() : null;

  const [real, predictions] = await Promise.all([
    resolveLocked(),
    sql`SELECT email, picks FROM predictions;`,
  ]);

  const scored = predictions.rows.map(row => {
    const picks = (row.picks ?? {}) as Record<string, string>;
    return {
      email: row.email as string,
      score: scoreBracket(picks, real.picks),
      champion: picks['M104'] ?? null,
    };
  });
  scored.sort((a, b) => b.score - a.score);

  // Competition ranking: equal scores share a rank (1, 2, 2, 4, …).
  let rank = 0;
  let prevScore: number | null = null;
  const ranked = scored.map((r, i) => {
    if (r.score !== prevScore) { rank = i + 1; prevScore = r.score; }
    return { ...r, rank };
  });

  const top = ranked.slice(0, TOP_N).map(({ rank, score, champion }) => ({ rank, score, champion }));
  const mine = email ? ranked.find(r => r.email === email) : null;

  return NextResponse.json({
    total: ranked.length,
    maxSoFar: maxScoreSoFar(real.picks),
    top,
    you: mine ? { rank: mine.rank, score: mine.score } : null,
  }, { headers: CACHE_HEADERS });
}
