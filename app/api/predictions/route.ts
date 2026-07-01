import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function normalizeEmail(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : null;
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('email'));
  if (!email) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  await ensureSchema();
  const result = await sql`
    SELECT slots, picks, updated_at FROM predictions WHERE email = ${email};
  `;
  if (result.rows.length === 0) {
    return NextResponse.json({ found: false });
  }
  const row = result.rows[0];
  return NextResponse.json({ found: true, slots: row.slots, picks: row.picks, updatedAt: row.updated_at });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email ?? null);
  if (!email) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }
  const slots = body?.slots && typeof body.slots === 'object' ? body.slots : {};
  const picks = body?.picks && typeof body.picks === 'object' ? body.picks : {};

  await ensureSchema();
  await sql`
    INSERT INTO predictions (email, slots, picks, updated_at)
    VALUES (${email}, ${JSON.stringify(slots)}, ${JSON.stringify(picks)}, now())
    ON CONFLICT (email) DO UPDATE SET
      slots = EXCLUDED.slots,
      picks = EXCLUDED.picks,
      updated_at = now();
  `;

  await sendEmail({
    to: email,
    subject: 'Your Pick The Cup bracket is saved 🏆',
    html: `<p>Your bracket is saved to this email.</p><p>Come back anytime and use "Load bracket" with this same address to pick up where you left off or fix a pick.</p>`,
  });

  return NextResponse.json({ ok: true });
}
