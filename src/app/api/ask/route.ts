// Optional live-AI endpoint for the "Ask Hamilton AI" chatbot.
// Enable it by: (1) setting ANTHROPIC_API_KEY in .env.local, and
// (2) adding '/js/claude-shim.js' as the FIRST entry of the scripts array in src/app/page.tsx.
type ChatMessage = { role: string; content: string };

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({
      text: 'The AI assistant is not configured yet. Add ANTHROPIC_API_KEY to .env.local to enable live answers.',
    });
  }
  const body = (await req.json().catch(() => ({}))) as { messages?: ChatMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-3-5-haiku-latest', max_tokens: 600, messages }),
  });
  if (!r.ok) return new Response('upstream error', { status: 502 });
  const data = (await r.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? '';
  return Response.json({ text });
}
