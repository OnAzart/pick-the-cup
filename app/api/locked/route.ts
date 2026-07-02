import { NextResponse } from 'next/server';
import { resolveLocked } from '@/lib/results';

export const dynamic = 'force-dynamic';

// Underlying data only changes once/day via the sync cron, so let Vercel's
// edge cache serve this for 5 minutes instead of hitting Postgres on every
// page load (stale-while-revalidate keeps it non-blocking past that).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' };

export async function GET() {
  const { slots, picks, dates } = await resolveLocked();
  return NextResponse.json({ slots, picks, dates }, { headers: CACHE_HEADERS });
}
