import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Creator-performance report: visits per ref (daily + total) and how many
// saved brackets each ref converted. Private — creator numbers back the
// outreach payouts, so this reuses the cron's Bearer CRON_SECRET auth
// rather than adding a new secret.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await ensureSchema();
  const [visits, conversions] = await Promise.all([
    sql`SELECT ref, SUM(visits)::int AS visits FROM ref_visits GROUP BY ref ORDER BY visits DESC;`,
    sql`SELECT ref, COUNT(*)::int AS saved FROM predictions WHERE ref IS NOT NULL GROUP BY ref;`,
  ]);

  const savedByRef = new Map(conversions.rows.map(r => [r.ref as string, r.saved as number]));
  const referrals = visits.rows.map(r => ({
    ref: r.ref as string,
    visits: r.visits as number,
    saved: savedByRef.get(r.ref as string) ?? 0,
  }));
  // Refs that converted saves but somehow have no tracked visits still show up.
  for (const [ref, saved] of savedByRef) {
    if (!referrals.some(r => r.ref === ref)) referrals.push({ ref, visits: 0, saved });
  }

  return NextResponse.json({ referrals });
}
