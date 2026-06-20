/* ============================================================
   PROJECTS ARCHIVE — data, render, filter, search
   Reuses i18n.js (window.I18N) for language + langchange event.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // category keys -> bilingual labels
  const CATS = {
    all:        { en: 'All',            fr: 'Tout' },
    ai:         { en: 'AI & Automation', fr: 'IA & Automatisation' },
    fintech:    { en: 'Fintech',        fr: 'Fintech' },
    ecommerce:  { en: 'E-commerce',     fr: 'E-commerce' },
    tooling:    { en: 'Developer Tools', fr: 'Outils Dév' },
    web:        { en: 'Web Platform',   fr: 'Plateforme Web' }
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

  // featured order roughly newest → oldest
  const PROJECTS = [
    { id:'aether', cat:'ai', year:2026, glyph:'Æ', featured:true,
      title:'Aether — Agentic Workflow Engine',
      tags:['Next.js','TypeScript','Python','Claude API','PostgreSQL','Docker'],
      desc:{ en:'A no-code platform for building autonomous AI agents. Visual pipeline builder, RAG memory, and a multi-model orchestration layer running 12k+ daily executions at sub-second latency.',
             fr:"Une plateforme no-code pour construire des agents IA autonomes. Constructeur de pipelines visuel, mémoire RAG et orchestration multi-modèles traitant plus de 12k exécutions/jour en moins d'une seconde." },
      links:[['case','#'],['demo','#'],['github','#']] },

    { id:'nimbus', cat:'fintech', year:2025, glyph:'◈',
      title:'Nimbus Ledger',
      tags:['React','Node.js','PostgreSQL','Redis'],
      desc:{ en:'Real-time treasury dashboard processing 2M+ transactions/day with live anomaly detection.',
             fr:"Tableau de bord de trésorerie en temps réel traitant plus de 2M de transactions/jour avec détection d'anomalies." },
      links:[['case','#'],['live','#']] },

    { id:'forge', cat:'tooling', year:2025, glyph:'⬡',
      title:'Forge CLI',
      tags:['Node.js','TypeScript'],
      desc:{ en:'Developer scaffolding tool. 8k+ npm weekly installs.',
             fr:'Outil de scaffolding pour développeurs. Plus de 8k installations npm hebdomadaires.' },
      links:[['github','#']] },

    { id:'lumen', cat:'ecommerce', year:2024, glyph:'⟁',
      title:'Lumen Store',
      tags:['Next.js','Three.js','Symfony'],
      desc:{ en:'Headless commerce experience with 3D product configurator and sub-1s checkout.',
             fr:"Expérience e-commerce headless avec configurateur produit 3D et paiement en moins d'une seconde." },
      links:[['case','#'],['live','#']] },

    { id:'sentinel', cat:'ai', year:2024, glyph:'⌬',
      title:'Sentinel Ops',
      tags:['Python','OpenAI','Docker'],
      desc:{ en:'Autonomous incident-response bot that triages alerts and drafts post-mortems.',
             fr:'Bot autonome de réponse aux incidents qui trie les alertes et rédige les post-mortems.' },
      links:[['case','#'],['github','#']] },

    { id:'pulse', cat:'web', year:2025, glyph:'◐',
      title:'Pulse Analytics',
      tags:['React','D3.js','Node.js','ClickHouse'],
      desc:{ en:'Privacy-first product analytics with real-time funnels and cohort retention heatmaps.',
             fr:'Analytique produit respectueuse de la vie privée avec entonnoirs temps réel et cartes de rétention.' },
      links:[['case','#'],['live','#']] },

    { id:'vault', cat:'fintech', year:2023, glyph:'⬢',
      title:'Vault Pay',
      tags:['Symfony','Vue','PostgreSQL','Stripe'],
      desc:{ en:'PCI-compliant payment orchestration layer routing across 6 providers with smart retries.',
             fr:'Couche d\u2019orchestration de paiement conforme PCI routant sur 6 prestataires avec relances intelligentes.' },
      links:[['case','#']] },

    { id:'atlas', cat:'tooling', year:2023, glyph:'◇',
      title:'Atlas Design Tokens',
      tags:['TypeScript','Style Dictionary','Figma API'],
      desc:{ en:'Token pipeline syncing Figma variables to web, iOS, and Android in a single source of truth.',
             fr:'Pipeline de tokens synchronisant les variables Figma vers web, iOS et Android, une seule source de vérité.' },
      links:[['github','#'],['case','#']] },

    { id:'orbit', cat:'web', year:2024, glyph:'⊛',
      title:'Orbit CMS',
      tags:['Next.js','GraphQL','Prisma','tRPC'],
      desc:{ en:'Headless CMS with block-based editing, live preview, and edge-cached delivery worldwide.',
             fr:'CMS headless avec édition par blocs, aperçu en direct et diffusion mise en cache à la périphérie.' },
      links:[['case','#'],['live','#']] },

    { id:'mason', cat:'ecommerce', year:2023, glyph:'⬣',
      title:'Mason Marketplace',
      tags:['React','Node.js','Elasticsearch','Redis'],
      desc:{ en:'Multi-vendor marketplace with faceted search across 200k+ SKUs and split settlements.',
             fr:'Place de marché multi-vendeurs avec recherche à facettes sur plus de 200k références et règlements partagés.' },
      links:[['case','#']] },

    { id:'cortex', cat:'ai', year:2025, glyph:'❖',
      title:'Cortex Search',
      tags:['Python','LangChain','pgvector','FastAPI'],
      desc:{ en:'Semantic search-as-a-service over enterprise docs with hybrid reranking and citations.',
             fr:'Recherche sémantique en tant que service sur documents d\u2019entreprise avec reranking hybride et citations.' },
      links:[['demo','#'],['github','#']] },

    { id:'beacon', cat:'web', year:2022, glyph:'△',
      title:'Beacon Studio Site',
      tags:['Astro','GSAP','Three.js'],
      desc:{ en:'Award-considered marketing site for a design studio — scroll-driven WebGL throughout.',
             fr:'Site vitrine primé pour un studio de design — WebGL piloté par le scroll de bout en bout.' },
      links:[['live','#']] }
  ];

  const lang = () => (window.I18N ? window.I18N.current : 'en');
  const t = (obj) => obj[lang()] != null ? obj[lang()] : obj.en;

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  const ext = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  const gh = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>';

  function linkHtml(kind) {
    if (kind === 'github') return `<a class="proj-link" href="#">${gh}GitHub</a>`;
    if (kind === 'demo')   return `<a class="proj-link" href="#">${ext}${t(STR.link_demo)}</a>`;
    if (kind === 'live')   return `<a class="proj-link" href="#">${ext}${t(STR.link_live)}</a>`;
    return `<a class="proj-link" href="#">${arrow}${t(STR.link_case)}</a>`;
  }

  const grid = $('#archive-grid');

  function cardHtml(p) {
    const cat = CATS[p.cat] ? t(CATS[p.cat]) : p.cat;
    const tags = p.tags.map(x => `<span>${x}</span>`).join('');
    const links = p.links.map(l => linkHtml(l[0])).join('');
    return `<article class="proj glass" data-cat="${p.cat}" data-search="${(p.title + ' ' + p.tags.join(' ')).toLowerCase()}">
      <div class="proj-glow-border"></div>
      <div class="proj-media"><div class="proj-grid-bg"></div><div class="proj-glyph">${p.glyph}</div><div class="proj-shine"></div></div>
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
