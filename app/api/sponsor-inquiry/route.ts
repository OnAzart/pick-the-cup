import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const company = typeof body?.company === 'string' ? body.company.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!company || !name || !email.includes('@')) {
    return NextResponse.json({ error: 'company, name, and a valid email are required' }, { status: 400 });
  }

  await ensureSchema();
  await sql`INSERT INTO sponsor_inquiries (company, name, email) VALUES (${company}, ${name}, ${email});`;

  const notifyTo = process.env.SPONSOR_NOTIFY_EMAIL;
  if (notifyTo) {
    await sendEmail({
      to: notifyTo,
      subject: `New sponsor inquiry: ${company}`,
      html: `<p><b>${name}</b> from <b>${company}</b> wants to sponsor Pick The Cup.</p><p>Reply to: ${email}</p>`,
    });
  }
  await sendEmail({
    to: email,
    subject: 'Thanks for your interest in sponsoring Pick The Cup 🏆',
    html: `<p>Hi ${name},</p><p>Thanks for reaching out about sponsoring Pick The Cup on behalf of ${company} — we'll be in touch within 24h.</p>`,
  });

  return NextResponse.json({ ok: true });
}
