/* ============================================================
   ASK HAMILTON AI — portfolio-grounded chatbot
   Uses window.claude.complete. Bilingual via window.I18N.
   Self-contained: injects launcher + panel into any page.
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = () => (window.I18N ? window.I18N.current : 'en');

  /* ---------- knowledge base (the only source of truth for the bot) ---------- */
  const KB = `
HAMILTON KENFACK — PORTFOLIO KNOWLEDGE BASE
Everything below is verifiable: shipped code, live URLs, or numbers that were measured.
If a visitor asks something not covered here, say so plainly instead of inventing an answer.

IDENTITY
- Hamilton Kenfack, full-stack developer, freelance. Based in Cameroon, works remote, bilingual EN/FR.
- Four years of professional freelance work, preceded by self-taught years of first contracts and open source. No employer, ever — the architecture decisions were his and so was the on-call.
- Available for select freelance work from Q3 2026.
- How he works: builds AI-native products end to end, and measures them. Comfortable saying when a measurement contradicts the idea that started it.

STACK
- Front: Next.js (App Router), React, TypeScript, Tailwind, Canvas/WebGL.
- Back: Node, Prisma, PostgreSQL, better-auth, REST and server actions.
- AI: structured outputs with schema validation and re-validation, RAG, eval harnesses, agent loops with a human in the loop.
- Edge and infra: Cloudflare Workers, Vercel, quantised models at the edge.
- Testing: node:test, Playwright, type-level tests, benchmarks that are allowed to disagree with him.
- Earlier work also used PHP/Symfony, Vue and MySQL.

SELECTED PROJECTS
- SchoolX (in development) — multi-tenant school management for francophone schools: grades, timetables and report cards under each school's own subdomain, language and branding, with AI-written report card comments. Next.js 16, BetterAuth, Prisma 7, Neon, next-intl. Live beta at schoolx-beta.vercel.app; the repo is private for now, so there is no GitHub link for this one.
- SPECSHEET — independent phone and laptop reviews, built around an AI co-writer inside the CMS. A one-line prompt produces the entire draft: title, full article body written straight into the rich-text editor, tags, and a real topical cover photo found via the Wikimedia Commons API rather than a stock placeholder. The model returns structured JSON checked against a strict Zod schema, so a malformed answer is rejected instead of silently corrupting the form. Generations are rate-limited per account in the database (survives serverless cold starts), and the public demo account gets a real working allowance of 2 a day so visitors can actually try it. Also: Postgres CMS, image uploads, live search, read-only demo mode. Live at spec-sheet-eta.vercel.app.
- PhishGuard — paste a suspicious URL and it scans in seconds: phishing indicators, malicious keywords, domain reputation, via an ML classifier.
- Voltcrate — refurbished-electronics storefront with real authentication, a Postgres catalogue, and a per-user cart and checkout that persist. One-click demo account so the whole flow can be tried without registering. Live at ecommerce-smoky-sigma-64.vercel.app.
- ExpenseIQ — personal finance tracker: budgets per category, six-month charts, French and English, and first-class support for African currencies (XAF, XOF, NGN). Live at expense-tracker-ppup.vercel.app.
- Also in the archive: ChatFlow (real-time messaging with DMs, group chats, voice notes and presence), PDFForge (merge, split, compress and secure PDFs entirely in the browser), QuizMaster (quiz platform with live student tracking), and a production-ready Next.js auth starter with email/password, magic links, OAuth and role-based access.
- Everything public is at github.com/hamilton-k-dev.

THE LAB — twelve small projects, each built to answer one question and then actually measured
- whisper-to-diagram: describe an architecture out loud, get a diagram. The model never writes Mermaid; it fills a Zod schema and the client renders it. Constrained output beats free text.
- prompt-forge: an A/B bench that catches prompt regressions. On a real eight-case eval set, haiku-4.5 matched opus-5 everywhere and beat it on one case — same quality, roughly five times cheaper.
- tinyrag: RAG in 231 lines, zero dependencies, entirely in the browser. Under about 5k chunks a brute-force cosine scan is enough — no vector index needed. The real cost of "no server" is a 25 MB model on first load.
- use-glass: a React hook for glassmorphism that keeps the frame rate. The premise was DISPROVED: the off-screen visibility gate buys nothing on modern Chromium, 76.6 against 75.5 FPS. What does work is halving the blur radius, 76 to 95 FPS. The README says so in a titled section.
- ts-result: Rust-style Result types for TypeScript. 689 bytes gzipped for the full surface, 123 for ok/err/match. Writing the type tests found a real inference bug in andThen.
- webgl-grid: an infinite pan and zoom grid in a fragment shader. 120 FPS flat across a 1200x density range. But the honest nuance is that a well-written canvas2D grid is not slow — the real argument is content-independent cost, not raw speed.
- inbox-triage: an agent that labels threads and drafts replies. "Draft, never send" is enforced by never requesting the gmail.send scope, so the guarantee is Google's rather than his restraint.
- deploy-sentinel: watches a deployment and rolls back when a route degrades. Per-route baselines and Wilson intervals, so two failures out of twelve at 3 a.m. do not trigger a rollback. Observe-only until you pass --arm.
- synthwave-synth: a browser synth with a generative arpeggiator. A lookahead scheduler is exact; a self-correcting setTimeout averages 2.6 ms of error but still drops single notes 97 ms late. For rhythm, the average is the wrong statistic.
- focusboard: a local-first, keyboard-only task board. The CRDT merge is demonstrated rather than promised — two separate browser profiles edit offline, exchange a file and converge. Conflict resolves per field, not per task.
- edge-inference: an int8 spam classifier running inside a Cloudflare Worker. 98.83% accuracy in 32 kB, 47 ms p50 against 1219 ms for a frontier model on the same messages. Cold start turned out NOT to matter: 167 ms cold against 170 ms warm.
- latency-budgets: seven waiting-interfaces over one identical backend. Time-to-first-feedback does not discriminate — all seven hit 1 ms, plain spinner included. What separates them is the longest stretch where nothing changes on screen.
- Three of the twelve came out against the idea that started them, and the READMEs say so rather than burying it: quantisation was free, the cache layer bought nothing, and a skeleton is identical to a spinner to the millisecond.

JOURNEY
- 2024 to today: freelance full-stack and AI developer — AI-native products end to end for founders and small teams.
- 2022 to 2024: freelance product developer — SaaS and platforms, taken from empty repo to production: architecture, auth, data model, deployment, and the on-call.
- Before 2022: self-taught in Yaoundé — first paid sites, first open-source pull requests, first invoices, then agency contracts with Symfony APIs and Vue frontends. The years that taught the craft, before it became the job.

CONTACT
- Email hamiltonkenfack@gmail.com, or the contact form at the bottom of this page.
- GitHub: github.com/hamilton-k-dev.
- If asked about rates, availability beyond Q3 2026, or anything not written above, say it is best asked directly by email — do not guess.
`;


  const UI = {
    launch:  { en: 'Ask Hamilton AI', fr: 'Demander à Hamilton AI' },
    name:    { en: 'Hamilton AI', fr: 'Hamilton AI' },
    status:  { en: 'online · trained on this portfolio', fr: 'en ligne · entraîné sur ce portfolio' },
    greet:   { en: "Hi — I'm the assistant for Hamilton's portfolio. Ask about the projects, the stack, or the lab. I only answer from what's on this site; anything else is better asked by email.",
               fr: "Bonjour — je suis l'assistant du portfolio d'Hamilton. Posez vos questions sur les projets, la stack ou le lab. Je réponds uniquement à partir de ce site ; pour le reste, mieux vaut écrire directement." },
    ph:      { en: 'Ask anything…', fr: 'Posez votre question…' },
    suggest: { en: ['What has he actually shipped?', 'Which lab results were negative?', 'What does he use for AI features?', 'Is he available for work?'],
               fr: ['Qu\u2019a-t-il r\u00e9ellement livr\u00e9 ?', 'Quels r\u00e9sultats du lab \u00e9taient n\u00e9gatifs ?', 'Que utilise-t-il pour l\u2019IA ?', 'Est-il disponible ?'] },
    err:     { en: '// signal lost — please try again', fr: '// signal perdu — réessayez' },
    nokey:   { en: "The assistant isn't wired up in this preview. The short version: Hamilton is a freelance full-stack developer based in Cameroon — twelve measured lab projects and a handful of shipped products, all linked on this page. Email hamiltonkenfack@gmail.com to reach him directly.",
               fr: "L'assistant n'est pas actif dans cet aper\u00e7u. En bref : Hamilton est d\u00e9veloppeur full-stack freelance bas\u00e9 au Cameroun \u2014 douze projets de lab mesur\u00e9s et plusieurs produits livr\u00e9s, tous li\u00e9s sur cette page. \u00c9crivez \u00e0 hamiltonkenfack@gmail.com pour le joindre." }
  };
  const t = (o) => o[lang()] != null ? o[lang()] : o.en;

  /* ---------- build DOM ---------- */
  const launch = document.createElement('button');
  launch.className = 'ai-launch'; launch.type = 'button';
  launch.innerHTML = `<span class="orb"></span><span class="lbl"></span>`;

  const overlay = document.createElement('div'); overlay.className = 'ai-overlay';
  const panel = document.createElement('div'); panel.className = 'ai-panel'; panel.setAttribute('role', 'dialog');
  panel.innerHTML = `
    <div class="ai-hd">
      <span class="orb"></span>
      <div class="meta"><div class="nm"></div><div class="st"><span class="dot"></span><span class="st-tx"></span></div></div>
      <button class="x" type="button" aria-label="Close">✕</button>
    </div>
    <div class="ai-msgs"></div>
    <div class="ai-sugg"></div>
    <div class="ai-input">
      <input type="text" aria-label="Message" />
      <button type="button" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg></button>
    </div>`;

  document.body.appendChild(launch);
  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  const msgs = panel.querySelector('.ai-msgs');
  const suggWrap = panel.querySelector('.ai-sugg');
  const input = panel.querySelector('.ai-input input');
  const sendBtn = panel.querySelector('.ai-input button');

  /* ---------- i18n labels ---------- */
  function applyLabels() {
    launch.querySelector('.lbl').textContent = t(UI.launch);
    panel.querySelector('.nm').textContent = t(UI.name);
    panel.querySelector('.st-tx').textContent = t(UI.status);
    input.setAttribute('placeholder', t(UI.ph));
    renderSuggestions();
  }
  function renderSuggestions() {
    suggWrap.innerHTML = '';
    t(UI.suggest).forEach(q => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ai-chip'; b.textContent = q;
      b.addEventListener('click', () => { input.value = q; send(); });
      suggWrap.appendChild(b);
    });
  }

  /* ---------- conversation ---------- */
  const history = []; // {role, content}
  let greeted = false;
  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'ai-msg ' + (role === 'me' ? 'me' : 'bot');
    // light markdown: **bold**
    el.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function showTyping() {
    const el = document.createElement('div'); el.className = 'ai-typing';
    el.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function send() {
    const q = input.value.trim();
    if (!q || sendBtn.disabled) return;
    input.value = '';
    addMsg('me', q);
    history.push({ role: 'user', content: q });
    sendBtn.disabled = true;
    const typing = showTyping();

    const replyLang = lang() === 'fr' ? 'French' : 'English';
    const preamble = `You are "Hamilton AI", the friendly assistant embedded in Hamilton Kenfack's portfolio website. Answer ONLY using the knowledge base below. If something isn't covered, say you don't have that detail and suggest contacting Hamilton. Keep answers concise (2-5 sentences) and specific: prefer a measured number or a project name over an adjective. Never invent a client, an employer, a metric or a star count \u2014 Hamilton has never had an employer, and the lab numbers below are the only ones that exist. If a visitor asks about rates or anything outside the knowledge base, say it is best asked by email rather than guessing. You may use **bold** for emphasis. Always reply in ${replyLang}.\n\n${KB}`;

    try {
      if (!(window.claude && typeof window.claude.complete === 'function')) throw new Error('no-claude');
      const messages = [
        { role: 'user', content: preamble },
        { role: 'assistant', content: lang() === 'fr' ? "Compris — je réponds uniquement à partir de ce portfolio." : "Understood — I'll answer only from this portfolio." },
        ...history.slice(-8)
      ];
      const text = await window.claude.complete({ messages });
      typing.remove();
      addMsg('bot', (text || '').trim() || t(UI.err));
      history.push({ role: 'assistant', content: text || '' });
    } catch (e) {
      typing.remove();
      addMsg('bot', (e && e.message === 'no-claude') ? t(UI.nokey) : t(UI.err));
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  /* ---------- open / close ---------- */
  function open() {
    overlay.classList.add('show'); panel.classList.add('show'); launch.classList.add('hidden');
    if (!greeted) { greeted = true; addMsg('bot', t(UI.greet)); }
    setTimeout(() => input.focus(), 300);
  }
  function close() {
    overlay.classList.remove('show'); panel.classList.remove('show'); launch.classList.remove('hidden');
  }
  launch.addEventListener('click', open);
  overlay.addEventListener('click', close);
  panel.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('show')) close(); });

  /* ---------- language sync ---------- */
  applyLabels();
  window.addEventListener('langchange', () => {
    applyLabels();
    // refresh greeting language if panel still only has greeting
    if (greeted && history.length === 0) { msgs.innerHTML = ''; addMsg('bot', t(UI.greet)); }
  });
})();
