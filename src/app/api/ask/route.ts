// Optional live-AI endpoint for the "Ask Hamilton AI" chatbot.
// Enable it by: (1) setting OPENROUTER_API_KEY in .env.local, and
// (2) adding '/js/claude-shim.js' as the FIRST entry of the scripts array in src/app/page.tsx.
type ChatMessage = { role: string; content: string };

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return Response.json({
      text: 'The AI assistant is not configured yet. Add OPENROUTER_API_KEY to .env.local to enable live answers.',
    });
  }
  const body = (await req.json().catch(() => ({}))) as { messages?: ChatMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: 'anthropic/claude-haiku-4.5', max_tokens: 600, messages }),
  });
  if (!r.ok) return new Response('upstream error', { status: 502 });
  const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? '';
  return Response.json({ text });
}
