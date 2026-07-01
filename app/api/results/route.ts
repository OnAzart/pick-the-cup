import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Underlying data only changes once/day via the sync cron, so let Vercel's
// edge cache serve this for 5 minutes instead of hitting Postgres on every
// page load (stale-while-revalidate keeps it non-blocking past that).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' };

export async function GET() {
  await ensureSchema();
  const [results, standings, lastSync] = await Promise.all([
    sql`SELECT * FROM results ORDER BY utc_date ASC LIMIT 200;`,
    sql`SELECT * FROM standings ORDER BY group_name, position;`,
    sql`SELECT * FROM sync_log ORDER BY ran_at DESC LIMIT 1;`,
  ]);
  return NextResponse.json({
    lastSync: lastSync.rows[0] ?? null,
    results: results.rows,
    standings: standings.rows,
  }, { headers: CACHE_HEADERS });
}
