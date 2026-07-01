import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

// openclaw-consulting.com is verified in Resend, so this can deliver to
// real users (not just the Resend account owner, unlike the sandbox
// sender). Override via RESEND_FROM_EMAIL if a different address is needed.
const FROM = process.env.RESEND_FROM_EMAIL || 'Pick The Cup <picks@openclaw-consulting.com>';

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
