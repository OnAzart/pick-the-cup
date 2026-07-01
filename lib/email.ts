import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

// Resend's shared sandbox sender works without a verified domain but can
// only deliver to the Resend account owner's own address. Set
// RESEND_FROM_EMAIL once a domain is verified to send to real users.
const FROM = process.env.RESEND_FROM_EMAIL || 'Pick The Cup <onboarding@resend.dev>';

// Best-effort: email is a nice-to-have on top of the core save/inquiry
// flows, so failures are logged and swallowed rather than surfaced to users.
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const resend = getClient();
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
  } catch (err) {
    console.error('sendEmail failed', err);
  }
}
