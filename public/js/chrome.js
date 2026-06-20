/* ============================================================
   CHROME — cursor + language switch + tweaks (projects page)
   Self-contained so the home page (app.js) stays untouched.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const T = window.__TWEAKS__ || { accent: '#a855f7', accent2: '#00e5ff', blur: 18 };
  const ACCENTS = {
    '#00e5ff': { rgb: '0, 229, 255', a2: '#4f7dff' },
    '#4f7dff': { rgb: '79, 125, 255', a2: '#8a5cff' },
    '#a855f7': { rgb: '168, 85, 247', a2: '#00e5ff' },
    '#34d399': { rgb: '52, 211, 153', a2: '#00e5ff' }
  };
  function applyAccent(hex) {
    const m = ACCENTS[hex] || ACCENTS['#a855f7'];
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-rgb', m.rgb);
    document.documentElement.style.setProperty('--accent-2', m.a2);
  }
  function applyBlur(v) { document.documentElement.style.setProperty('--glass-blur', v + 'px'); }
  applyAccent(T.accent); applyBlur(T.blur != null ? T.blur : 18);

  /* ---------- HUD scroll state + progress ---------- */
  const hud = $('.hud'), prog = $('.scroll-prog');
  function onScroll() {
    const y = window.scrollY;
    if (hud) hud.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- custom cursor ---------- */
  if (window.matchMedia('(pointer:fine)').matches && !reduce) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.documentElement.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, vis = false;
    addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!vis) { vis = true; dot.style.opacity = ring.style.opacity = '1'; }
    }, { passive: true });
    addEventListener('mouseout', (e) => { if (!e.relatedTarget) { dot.style.opacity = ring.style.opacity = '0'; vis = false; } });
    addEventListener('mousedown', () => document.documentElement.classList.add('cursor-down'));
    addEventListener('mouseup', () => document.documentElement.classList.remove('cursor-down'));
    const hoverSel = 'a, button, input, textarea, .proj, .filter-pill, .tk-swatch, [role="button"], label';
    document.addEventListener('pointerover', (e) => {
      document.documentElement.classList.toggle('cursor-hover', !!(e.target.closest && e.target.closest(hoverSel)));
      document.documentElement.classList.toggle('cursor-text', !!(e.target.closest && e.target.closest('input, textarea')));
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- language switch ---------- */
  (function () {
    const sw = $('.lang-switch');
    let saved = (window.I18N && window.I18N.detect) ? window.I18N.detect() : 'en';
    function setLang(lang) {
      lang = (lang === 'fr') ? 'fr' : 'en';
      if (sw) sw.setAttribute('data-active', lang);
      if (window.I18N) window.I18N.apply(lang);
    }
    $$('.lang-opt').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
    setLang(saved);
  })();

  /* ---------- tweaks panel ---------- */
  const panel = $('#tweaks');
  if (panel) {
    addEventListener('message', (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') panel.classList.add('show');
      if (d.type === '__deactivate_edit_mode') panel.classList.remove('show');
    });
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    const persist = (edits) => window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    const closeBtn = $('#tk-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { panel.classList.remove('show'); window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); });

    $$('.tk-swatch').forEach(sw => {
      sw.classList.toggle('sel', sw.dataset.c === T.accent);
      sw.addEventListener('click', () => {
        $$('.tk-swatch').forEach(s => s.classList.remove('sel'));
        sw.classList.add('sel'); T.accent = sw.dataset.c; applyAccent(T.accent);
        persist({ accent: T.accent, accent2: (ACCENTS[T.accent] || {}).a2 });
      });
    });
    const bS = $('#tk-blur'), bV = $('#tk-blur-v');
    if (bS) { bS.value = T.blur; bV.textContent = T.blur + 'px';
      bS.addEventListener('input', () => { T.blur = +bS.value; bV.textContent = T.blur + 'px'; applyBlur(T.blur); persist({ blur: T.blur }); }); }
  }
})();
