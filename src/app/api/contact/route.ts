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
      text: `${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:-apple-system,system-ui,sans-serif;max-width:560px">
          <p style="margin:0 0 4px;font-size:13px;color:#888">New message from the portfolio</p>
          <p style="margin:0 0 16px;font-size:16px"><strong>${escapeHtml(name)}</strong>
            &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>
          <div style="white-space:pre-wrap;line-height:1.6;padding:16px;background:#f6f6f7;border-radius:8px">${escapeHtml(message)}</div>
        </div>`,
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
