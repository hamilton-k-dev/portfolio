/* ============================================================
   PROJECTS ARCHIVE — data, render, filter, search
   Reuses i18n.js (window.I18N) for language + langchange event.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // category keys -> bilingual labels
  const CATS = {
    all:        { en: 'All',             fr: 'Tout' },
    ai:         { en: 'AI & Security',   fr: 'IA & Sécurité' },
    web:        { en: 'Web Platform',    fr: 'Plateforme Web' },
    tooling:    { en: 'Developer Tools', fr: 'Outils Dév' },
    fintech:    { en: 'Fintech',         fr: 'Fintech' }
  };

  const STR = {
    eyebrow:  { en: 'Archive — All Projects', fr: 'Archive — Tous les projets' },
    title:    { en: 'The full archive.', fr: "L'archive complète." },
    sub:      { en: 'Every shipped system, indexed. Filter by domain or search the stack.',
                fr: 'Chaque système livré, indexé. Filtrez par domaine ou cherchez dans la stack.' },
    back:     { en: 'Back to home', fr: "Retour à l'accueil" },
    search:   { en: 'Search projects…', fr: 'Rechercher…' },
    showing:  { en: 'SHOWING', fr: 'AFFICHÉS' },
    of:       { en: 'OF', fr: 'SUR' },
    empty:    { en: '// no projects match this filter', fr: '// aucun projet ne correspond' },
    link_case:{ en: 'Case Study', fr: 'Étude de cas' },
    link_live:{ en: 'Live', fr: 'Live' },
    link_demo:{ en: 'Live Demo', fr: 'Démo live' }
  };

  // Real shipped projects — newest first. `img` = live screenshot, otherwise glyph fallback.
  const PROJECTS = [
    { id:'chatflow', cat:'web', year:2026, glyph:'◐', featured:true,
      img:'/img/projects/chatflow.png',
      title:'ChatFlow — Real-time Messaging',
      tags:['Next.js 16','TypeScript','Socket.IO','Prisma'],
      desc:{ en:'A production-ready real-time messaging app — private DMs, group chats, voice messages, search and live presence. Built with Next.js 16 and Socket.IO.',
             fr:'Une application de messagerie en temps réel prête pour la production — DM privés, chats de groupe, messages vocaux, recherche et présence en direct. Construite avec Next.js 16 et Socket.IO.' },
      links:[['live','https://chat-flow-delta-inky.vercel.app'],['github','https://github.com/hamilton-k-dev/chatFlow']] },

    { id:'phishguard', cat:'ai', year:2026, glyph:'⌬', featured:true,
      img:'/img/projects/phishing.png',
      title:'PhishGuard — Phishing Detection',
      tags:['Next.js','TypeScript','Machine Learning','Python'],
      desc:{ en:'Paste any suspicious URL and PhishGuard scans it in seconds — checking phishing indicators, malicious keywords and domain reputation with an ML classifier.',
             fr:"Collez une URL suspecte et PhishGuard l'analyse en quelques secondes — vérification des indicateurs de phishing, mots-clés malveillants et réputation du domaine via un classifieur ML." },
      links:[['live','https://phishing-detection-app-delta.vercel.app'],['github','https://github.com/hamilton-k-dev/phishing_detection_app']] },

    { id:'pdfforge', cat:'tooling', year:2026, glyph:'⬡',
      img:'/img/projects/pdfforge.png',
      title:'PDFForge — PDF Toolkit',
      tags:['Next.js','TypeScript','pdf-lib'],
      desc:{ en:'Every PDF tool in one place — merge, split, compress, convert, watermark and secure PDFs, all in the browser with no installs.',
             fr:'Tous les outils PDF au même endroit — fusionner, diviser, compresser, convertir, filigraner et sécuriser des PDF, directement dans le navigateur sans installation.' },
      links:[['live','https://pdf-forge-tan.vercel.app'],['github','https://github.com/hamilton-k-dev/PDFForge']] },

    { id:'quizmaster', cat:'web', year:2026, glyph:'◈',
      img:'/img/projects/quizz.png',
      title:'QuizMaster — Quiz Platform',
      tags:['Next.js','TypeScript','Prisma','PostgreSQL'],
      desc:{ en:'A modern quiz platform — build engaging quizzes, track student performance in real time and gain deep insights, all in one beautifully designed place.',
             fr:'Une plateforme de quiz moderne — créez des quiz engageants, suivez les performances des étudiants en temps réel et obtenez des analyses détaillées, le tout au même endroit.' },
      links:[['live','https://quizz-platforme.vercel.app'],['github','https://github.com/hamilton-k-dev/quizz_platforme']] },

    { id:'authstarter', cat:'tooling', year:2026, glyph:'⬢',
      img:'/img/projects/betterauth.png',
      title:'Next.js Auth Starter',
      tags:['Next.js 16','better-auth','Prisma','Neon','Resend'],
      desc:{ en:'Production-ready authentication starter — email & password, magic links, Google & GitHub OAuth, role-based access, email verification and password reset, all wired up.',
             fr:"Starter d'authentification prêt pour la production — email & mot de passe, liens magiques, OAuth Google & GitHub, accès par rôles, vérification email et réinitialisation, tout est câblé." },
      links:[['live','https://nextjs-better-auth-stater-three.vercel.app'],['github','https://github.com/hamilton-k-dev/nextjs-better-auth-stater']] },

    { id:'basicauth', cat:'tooling', year:2025, glyph:'◇',
      img:'/img/projects/basicauth.png',
      title:'Basic-Auth Module',
      tags:['Next.js 15','TypeScript','Auth'],
      desc:{ en:'A lightweight, drop-in authentication module with login and registration flows, built on Next.js 15.',
             fr:"Un module d'authentification léger et prêt à l'emploi avec connexion et inscription, construit avec Next.js 15." },
      links:[['live','https://basic-auth-puce.vercel.app'],['github','https://github.com/hamilton-k-dev/basic_auth']] },

    { id:'prismaauth', cat:'tooling', year:2025, glyph:'❖',
      title:'Next.js + Prisma Auth System',
      tags:['Next.js','Prisma','PostgreSQL','2FA'],
      desc:{ en:'Full-stack auth with credential and social login (Google & GitHub), role-based access control, email verification and two-factor authentication via email OTP.',
             fr:"Authentification full-stack avec connexion par identifiants et sociale (Google & GitHub), contrôle d'accès par rôles, vérification email et double authentification par OTP." },
      links:[['github','https://github.com/hamilton-k-dev/complte-nextjs-prisma-auth']] },

    { id:'voting', cat:'web', year:2025, glyph:'⊛',
      title:'Online Voting System',
      tags:['Next.js','Prisma','MySQL'],
      desc:{ en:'A secure online voting system — create polls, cast votes securely and watch results update in real time.',
             fr:'Un système de vote en ligne sécurisé — créez des sondages, votez en toute sécurité et suivez les résultats en temps réel.' },
      links:[['github','https://github.com/hamilton-k-dev/online-voting-system']] },

    { id:'expense', cat:'fintech', year:2025, glyph:'◆',
      title:'Expense Tracker',
      tags:['Next.js','TypeScript','Charts'],
      desc:{ en:'A personal finance tracker — log income and expenses, break them down by category and visualise spending over time.',
             fr:'Un suivi de finances personnelles — enregistrez revenus et dépenses, ventilez-les par catégorie et visualisez vos dépenses dans le temps.' },
      links:[['github','https://github.com/hamilton-k-dev/Expense-Tracker']] }
  ];

  const lang = () => (window.I18N ? window.I18N.current : 'en');
  const t = (obj) => obj[lang()] != null ? obj[lang()] : obj.en;

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  const ext = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  const gh = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>';

  function linkHtml(kind, url) {
    const href = url || '#';
    const blank = href !== '#' ? ' target="_blank" rel="noopener noreferrer"' : '';
    if (kind === 'github') return `<a class="proj-link" href="${href}"${blank}>${gh}GitHub</a>`;
    if (kind === 'demo')   return `<a class="proj-link" href="${href}"${blank}>${ext}${t(STR.link_demo)}</a>`;
    if (kind === 'live')   return `<a class="proj-link" href="${href}"${blank}>${ext}${t(STR.link_live)}</a>`;
    return `<a class="proj-link" href="${href}"${blank}>${arrow}${t(STR.link_case)}</a>`;
  }

  const grid = $('#archive-grid');

  function cardHtml(p) {
    const cat = CATS[p.cat] ? t(CATS[p.cat]) : p.cat;
    const tags = p.tags.map(x => `<span>${x}</span>`).join('');
    const links = p.links.map(l => linkHtml(l[0], l[1])).join('');
    const media = p.img
      ? `<div class="proj-media"><img class="proj-shot" src="${p.img}" alt="${p.title} screenshot" loading="lazy" /><div class="proj-shine"></div></div>`
      : `<div class="proj-media"><div class="proj-grid-bg"></div><div class="proj-glyph">${p.glyph}</div><div class="proj-shine"></div></div>`;
    return `<article class="proj glass" data-cat="${p.cat}" data-search="${(p.title + ' ' + p.tags.join(' ')).toLowerCase()}">
      <div class="proj-glow-border"></div>
      ${media}
      <div class="proj-body">
        <div class="proj-top"><span class="proj-cat">${cat}${p.featured ? ' · ★' : ''}</span><span class="proj-year">${p.year}</span></div>
        <h3>${p.title}</h3>
        <p>${t(p.desc)}</p>
        <div class="proj-tags">${tags}</div>
        <div class="proj-actions">${links}</div>
      </div>
    </article>`;
  }

  function render() {
    grid.innerHTML = PROJECTS.map(cardHtml).join('');
    attachTilt();
    applyFilter();
  }

  /* ---------- tilt + shine (matches home page) ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function attachTilt() {
    if (reduce || !window.matchMedia('(pointer:fine)').matches) return;
    $$('.proj', grid).forEach(card => {
      const max = 7;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg)`;
        const sh = card.querySelector('.proj-shine');
        if (sh) { sh.style.setProperty('--mx', px * 100 + '%'); sh.style.setProperty('--my', py * 100 + '%'); }
      });
      card.addEventListener('pointerleave', () => { card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)'; });
    });
  }

  /* ---------- filter + search ---------- */
  let activeCat = 'all';
  let query = '';
  function applyFilter() {
    let shown = 0;
    $$('.proj', grid).forEach(card => {
      const okCat = activeCat === 'all' || card.dataset.cat === activeCat;
      const okQ = !query || card.dataset.search.indexOf(query) >= 0;
      const show = okCat && okQ;
      card.classList.toggle('hide', !show);
      if (show) shown++;
    });
    grid.classList.toggle('empty', shown === 0);
    grid.setAttribute('data-empty', t(STR.empty));
    const sc = $('#count-shown'), tc = $('#count-total');
    if (sc) sc.textContent = shown;
    if (tc) tc.textContent = PROJECTS.length;
    // update per-pill counts
    $$('.filter-pill').forEach(pill => {
      const c = pill.dataset.cat;
      const n = c === 'all' ? PROJECTS.length : PROJECTS.filter(p => p.cat === c).length;
      const nEl = pill.querySelector('.n'); if (nEl) nEl.textContent = n;
    });
  }

  function buildFilters() {
    const wrap = $('#filters');
    wrap.innerHTML = Object.keys(CATS).map(key =>
      `<button type="button" class="filter-pill${key === 'all' ? ' active' : ''}" data-cat="${key}">
        <span class="lbl">${t(CATS[key])}</span><span class="n"></span>
      </button>`).join('');
    $$('.filter-pill', wrap).forEach(pill => {
      pill.addEventListener('click', () => {
        activeCat = pill.dataset.cat;
        $$('.filter-pill', wrap).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        applyFilter();
      });
    });
  }

  function applyStaticStrings() {
    $('#a-eyebrow').textContent = t(STR.eyebrow);
    $('#a-title').textContent = t(STR.title);
    $('#a-sub').textContent = t(STR.sub);
    $('#a-back-label').textContent = t(STR.back);
    $('#a-search').setAttribute('placeholder', t(STR.search));
    $('#a-showing').textContent = t(STR.showing);
    $('#a-of').textContent = t(STR.of);
  }

  function retranslate() {
    applyStaticStrings();
    // re-label filter pills (keep active state)
    $$('.filter-pill').forEach(pill => {
      const lbl = pill.querySelector('.lbl'); if (lbl) lbl.textContent = t(CATS[pill.dataset.cat]);
    });
    render(); // re-render cards in new language (preserves activeCat/query via applyFilter)
  }

  // search input
  function initSearch() {
    const inp = $('#a-search');
    inp.addEventListener('input', () => { query = inp.value.trim().toLowerCase(); applyFilter(); });
  }

  // boot
  function start() {
    buildFilters();
    applyStaticStrings();
    initSearch();
    render();
    window.addEventListener('langchange', retranslate);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
