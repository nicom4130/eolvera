import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Our own endpoint — no third-party form service. Runs as a Vercel Function.
export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Anti-spam without any external captcha:
//  · honeypot field "company" (bots fill it, humans never see it)
//  · timing trap: a real person can't submit in under ~3s (the form stamps
//    _t on page load via JS; we reject anything faster)
//  · server-side validation
const MIN_FILL_MS = 3000;

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown> = {};
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      fd.forEach((v, k) => (data[k] = v));
    }
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const name = String(data.name ?? '').trim();
  const email = String(data.email ?? '').trim();
  const message = String(data.message ?? '').trim();
  const company = String(data.company ?? '').trim(); // honeypot
  const t = Number(data._t ?? 0);
  const source = String(data.source ?? 'contact').slice(0, 40);

  // honeypot tripped → pretend success, drop silently (don't tip the bot off)
  if (company) return json({ ok: true });
  // submitted impossibly fast → bot
  if (!t || Date.now() - t < MIN_FILL_MS) return json({ ok: false, error: 'too_fast' }, 400);
  // validation
  if (!name || !isEmail(email) || message.length < 5) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || user;
  // Not wired yet (no app-password set) → graceful error, never a 500.
  if (!user || !pass) return json({ ok: false, error: 'not_configured' }, 503);

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass },
    });

    await transport.sendMail({
      from: `"Enrique Olvera — Web" <${user}>`,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `[${source}] Nueva consulta — ${name}`,
      text:
        `Origen: ${source}\n` +
        `Nombre: ${name}\n` +
        `Email: ${email}\n\n` +
        `${message}\n`,
    });

    return json({ ok: true });
  } catch (err) {
    console.error('contact send failed:', err);
    return json({ ok: false, error: 'send_failed' }, 502);
  }
};

// Anything other than POST
export const ALL: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);
