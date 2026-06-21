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

IDENTITY
- Hamilton Kenfack, Full-Stack Developer, AI Systems Engineer, and Creative Technologist.
- Based in Yaoundé, works remote. Bilingual EN/FR. Open-source contributor. Available for freelance (from Q3 2026).
- 6+ years of engineering, 47 projects delivered, 23 happy clients, 99.9% average system uptime.
- Philosophy: treats software like a craft and interfaces like cinema. Sweet spot = robust backend architecture + fluid frontend experiences + applied AI.

SKILLS / EXPERTISE (proficiency)
- Frontend: React / Next.js (96%), TypeScript (93%), Tailwind CSS, Framer Motion, Three.js / WebGL.
- Backend: Node.js / APIs (91%), PHP / Symfony (84%), PostgreSQL, REST & GraphQL, Redis & Queues.
- AI & Intelligence: Python / AI APIs (88%), OpenAI & Claude APIs, RAG & vector DBs, agentic automation.
- Infra / DevOps: Docker (82%), CI/CD, AWS, Vercel.
- Backend expertise summary: designs robust, scalable APIs and data layers — Node.js/Express and PHP/Symfony services, PostgreSQL schemas, Redis caching and queues, REST & GraphQL. Has cut p95 latency by 60% on a multi-tenant SaaS and built PCI-compliant payment orchestration.

PROJECTS (real, shipped — all open-source at github.com/hamilton-k-dev)
- ChatFlow (2026, Web): production-ready real-time messaging app — private DMs, group chats, voice messages, search and live presence. Stack: Next.js 16, TypeScript, Socket.IO, Prisma. Live demo + open-source. Featured.
- PhishGuard (2026, AI & Security): paste any suspicious URL and it scans in seconds — checking phishing indicators, malicious keywords and domain reputation with an ML classifier. Stack: Next.js, TypeScript, Machine Learning, Python. Live demo + open-source. Featured.
- PDFForge (2026, Developer Tools): all-in-one browser PDF toolkit — merge, split, compress, convert, watermark and secure PDFs, entirely client-side with no installs. Stack: Next.js, TypeScript, pdf-lib. Live demo + open-source.
- QuizMaster (2026, Web): modern quiz platform — build engaging quizzes, track student performance in real time and gain insights. Stack: Next.js, TypeScript, Prisma, PostgreSQL. Live demo + open-source.
- Next.js Auth Starter (2026, Developer Tools): production-ready authentication starter — email & password, magic links, Google & GitHub OAuth, role-based access control, email verification and password reset. Stack: Next.js 16, better-auth, Prisma, Neon, Resend. Live demo + open-source.
- Basic-Auth Module (2025, Developer Tools): lightweight, drop-in authentication module with login and registration flows. Stack: Next.js 15, TypeScript. Live demo + open-source.
- Next.js + Prisma Auth System (2025, Developer Tools): full-stack auth with credential and social login (Google & GitHub), role-based access control, email verification and two-factor authentication via email OTP. Stack: Next.js, Prisma, PostgreSQL. Open-source.
- Online Voting System (2025, Web): secure online voting system — create polls, vote securely and view real-time results. Stack: Next.js, Prisma, MySQL. Open-source.
- Expense Tracker (2025, Fintech): personal finance tracker — log income and expenses with category breakdowns and visual reports. Stack: Next.js, TypeScript, Charts. Open-source.

EXPERIENCE / JOURNEY
- 2024–present: Freelance Full-Stack & AI Engineer — AI-native products for startups worldwide; agentic systems, RAG pipelines, cinematic web experiences.
- 2022–2024: Senior Software Engineer at Northwind Labs — led platform team, multi-tenant SaaS for 80k+ users, cut p95 latency 60%, first ML recommendation layer.
- 2020–2022: Full-Stack Developer at Helix Studio — bespoke web platforms for fintech & e-commerce; Symfony APIs to award-considered frontends.
- 2019–2020: Junior Developer & Open Source — production code, OSS contributions.

LAB (experiments)
- AI Experiments: Whisper-to-Diagram (voice → architecture diagrams, WIP), Prompt Forge (prompt A/B regression harness, live), TinyRAG (200-line in-browser RAG engine, live).
- Open Source: use-glass (React glassmorphism hook, 1.2k stars), ts-result (Rust-style Result types for TS), webgl-grid (infinite scroll grid shader, archived).
- Automation: Inbox Triage Bot (LLM labels & drafts replies, live), Deploy Sentinel (auto-rollback on CI anomaly, WIP).
- Side Projects: Synthwave Synth (web-audio synth with generative arpeggiator, live), Focusboard (local-first task board, WIP).
- R&D: Edge Inference (quantized models on Cloudflare Workers, WIP), Latency Budgets (sub-100ms agentic UX research, WIP).

CONTACT
- GitHub: github.com/hamilton-k-dev (all projects above are open-source here). LinkedIn /in/hamiltonkenfack, X @hk_builds, Upwork (Top Rated, 100% job success).
`;

  const UI = {
    launch:  { en: 'Ask Hamilton AI', fr: 'Demander à Hamilton AI' },
    name:    { en: 'Hamilton AI', fr: 'Hamilton AI' },
    status:  { en: 'online · trained on this portfolio', fr: 'en ligne · entraîné sur ce portfolio' },
    greet:   { en: "Hi! I'm Hamilton's portfolio assistant. Ask me about his projects, skills, experience, or the lab.",
               fr: "Salut ! Je suis l'assistant du portfolio d'Hamilton. Posez-moi des questions sur ses projets, compétences, expérience ou le lab." },
    ph:      { en: 'Ask anything…', fr: 'Posez votre question…' },
    suggest: { en: ['What projects did Hamilton build?', 'What is his backend expertise?', 'Tell me about the AI work', "What's in the lab?"],
               fr: ['Quels projets Hamilton a-t-il construits ?', 'Quelle est son expertise backend ?', 'Parle-moi de son travail en IA', "Qu'y a-t-il dans le lab ?"] },
    err:     { en: '// signal lost — please try again', fr: '// signal perdu — réessayez' },
    nokey:   { en: "The AI assistant isn't available in this preview, but here's what I know: Hamilton is a full-stack & AI engineer — ask about his projects, backend expertise, or the lab once this is deployed.",
               fr: "L'assistant IA n'est pas disponible dans cet aperçu, mais voici l'essentiel : Hamilton est ingénieur full-stack & IA — posez vos questions sur ses projets, son expertise backend ou le lab une fois déployé." }
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
    const preamble = `You are "Hamilton AI", the friendly assistant embedded in Hamilton Kenfack's portfolio website. Answer ONLY using the knowledge base below. If something isn't covered, say you don't have that detail and suggest contacting Hamilton. Keep answers concise (2-5 sentences), confident, lightly futuristic in tone. You may use **bold** for emphasis. Always reply in ${replyLang}.\n\n${KB}`;

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
