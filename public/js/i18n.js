/* ============================================================
   i18n — EN / FR dictionary + applier
   Exposes window.I18N { apply(lang), get(key, lang), current, LOGS(lang) }
   ============================================================ */
(function () {
  const FR = {
    // nav
    nav_about: 'À propos', nav_skills: 'Arsenal', nav_projects: 'Projets', nav_journey: 'Parcours',
    nav_lab: 'Lab', nav_cta: 'Établir le contact',
    // hero
    hero_status: 'SYSTÈME EN LIGNE — DISPONIBLE T3 2026',
    hero_sub: 'Développeur Full-Stack<span>/</span>Ingénieur Systèmes IA<span>/</span>Technologue Créatif',
    hero_desc: "Je conçois des plateformes web haute performance et des systèmes d'automatisation intelligents — alliant ingénierie de précision et design produit cinématographique. Je bâtis la couche d'interface de ce qui vient ensuite.",
    hero_cta1: 'Voir les projets', hero_cta2: 'Établir le contact',
    yrs: 'ans', chip_eng: 'Ingénierie', chip_shipped: 'Systèmes livrés', chip_uptime: 'Disponibilité moy.',
    scroll: 'DÉFILER',
    // about
    about_eyebrow: '01 — Profil Numérique',
    about_title: 'Ingénieur, designer,<br />et penseur systèmes.',
    about_p1: "Je suis <strong>Hamilton Kenfack</strong> — un ingénieur full-stack qui traite le logiciel comme un artisanat et les interfaces comme du cinéma. Ces six dernières années, j'ai livré des systèmes en production pour des startups et agences dans la fintech, l'outillage IA et les plateformes développeurs.",
    about_p2: "Mon terrain de jeu, c'est l'intersection d'une <strong>architecture backend robuste</strong>, d'<strong>expériences frontend fluides</strong> et de l'<strong>IA appliquée</strong> — pipelines RAG, workflows agentiques et automatisation qui fait discrètement le gros du travail.",
    stat_years: 'Ans de pratique', stat_projects: 'Projets livrés', stat_clients: 'Clients satisfaits', stat_uptime: 'Disponibilité système',
    tag_freelance: 'Freelance',
    // skills
    skills_eyebrow: '02 — Arsenal Technique',
    skills_title: 'Une stack redoutable.',
    skills_sub: "Des outils éprouvés sur tout le cycle de vie — du pixel au pipeline jusqu'à l'inférence en production.",
    cat_frontend: 'Frontend', cat_language: 'Langage', cat_backend: 'Backend',
    cat_intelligence: 'Intelligence', cat_infra: 'Infra',
    // projects
    proj_eyebrow: '03 — Centre de Commande',
    proj_title: 'Déploiements sélectionnés.',
    proj_sub: 'Des produits et systèmes premium conçus de bout en bout. Survolez un module pour le mettre en ligne.',
    view_all: "Voir l'archive complète",
    pcat_chatflow: 'Temps réel · En vedette',
    pdesc_chatflow: "Une application de messagerie en temps réel prête pour la production — DM privés, chats de groupe, messages vocaux, recherche et présence en direct. Construite avec Next.js 16 et Socket.IO.",
    pcat_phishguard: 'IA · Sécurité',
    pdesc_phishguard: "Collez une URL suspecte et PhishGuard l'analyse en quelques secondes — vérification des indicateurs de phishing, mots-clés malveillants et réputation du domaine via un classifieur ML.",
    pcat_pdfforge: 'Outillage',
    pdesc_pdfforge: "Tous les outils PDF au même endroit — fusionner, diviser, compresser, convertir et sécuriser des PDF, directement dans le navigateur sans installation.",
    pcat_quizmaster: 'Plateforme Web',
    pdesc_quizmaster: "Une plateforme de quiz moderne — créez des quiz engageants, suivez les performances des étudiants en temps réel et obtenez des analyses détaillées.",
    pcat_authstarter: 'Outillage',
    pdesc_authstarter: "Starter d'authentification prêt pour la production — email & mot de passe, liens magiques, OAuth Google & GitHub, accès par rôles, vérification email et réinitialisation.",
    link_case: 'Étude de cas', link_demo: 'Démo live', link_live: 'Live',
    // journey
    journey_eyebrow: '04 — Journal de Mission',
    journey_title: 'Le parcours jusqu\u2019ici.',
    tl_present: '2024 — AUJOURD\u2019HUI',
    tl1_title: 'Ingénieur Full-Stack & IA Freelance',
    tl1_desc: "Conception et livraison de produits nativement IA pour des startups du monde entier. Spécialisé en systèmes agentiques, pipelines RAG et expériences web cinématographiques.",
    tl2_title: 'Ingénieur Logiciel Senior',
    tl2_desc: "Direction de l'équipe plateforme bâtissant un SaaS multi-tenant servant plus de 80k utilisateurs. Réduction de 60% de la latence p95 et introduction de la première couche de recommandation pilotée par ML de l'entreprise.",
    tl3_title: 'Développeur Full-Stack',
    tl3_desc: "Création de plateformes web sur mesure pour des clients d'agence dans la fintech et l'e-commerce. Responsable de tout, des API Symfony aux frontends primés.",
    tl4_title: 'Développeur Junior & Open Source',
    tl4_desc: "Le début du parcours : livrer du code en production, contribuer à l'open source et tomber amoureux des systèmes qui semblent inévitables.",
    // lab
    lab_eyebrow: '05 — Le Lab',
    lab_title: 'Là où les idées prennent forme.',
    lab_sub: "Un établi vivant d'expérimentations, de contributions open-source et de R&D un peu folle. Certaines sont livrées. D'autres enseignent. Toutes font avancer le métier.",
    lab_ai: 'Expériences IA', lab_os: 'Open Source', lab_auto: 'Automatisation', lab_side: 'Projets perso', lab_rd: 'R&D',
    lab_ai_1: 'Notes vocales → diagrammes d\u2019architecture via un pipeline multimodal.',
    lab_ai_2: 'Banc de test A/B pour mesurer les régressions de prompts dans le temps.',
    lab_ai_3: 'Un moteur RAG de 200 lignes qui tourne entièrement dans le navigateur.',
    lab_os_1: 'Hook React pour un glassmorphism performant. 1.2k★.',
    lab_os_2: 'Types Result façon Rust pour TypeScript.',
    lab_os_3: 'Shader de grille à scroll infini. Archivé, toujours forké.',
    lab_auto_1: 'Agent LLM qui étiquette et rédige des réponses.',
    lab_auto_2: 'Rollback automatique sur anomalie des métriques CI.',
    lab_side_1: 'Un synthé web-audio avec arpégiateur génératif.',
    lab_side_2: 'Tableau de tâches local-first et minimal pour makers.',
    lab_rd_1: 'Exécution de modèles quantifiés sur Cloudflare Workers.',
    lab_rd_2: 'Recherche de patterns UX agentiques sous 100ms.',
    // contact
    contact_eyebrow: '06 — Canal Ouvert',
    contact_title: 'Construisons<br />le futur.',
    contact_lead: "Un produit à livrer, un système à faire passer à l'échelle, ou une idée qui mérite une exécution de classe mondiale ? Le canal est ouvert.",
    upwork_h: 'Top Rated · 100% de réussite',
    label_name: 'Identifiant // Nom', label_email: 'Canal de retour // Email', label_msg: 'Transmission // Message',
    ph_name: 'Votre nom', ph_msg: 'Parlez-moi de la mission…',
    err_name: 'nom requis', err_email: 'email valide requis', err_msg: 'message trop court',
    send_btn: 'TRANSMETTRE LE MESSAGE',
    form_note: '// canal chiffré · réponse sous 24h',
    // footer
    footer_left: '© 2026 HAMILTON KENFACK — <b>TOUS SYSTÈMES OPÉRATIONNELS</b>',
    footer_right: 'CONÇU &amp; DÉVELOPPÉ EN <b>HTML · WEBGL</b>',
    // tweaks
    tk_accent: 'Accent', tk_motion: 'Mouvement', tk_density: 'Densité de particules', tk_blur: 'Flou du verre',
    boot_init: 'démarrage du système…'
  };

  // Boot log lines per language (HTML strings)
  const LOGS = {
    en: [
      'initializing kernel <b>core.sys</b>',
      'mounting <b>/dev/portfolio</b>',
      'loading shader pipeline <b>webgl.v2</b>',
      'calibrating particle field <b>2.6k nodes</b>',
      'syncing neural skill matrix',
      'establishing secure uplink',
      'render systems <b>online</b>'
    ],
    fr: [
      'initialisation du noyau <b>core.sys</b>',
      'montage de <b>/dev/portfolio</b>',
      'chargement du pipeline shader <b>webgl.v2</b>',
      'calibrage du champ de particules <b>2.6k n\u0153uds</b>',
      'synchronisation de la matrice de compétences',
      'établissement du lien sécurisé',
      'systèmes de rendu <b>en ligne</b>'
    ]
  };

  // AI typing phrases per language
  const AI = {
    en: ['Ready to build something extraordinary.', 'Available for select freelance work.', 'Let\u2019s ship the future, together.'],
    fr: ['Prêt à construire quelque chose d\u2019extraordinaire.', 'Disponible pour des missions freelance sélectionnées.', 'Construisons le futur, ensemble.']
  };

  let current = 'en';

  function apply(lang) {
    current = (lang === 'fr') ? 'fr' : 'en';
    document.documentElement.setAttribute('lang', current);
    const dict = (current === 'fr') ? FR : null; // EN = original DOM text

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!el.dataset.en) el.dataset.en = el.textContent; // capture original EN once
      el.textContent = dict ? (dict[key] != null ? dict[key] : el.dataset.en) : el.dataset.en;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (!el.dataset.enHtml) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = dict ? (dict[key] != null ? dict[key] : el.dataset.enHtml) : el.dataset.enHtml;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (!el.dataset.enPh) el.dataset.enPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', dict ? (dict[key] != null ? dict[key] : el.dataset.enPh) : el.dataset.enPh);
    });

    // reflect on switch buttons
    document.querySelectorAll('.lang-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === current);
    });

    try { localStorage.setItem('hk_lang', current); } catch (e) {}
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: current } }));
  }

  window.I18N = {
    apply,
    detect() {
      try { const s = localStorage.getItem('hk_lang'); if (s === 'fr' || s === 'en') return s; } catch (e) {}
      const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      return nav.indexOf('fr') === 0 ? 'fr' : 'en';
    },
    get current() { return current; },
    logs() { return LOGS[current] || LOGS.en; },
    ai() { return AI[current] || AI.en; }
  };
})();
