/* ============================================================
   LAB CASE-STUDY READER — data + modal
   Opens when a .lab-item[data-lab] is clicked. Bilingual.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const lang = () => (window.I18N ? window.I18N.current : 'en');
  const t = (o) => (o && o[lang()] != null) ? o[lang()] : (o ? o.en : '');

  const LABELS = {
    cat:       { en: 'Lab Experiment', fr: 'Expérience Lab' },
    problem:   { en: 'The Problem', fr: 'Le Problème' },
    experiment:{ en: 'The Experiment', fr: "L'Expérience" },
    architecture:{ en: 'The Architecture', fr: "L'Architecture" },
    learned:   { en: "What I've Learned", fr: "Ce que j'ai appris" },
    live:      { en: 'LIVE', fr: 'EN LIGNE' },
    wip:       { en: 'WIP', fr: 'EN COURS' },
    archived:  { en: 'ARCHIVED', fr: 'ARCHIVÉ' },
    code:      { en: 'View Code', fr: 'Voir le code' },
    demo:      { en: 'Live Demo', fr: 'Démo' },
    prev:      { en: 'Prev', fr: 'Préc.' },
    next:      { en: 'Next', fr: 'Suiv.' }
  };

  const D = {
    whisper: { name: 'Whisper-to-Diagram', status: 'wip',
      cat: { en: 'AI Experiment', fr: 'Expérience IA' },
      tagline: { en: 'Speak an architecture out loud — get a clean diagram back.', fr: 'Décrivez une architecture à voix haute — récupérez un diagramme propre.' },
      problem: { en: 'Whiteboarding system designs is fast, but turning the talk into shareable diagrams is slow, manual, and dies in someone\u2019s notebook. I wanted the gap between **saying** an architecture and **seeing** it to disappear.', fr: 'Concevoir au tableau est rapide, mais transformer la discussion en diagrammes partageables est lent et manuel — et finit oublié dans un carnet. Je voulais effacer l\u2019écart entre **dire** une architecture et **la voir**.' },
      experiment: { en: 'I chained speech-to-text with a reasoning model that extracts entities and relationships, then emits Mermaid/DSL the browser renders live. The bet: an LLM can infer structure (services, queues, data flow) from loose spoken language.', fr: 'J\u2019ai enchaîné la reconnaissance vocale avec un modèle de raisonnement qui extrait entités et relations, puis émet du Mermaid/DSL rendu en direct. Le pari : un LLM peut déduire la structure (services, files, flux) d\u2019un langage parlé approximatif.' },
      arch: [ ['Web Speech API', { en: 'captures + transcribes voice', fr: 'capture + transcrit la voix' }],
              ['Claude (reasoning)', { en: 'extracts entities & relations → DSL', fr: 'extrait entités & relations → DSL' }],
              ['Mermaid.js', { en: 'renders the diagram live', fr: 'rend le diagramme en direct' }],
              ['Canvas export', { en: 'PNG / SVG share-out', fr: 'export PNG / SVG' }] ],
      learned: { en: ['Forcing the model to emit a strict DSL beats free-form output — it cut malformed diagrams by ~80%.', 'Streaming partial transcripts into the prompt felt magical but caused thrash; debouncing won.', 'Users describe systems non-linearly — the model needs a "revise" pass, not one shot.'],
                 fr: ['Forcer le modèle à émettre un DSL strict bat la sortie libre — ~80% de diagrammes malformés en moins.', 'Injecter les transcriptions partielles en streaming était magique mais instable ; le debounce a gagné.', 'On décrit les systèmes de façon non-linéaire — il faut une passe de « révision », pas un seul coup.'] } },

    promptforge: { name: 'Prompt Forge', status: 'live',
      cat: { en: 'AI Experiment', fr: 'Expérience IA' },
      tagline: { en: 'A test harness that catches prompt regressions before users do.', fr: 'Un banc de test qui attrape les régressions de prompts avant les utilisateurs.' },
      problem: { en: 'Tweaking a prompt to fix one case quietly breaks five others. There was no "unit test" for prompts — every change was a leap of faith.', fr: 'Ajuster un prompt pour corriger un cas en casse silencieusement cinq autres. Il n\u2019existait pas de « test unitaire » pour les prompts — chaque changement était un acte de foi.' },
      experiment: { en: 'I built an A/B harness: a fixed eval set of inputs with graded expectations, run against prompt variants. An LLM judge scores outputs, and a dashboard tracks score drift per commit.', fr: 'J\u2019ai construit un banc A/B : un jeu d\u2019évaluation fixe avec attentes notées, exécuté sur les variantes de prompts. Un juge LLM note les sorties et un tableau de bord suit la dérive des scores par commit.' },
      arch: [ ['Eval dataset (JSON)', { en: 'inputs + graded rubrics', fr: 'entrées + grilles de notation' }],
              ['Runner', { en: 'fans out variants in parallel', fr: 'exécute les variantes en parallèle' }],
              ['LLM judge', { en: 'scores each output 0\u20131', fr: 'note chaque sortie 0\u20131' }],
              ['Dashboard', { en: 'tracks drift per commit', fr: 'suit la dérive par commit' }] ],
      learned: { en: ['An LLM judge is noisy alone — pairing it with a few hard assertions made scores trustworthy.', 'Versioning prompts like code (with diffs) changed how the team reasons about changes.', 'Small, curated eval sets beat huge ones: signal over volume.'],
                 fr: ['Un juge LLM seul est bruité — l\u2019associer à quelques assertions strictes a fiabilisé les scores.', 'Versionner les prompts comme du code (avec diffs) a changé la façon de raisonner de l\u2019équipe.', 'De petits jeux d\u2019éval curatés battent les énormes : du signal, pas du volume.'] } },

    tinyrag: { name: 'TinyRAG', status: 'live',
      cat: { en: 'AI Experiment', fr: 'Expérience IA' },
      tagline: { en: 'Retrieval-augmented generation in 200 lines, 100% in-browser.', fr: 'RAG en 200 lignes, 100% dans le navigateur.' },
      problem: { en: 'Most RAG demos need a vector DB, a backend, and a wallet. I wanted to prove the core idea fits in a single file with zero server — perfect for teaching and tiny apps.', fr: 'La plupart des démos RAG exigent une base vectorielle, un backend et un portefeuille. Je voulais prouver que l\u2019idée tient dans un seul fichier sans serveur — idéal pour enseigner et pour les petites apps.' },
      experiment: { en: 'Embeddings computed client-side, stored in IndexedDB, cosine-similarity search in plain JS, then the top-k chunks stuffed into the prompt. No infrastructure, fully offline after first load.', fr: 'Embeddings calculés côté client, stockés dans IndexedDB, recherche par similarité cosinus en JS pur, puis les k meilleurs morceaux injectés dans le prompt. Aucune infrastructure, hors-ligne après le premier chargement.' },
      arch: [ ['Embeddings (WASM)', { en: 'vectorize chunks in-browser', fr: 'vectorise les morceaux dans le navigateur' }],
              ['IndexedDB', { en: 'persists vectors locally', fr: 'persiste les vecteurs en local' }],
              ['Cosine search (JS)', { en: 'top-k retrieval', fr: 'récupération top-k' }],
              ['LLM completion', { en: 'answers with citations', fr: 'répond avec citations' }] ],
      learned: { en: ['For <5k chunks, brute-force cosine in JS is plenty fast — no ANN index needed.', 'Chunking strategy mattered more than the model choice for answer quality.', 'Shipping it as one file made it the most-forked thing I\u2019ve built.'],
                 fr: ['Pour <5k morceaux, le cosinus brut en JS suffit largement — pas besoin d\u2019index ANN.', 'La stratégie de découpage a compté plus que le choix du modèle pour la qualité.', 'Le livrer en un seul fichier en a fait mon projet le plus forké.'] } },

    useglass: { name: 'use-glass', status: 'live',
      cat: { en: 'Open Source', fr: 'Open Source' },
      tagline: { en: 'A React hook for glassmorphism that doesn\u2019t tank your frame rate.', fr: 'Un hook React pour un glassmorphism qui ne tue pas vos FPS.' },
      problem: { en: 'Stacked `backdrop-filter: blur()` layers look gorgeous and murder scroll performance on mid-range devices. Every project re-solved this badly.', fr: 'Les couches de `backdrop-filter: blur()` empilées sont superbes mais détruisent le scroll sur les appareils moyens. Chaque projet le résolvait mal.' },
      experiment: { en: 'A hook that measures device capability, caps active blur layers, and swaps to a cheap pre-rendered gradient when off-screen or on weak GPUs — same look, a fraction of the cost.', fr: 'Un hook qui mesure la capacité de l\u2019appareil, plafonne les couches de flou actives et bascule sur un dégradé pré-rendu bon marché hors écran ou sur GPU faible — même rendu, coût divisé.' },
      arch: [ ['Capability probe', { en: 'benchmarks GPU on mount', fr: 'évalue le GPU au montage' }],
              ['IntersectionObserver', { en: 'disables blur off-screen', fr: 'désactive le flou hors écran' }],
              ['CSS var orchestration', { en: 'live-tunes blur radius', fr: 'ajuste le rayon de flou en direct' }],
              ['Fallback gradient', { en: 'static look-alike layer', fr: 'couche statique similaire' }] ],
      learned: { en: ['Most "glass" pixels are off-screen — gating on visibility was the single biggest win.', 'A good API hides the hard call: developers just want `useGlass()` to be fast by default.', 'Open-sourcing forced docs discipline that made the code better.'],
                 fr: ['La plupart des pixels « verre » sont hors écran — filtrer sur la visibilité fut le plus grand gain.', 'Une bonne API cache le choix difficile : les devs veulent juste que `useGlass()` soit rapide par défaut.', 'L\u2019open-source a imposé une rigueur de doc qui a amélioré le code.'] } },

    tsresult: { name: 'ts-result', status: 'live',
      cat: { en: 'Open Source', fr: 'Open Source' },
      tagline: { en: 'Rust-style Result types that make TypeScript errors explicit.', fr: 'Des types Result façon Rust qui rendent les erreurs TypeScript explicites.' },
      problem: { en: 'Thrown exceptions are invisible to the type system — you never know what a function can fail with until it does, in production.', fr: 'Les exceptions levées sont invisibles pour le système de types — on ignore comment une fonction peut échouer jusqu\u2019à ce qu\u2019elle le fasse, en production.' },
      experiment: { en: 'A tiny `Result<T, E>` with `ok`/`err`, exhaustive `match`, and chainable `map`/`andThen`. Errors become values the compiler forces you to handle.', fr: 'Un petit `Result<T, E>` avec `ok`/`err`, un `match` exhaustif et des `map`/`andThen` chaînables. Les erreurs deviennent des valeurs que le compilateur force à traiter.' },
      arch: [ ['Result<T,E> union', { en: 'ok | err discriminated type', fr: 'type discriminé ok | err' }],
              ['Combinators', { en: 'map / andThen / unwrapOr', fr: 'map / andThen / unwrapOr' }],
              ['match()', { en: 'exhaustive handling', fr: 'gestion exhaustive' }],
              ['Zero deps', { en: '<1kb gzipped', fr: '<1ko gzippé' }] ],
      learned: { en: ['Ergonomics decide adoption — without `match`, nobody used it.', 'Keeping it dependency-free and tiny was why teams trusted it.', 'Porting an idea across languages teaches you what was essential vs incidental.'],
                 fr: ['L\u2019ergonomie décide de l\u2019adoption — sans `match`, personne ne l\u2019utilisait.', 'Le garder sans dépendance et minuscule a inspiré confiance aux équipes.', 'Porter une idée d\u2019un langage à l\u2019autre révèle l\u2019essentiel de l\u2019accessoire.'] } },

    webglgrid: { name: 'webgl-grid', status: 'archived',
      cat: { en: 'Open Source', fr: 'Open Source' },
      tagline: { en: 'An infinite, GPU-driven grid shader for endless canvases.', fr: 'Un shader de grille infinie piloté par GPU pour canevas sans fin.' },
      problem: { en: 'Rendering a pannable infinite grid with DOM or canvas2D chokes past a few thousand cells. I wanted buttery infinite zoom for node editors.', fr: 'Rendre une grille infinie déplaçable en DOM ou canvas2D s\u2019étouffe au-delà de quelques milliers de cellules. Je voulais un zoom infini fluide pour éditeurs de nœuds.' },
      experiment: { en: 'Draw the grid entirely in a fragment shader from screen coordinates — no geometry, no DOM. The grid is computed per-pixel, so it\u2019s O(1) regardless of zoom.', fr: 'Dessiner la grille entièrement dans un fragment shader à partir des coordonnées écran — pas de géométrie, pas de DOM. La grille est calculée par pixel, donc O(1) quel que soit le zoom.' },
      arch: [ ['Fullscreen quad', { en: 'single triangle pass', fr: 'passe en triangle unique' }],
              ['Fragment shader', { en: 'grid math per pixel', fr: 'calcul de grille par pixel' }],
              ['Uniform camera', { en: 'pan / zoom via 1 matrix', fr: 'pan / zoom via 1 matrice' }],
              ['No DOM nodes', { en: 'constant memory', fr: 'mémoire constante' }] ],
      learned: { en: ['Moving layout math to the GPU flipped a perf cliff into a flat line.', 'Archived not because it failed but because the use-case moved on — the shader still gets forked.', 'Sometimes the best outcome of an experiment is a technique you reuse elsewhere.'],
                 fr: ['Déplacer le calcul de mise en page vers le GPU a transformé une falaise de perf en ligne plate.', 'Archivé non par échec mais parce que le cas d\u2019usage a évolué — le shader est toujours forké.', 'Parfois le meilleur résultat d\u2019une expérience est une technique réutilisée ailleurs.'] } },

    inboxtriage: { name: 'Inbox Triage Bot', status: 'live',
      cat: { en: 'Automation', fr: 'Automatisation' },
      tagline: { en: 'An agent that reads, labels, and drafts replies to my inbox.', fr: 'Un agent qui lit, étiquette et rédige les réponses de ma boîte mail.' },
      problem: { en: 'Email triage eats the first hour of every day: sorting noise from signal and writing the same kinds of replies over and over.', fr: 'Le tri des emails dévore la première heure de chaque journée : séparer le bruit du signal et écrire sans cesse les mêmes réponses.' },
      experiment: { en: 'A scheduled agent classifies each thread, applies labels, and drafts (never sends) replies in my voice using past threads as style examples. I just review and hit send.', fr: 'Un agent planifié classe chaque fil, applique des étiquettes et rédige (sans jamais envoyer) des réponses dans mon style à partir d\u2019anciens fils. Je n\u2019ai qu\u2019à relire et envoyer.' },
      arch: [ ['Gmail API (poll)', { en: 'pulls new threads', fr: 'récupère les nouveaux fils' }],
              ['Classifier (LLM)', { en: 'intent + priority labels', fr: 'étiquettes intention + priorité' }],
              ['Draft generator', { en: 'reply in my voice', fr: 'réponse dans mon style' }],
              ['Human-in-the-loop', { en: 'I approve before send', fr: 'je valide avant envoi' }] ],
      learned: { en: ['"Draft, never send" was the trust unlock — full autonomy felt scary, assisted felt great.', 'Few-shot examples of my own replies mattered far more than clever prompting.', 'Saving ~40 min/day compounds into real focus time.'],
                 fr: ['« Rédiger, jamais envoyer » a débloqué la confiance — l\u2019autonomie totale faisait peur, l\u2019assistance enchantait.', 'Quelques exemples de mes propres réponses ont compté bien plus qu\u2019un prompt astucieux.', 'Gagner ~40 min/jour se cumule en vrai temps de concentration.'] } },

    deploysentinel: { name: 'Deploy Sentinel', status: 'wip',
      cat: { en: 'Automation', fr: 'Automatisation' },
      tagline: { en: 'Watches deploys and auto-rolls-back when metrics go wrong.', fr: 'Surveille les déploiements et fait un rollback auto si les métriques dérapent.' },
      problem: { en: 'A bad deploy at 2am means an alert, a groggy human, and minutes of downtime before anyone rolls back. The machine should catch it first.', fr: 'Un mauvais déploiement à 2h du matin, c\u2019est une alerte, un humain ensommeillé et des minutes d\u2019indisponibilité avant tout rollback. La machine devrait l\u2019attraper d\u2019abord.' },
      experiment: { en: 'After each deploy, Sentinel watches error rate and latency against a baseline. If they breach thresholds within a window, it auto-reverts to the last healthy build and posts the diff to Slack.', fr: 'Après chaque déploiement, Sentinel surveille le taux d\u2019erreur et la latence par rapport à une référence. En cas de dépassement dans une fenêtre, il revient automatiquement au dernier build sain et poste le diff sur Slack.' },
      arch: [ ['Deploy webhook', { en: 'marks a watch window', fr: 'ouvre une fenêtre de surveillance' }],
              ['Metrics poller', { en: 'error rate + p95 vs baseline', fr: 'taux d\u2019erreur + p95 vs référence' }],
              ['Decision engine', { en: 'breach \u2192 rollback', fr: 'dépassement \u2192 rollback' }],
              ['Slack notifier', { en: 'posts what & why', fr: 'poste quoi & pourquoi' }] ],
      learned: { en: ['Defining "healthy" is the hard part — static thresholds cause false rollbacks; baselines per-route help.', 'A confident auto-revert needs an equally confident "all clear" or humans stop trusting it.', 'Still WIP: tuning the watch window to balance speed vs flapping.'],
                 fr: ['Définir « sain » est le plus dur — les seuils statiques causent de faux rollbacks ; les références par route aident.', 'Un rollback auto confiant exige un « tout va bien » aussi confiant, sinon les humains cessent d\u2019y croire.', 'Toujours en cours : régler la fenêtre pour équilibrer vitesse et oscillation.'] } },

    synthwave: { name: 'Synthwave Synth', status: 'live',
      cat: { en: 'Side Project', fr: 'Projet perso' },
      tagline: { en: 'A browser synth with a generative arpeggiator and retro glow.', fr: 'Un synthé navigateur avec arpégiateur génératif et lueur rétro.' },
      problem: { en: 'I wanted to learn the Web Audio API deeply, and reading docs wasn\u2019t cutting it — I needed something I\u2019d actually play with.', fr: 'Je voulais apprendre l\u2019API Web Audio en profondeur, et lire la doc ne suffisait pas — il me fallait un truc avec lequel jouer vraiment.' },
      experiment: { en: 'A polyphonic synth with oscillators, filters, and a delay, plus a generative arpeggiator seeded by a key and scale. The UI reacts to the audio in real time with a synthwave aesthetic.', fr: 'Un synthé polyphonique avec oscillateurs, filtres et delay, plus un arpégiateur génératif initialisé par une tonalité et une gamme. L\u2019UI réagit à l\u2019audio en temps réel dans une esthétique synthwave.' },
      arch: [ ['Web Audio graph', { en: 'osc \u2192 filter \u2192 delay \u2192 out', fr: 'osc \u2192 filtre \u2192 delay \u2192 sortie' }],
              ['Arp engine', { en: 'scale-aware note generator', fr: 'générateur de notes selon la gamme' }],
              ['AnalyserNode', { en: 'drives the visuals', fr: 'pilote les visuels' }],
              ['Canvas viz', { en: 'real-time spectrum', fr: 'spectre en temps réel' }] ],
      learned: { en: ['Audio scheduling is unforgiving — you schedule ahead of time, not on the beat.', 'Building a toy taught me more Web Audio than any tutorial.', 'Tying visuals to the analyser made it feel alive with almost no extra code.'],
                 fr: ['L\u2019ordonnancement audio est impitoyable — on planifie en avance, pas sur le temps.', 'Construire un jouet m\u2019a appris plus de Web Audio que n\u2019importe quel tuto.', 'Lier les visuels à l\u2019analyseur l\u2019a rendu vivant avec presque aucun code en plus.'] } },

    focusboard: { name: 'Focusboard', status: 'wip',
      cat: { en: 'Side Project', fr: 'Projet perso' },
      tagline: { en: 'A local-first, minimal task board built for deep work.', fr: 'Un tableau de tâches local-first et minimal, pensé pour le deep work.' },
      problem: { en: 'Every task app I tried became a notification machine. I wanted the opposite: a calm board that lives on my machine and never nags.', fr: 'Chaque app de tâches que j\u2019essayais devenait une machine à notifications. Je voulais l\u2019inverse : un tableau calme qui vit sur ma machine et ne harcèle jamais.' },
      experiment: { en: 'Local-first storage (no account, no cloud) with CRDT-ready data so it can sync later if I want. The whole UI is keyboard-driven and deliberately feature-sparse.', fr: 'Stockage local-first (sans compte, sans cloud) avec des données prêtes pour CRDT afin de synchroniser plus tard si besoin. Toute l\u2019UI est pilotée au clavier et volontairement minimaliste.' },
      arch: [ ['IndexedDB store', { en: 'local source of truth', fr: 'source de vérité locale' }],
              ['CRDT-ready model', { en: 'conflict-free future sync', fr: 'sync future sans conflit' }],
              ['Keyboard layer', { en: 'everything without a mouse', fr: 'tout sans la souris' }],
              ['No server', { en: 'works fully offline', fr: 'fonctionne hors-ligne' }] ],
      learned: { en: ['Constraints are a feature — saying no to features is what makes it calm.', 'Local-first is liberating but "where\u2019s my data" anxiety is real; export matters.', 'Still WIP: optional sync without betraying the no-cloud promise.'],
                 fr: ['Les contraintes sont une fonctionnalité — dire non aux features est ce qui le rend calme.', 'Le local-first libère, mais l\u2019angoisse « où sont mes données » est réelle ; l\u2019export compte.', 'Toujours en cours : une sync optionnelle sans trahir la promesse sans-cloud.'] } },

    edgeinference: { name: 'Edge Inference', status: 'wip',
      cat: { en: 'R&D', fr: 'R&D' },
      tagline: { en: 'Running quantized models at the edge, close to the user.', fr: 'Exécuter des modèles quantifiés à la périphérie, près de l\u2019utilisateur.' },
      problem: { en: 'Round-tripping every small inference to a central GPU adds latency and cost. Many tasks are small enough to run nearer the user.', fr: 'Faire l\u2019aller-retour de chaque petite inférence vers un GPU central ajoute latence et coût. Beaucoup de tâches sont assez petites pour tourner plus près de l\u2019utilisateur.' },
      experiment: { en: 'Deploy small quantized models to Cloudflare Workers and measure cold-start, latency, and quality vs a central endpoint for classification and embedding tasks.', fr: 'Déployer de petits modèles quantifiés sur Cloudflare Workers et mesurer démarrage à froid, latence et qualité face à un point central pour classification et embeddings.' },
      arch: [ ['Quantized model', { en: 'int8 weights, small footprint', fr: 'poids int8, faible empreinte' }],
              ['Workers runtime', { en: 'runs at 300+ edge POPs', fr: 'tourne sur 300+ POPs edge' }],
              ['Cache layer', { en: 'memoizes hot inputs', fr: 'mémorise les entrées fréquentes' }],
              ['Fallback to central', { en: 'for heavy requests', fr: 'pour les requêtes lourdes' }] ],
      learned: { en: ['Cold starts dominate the story — keeping models tiny matters more than raw speed.', 'Edge wins for classification/embeddings; generation still wants the big iron.', 'Still researching the quality/latency trade-off curve.'],
                 fr: ['Les démarrages à froid dominent — garder les modèles minuscules compte plus que la vitesse brute.', 'L\u2019edge gagne pour classification/embeddings ; la génération veut encore les gros serveurs.', 'Recherche en cours sur la courbe qualité/latence.'] } },

    latencybudgets: { name: 'Latency Budgets', status: 'wip',
      cat: { en: 'R&D', fr: 'R&D' },
      tagline: { en: 'Designing agentic UX that feels instant under 100ms.', fr: 'Concevoir une UX agentique qui paraît instantanée sous 100ms.' },
      problem: { en: 'AI features often feel sluggish not because they\u2019re slow, but because the UX shows nothing while waiting. Perceived latency is a design problem.', fr: 'Les fonctionnalités IA semblent souvent lentes non parce qu\u2019elles le sont, mais parce que l\u2019UX ne montre rien pendant l\u2019attente. La latence perçue est un problème de design.' },
      experiment: { en: 'I\u2019m cataloguing patterns — optimistic UI, streaming tokens, skeleton intent, speculative prefetch — and measuring how each shifts perceived speed independently of real latency.', fr: 'Je catalogue des patterns — UI optimiste, tokens en streaming, squelettes d\u2019intention, préchargement spéculatif — et je mesure comment chacun déplace la vitesse perçue indépendamment de la latence réelle.' },
      arch: [ ['Optimistic UI', { en: 'show the likely result now', fr: 'montrer le résultat probable tout de suite' }],
              ['Token streaming', { en: 'first token < 200ms', fr: 'premier token < 200ms' }],
              ['Speculative prefetch', { en: 'predict the next action', fr: 'prédire l\u2019action suivante' }],
              ['Intent skeletons', { en: 'shape before content', fr: 'la forme avant le contenu' }] ],
      learned: { en: ['Time-to-first-feedback beats time-to-completion for perceived speed.', 'Streaming changes the contract: users forgive slow if they see motion.', 'This is ongoing — the goal is a reusable "latency budget" checklist for AI UIs.'],
                 fr: ['Le délai avant premier retour bat le délai d\u2019achèvement pour la vitesse perçue.', 'Le streaming change le contrat : on pardonne la lenteur si l\u2019on voit du mouvement.', 'En cours — l\u2019objectif est une checklist réutilisable de « budget latence » pour les UI IA.'] } }
  };

  /* ---------- build modal ---------- */
  const ov = document.createElement('div'); ov.className = 'lab-reader-ov';
  const reader = document.createElement('div'); reader.className = 'lab-reader'; reader.setAttribute('role', 'dialog'); reader.setAttribute('aria-modal', 'true');
  document.body.appendChild(ov); document.body.appendChild(reader);

  const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';

  // ordered ids for prev/next (matches DOM / data order)
  const ORDER = Object.keys(D);
  // icons
  const codeIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>';
  const demoIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>';

  function linksFor(d) {
    // derive: every experiment has code; live ones also have a demo
    const out = [`<a class="lr-link primary" href="#" target="_blank" rel="noopener">${codeIc}${t(LABELS.code)}</a>`];
    if (d.status === 'live') out.push(`<a class="lr-link" href="#" target="_blank" rel="noopener">${demoIc}${t(LABELS.demo)}</a>`);
    return out.join('');
  }

  function render(id) {
    const d = D[id]; if (!d) return;
    const stLabel = t(LABELS[d.status]);
    const archHtml = d.arch.map((n, i) => {
      const node = `<div class="anode"><span class="ix">${String(i + 1).padStart(2, '0')}</span><span class="tx"><b>${n[0]}</b> — ${t(n[1])}</span></div>`;
      return node + (i < d.arch.length - 1 ? '<div class="link"></div>' : '');
    }).join('');
    const learnedHtml = t(d.learned).map(li => `<li>${check}<span>${li}</span></li>`).join('');
    const idx = ORDER.indexOf(id);
    const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
    const nextId = ORDER[(idx + 1) % ORDER.length];
    reader.innerHTML = `
      <div class="lr-head">
        <button class="x" type="button" aria-label="Close">✕</button>
        <div class="lr-eyebrow"><span>${t(d.cat)}</span><span class="st"><span class="d ${d.status}"></span>${stLabel}</span></div>
        <h3>${d.name}</h3>
        <p class="lr-tagline">${t(d.tagline)}</p>
        <div class="lr-actions">${linksFor(d)}</div>
      </div>
      <div class="lr-body">
        <div class="lr-sec"><h4><span class="n">01</span>${t(LABELS.problem)}</h4><p>${md(t(d.problem))}</p></div>
        <div class="lr-sec"><h4><span class="n">02</span>${t(LABELS.experiment)}</h4><p>${md(t(d.experiment))}</p></div>
        <div class="lr-sec"><h4><span class="n">03</span>${t(LABELS.architecture)}</h4><div class="lr-arch">${archHtml}</div></div>
        <div class="lr-sec"><h4><span class="n">04</span>${t(LABELS.learned)}</h4><ul class="lr-learned">${learnedHtml}</ul></div>
      </div>
      <div class="lr-foot">
        <button class="lr-nav prev" type="button" data-go="${prevId}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          <span class="lr-nav-tx"><small>${t(LABELS.prev)}</small><b>${D[prevId].name}</b></span>
        </button>
        <span class="lr-count">${String(idx + 1).padStart(2, '0')} / ${String(ORDER.length).padStart(2, '0')}</span>
        <button class="lr-nav next" type="button" data-go="${nextId}">
          <span class="lr-nav-tx"><small>${t(LABELS.next)}</small><b>${D[nextId].name}</b></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>`;
    reader.querySelector('.x').addEventListener('click', close);
    reader.querySelectorAll('.lr-nav').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
    reader.querySelector('.lr-body').scrollTop = 0;
  }
  function md(s) { return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<strong>$1</strong>'); }

  let openId = null, lastFocus = null;
  function open(id) {
    openId = id; lastFocus = document.activeElement;
    render(id);
    ov.classList.add('show'); reader.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function go(id) {
    if (!id || !D[id]) return;
    openId = id;
    // quick crossfade
    reader.classList.add('switching');
    setTimeout(() => { render(id); reader.classList.remove('switching'); }, 160);
  }
  function close() {
    openId = null;
    ov.classList.remove('show'); reader.classList.remove('show');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  ov.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (!openId) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') { const i = ORDER.indexOf(openId); go(ORDER[(i - 1 + ORDER.length) % ORDER.length]); }
    else if (e.key === 'ArrowRight') { const i = ORDER.indexOf(openId); go(ORDER[(i + 1) % ORDER.length]); }
  });

  // attach chevrons + handlers to lab items
  function wire() {
    $$('.lab-item[data-lab]').forEach(item => {
      if (!item.querySelector('.chev')) {
        const c = document.createElement('span');
        c.className = 'chev';
        c.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
        item.appendChild(c);
      }
      const id = item.dataset.lab;
      item.addEventListener('click', () => open(id));
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(id); } });
    });
  }

  // re-render on language change if open
  window.addEventListener('langchange', () => { if (openId) render(openId); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
