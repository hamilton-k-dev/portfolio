/* Opt-in: routes window.claude.complete() to the /api/ask Next route.
   Load this BEFORE ai.js (add '/js/claude-shim.js' first in app/page.js scripts). */
window.claude = window.claude || {};
window.claude.complete = async function (arg) {
  const body = typeof arg === 'string' ? { messages: [{ role: 'user', content: arg }] } : (arg || {});
  const r = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('api');
  const d = await r.json();
  return d.text || '';
};
