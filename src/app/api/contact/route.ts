/**
 * The contact form endpoint.
 *
 * Before this existed, the form validated its fields, animated for two seconds
 * and told the visitor "message sent — response within 24h" without making a
 * single network call. Every enquiry was lost, and the sender was told the
 * opposite. That is worse than a form that visibly fails.
 *
 * Sent through Resend's REST API rather than its SDK, so this route adds no
 * dependency — the same choice `/api/ask` makes for OpenRouter.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface Payload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot. Real people never fill this; bots fill everything. */
  company?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Deliberately permissive. The point is to catch typos, not to enforce RFC
 * 5322 — a regex strict enough to reject every invalid address also rejects
 * valid ones, and the cost of a wrong rejection here is a lost client.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * One submission per address per minute.
 *
 * In-memory, so on serverless it resets whenever the instance does and is
 * shared by nobody. That makes it a speed bump rather than a control — enough
 * to stop a stuck submit button, not enough to stop a determined flood. Real
 * protection would need a shared store, which this site does not have.
 */
const recent = new Map<string, number>();
const WINDOW_MS = 60_000;

function tooSoon(key: string): boolean {
  const now = Date.now();
  for (const [k, at] of recent) if (now - at > WINDOW_MS) recent.delete(k);
  const last = recent.get(key);
  if (last && now - last < WINDOW_MS) return true;
  recent.set(key, now);
  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Payload;

  // A filled honeypot gets the same answer a success does. Telling a bot it
  // was detected only teaches whoever wrote it to stop filling that field.
  if (str(body.company)) return Response.json({ ok: true });

  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "name required";
  if (!EMAIL.test(email)) errors.email = "valid email required";
  if (message.length < 8) errors.message = "message too short";
  if (message.length > 5000) errors.message = "message too long";

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  if (tooSoon(email.toLowerCase())) {
    return Response.json(
      { ok: false, error: "You just sent one — give it a minute." },
      { status: 429 },
    );
  }

  // Stamped server-side in the reader's own timezone, so the header line means
  // something regardless of where the sender was.
  const stamp = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: process.env.CONTACT_TZ ?? "Africa/Douala",
  });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;

  if (!key || !to) {
    // Configuration is missing. Say so with a 503 rather than returning a
    // cheerful 200 — a silent failure here is exactly the bug this route was
    // written to remove.
    console.error("[contact] RESEND_API_KEY or CONTACT_TO is not set");
    return Response.json(
      { ok: false, error: "The contact form is not configured yet." },
      { status: 503 },
    );
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: [to],
      subject: `Portfolio — ${name}`,
      // So a reply goes to the visitor rather than to the sending domain.
      // Without it, hitting Reply answers a noreply address.
      reply_to: email,
      text: [
        `${name} <${email}>`,
        "",
        message,
        "",
        `— sent from the portfolio contact form, ${stamp}`,
      ].join("\n"),
      // Tables and inline styles, not flexbox: Outlook renders with Word's
      // engine and drops modern layout entirely. Every colour is stated
      // explicitly because clients that force dark mode invert unset ones.
      html: `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
       style="background:#0e0e12;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560"
           style="width:560px;max-width:100%;background:#16161c;border-radius:14px;overflow:hidden;border:1px solid #26262e">

      <tr><td style="padding:20px 26px;border-bottom:1px solid #26262e">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="font-size:13px;font-weight:700;letter-spacing:.14em;color:#b07cff">HAMILTON KENFACK</td>
          <td align="right" style="font-size:11px;color:#6f6f7d">${stamp}</td>
        </tr></table>
      </td></tr>

      <tr><td style="padding:26px 26px 6px">
        <p style="margin:0 0 18px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6f6f7d">
          New message from the portfolio
        </p>
        <p style="margin:0 0 2px;font-size:21px;font-weight:600;color:#f2f2f5;line-height:1.25">
          ${escapeHtml(name)}
        </p>
        <p style="margin:0 0 22px;font-size:14px">
          <a href="mailto:${escapeHtml(email)}" style="color:#b07cff;text-decoration:none">${escapeHtml(email)}</a>
        </p>
      </td></tr>

      <tr><td style="padding:0 26px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
               style="background:#101015;border-left:3px solid #b07cff;border-radius:0 8px 8px 0">
          <tr><td style="padding:16px 18px;font-size:15px;line-height:1.65;color:#dcdce4;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:22px 26px 26px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background:#b07cff;border-radius:999px">
            <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent("Re: your message")}"
               style="display:inline-block;padding:11px 24px;font-size:14px;font-weight:600;color:#16161c;text-decoration:none">
              Reply to ${escapeHtml(name.split(" ")[0] ?? name)}
            </a>
          </td>
        </tr></table>
        <p style="margin:16px 0 0;font-size:11px;color:#57576a;line-height:1.5">
          Hitting reply in your client works too — the sender is set as reply-to.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>`,
    }),
  }).catch(() => null);

  if (!response || !response.ok) {
    const detail = response ? await response.text().catch(() => "") : "network error";
    console.error("[contact] Resend rejected the send:", response?.status, detail);
    return Response.json(
      { ok: false, error: "Could not send just now." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
