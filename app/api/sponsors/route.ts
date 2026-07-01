import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sponsor rows change rarely, so let Vercel's edge cache serve this for
// 10 minutes instead of hitting Postgres on every page load.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' };

export async function GET() {
  await ensureSchema();
  const result = await sql`
    SELECT name, tag, logo, bg, fg, url
    FROM sponsors
    WHERE active = true
    ORDER BY sort_order, id;
  `;
  return NextResponse.json({ sponsors: result.rows }, { headers: CACHE_HEADERS });
}
