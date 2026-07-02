import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { cleanRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

// Counts landings that arrived via a creator's ?ref= link — one POST per
// page load that carried the param. Aggregated per ref per day, so the
// table stays tiny no matter the traffic, and there's nothing personal in it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ref = cleanRef(body?.ref);
  if (!ref) return NextResponse.json({ error: 'invalid ref' }, { status: 400 });

  await ensureSchema();
  await sql`
    INSERT INTO ref_visits (ref, day, visits) VALUES (${ref}, CURRENT_DATE, 1)
    ON CONFLICT (ref, day) DO UPDATE SET visits = ref_visits.visits + 1;
  `;
  return new NextResponse(null, { status: 204 });
}
