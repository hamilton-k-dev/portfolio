/* ============================================================
   APP — boot, nav, reveals, counters, tilt, contact, tweaks
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tweak state ---------- */
  const T = window.__TWEAKS__ || { accent: '#00e5ff', accent2: '#4f7dff', motion: 7, density: 1, blur: 18 };
  const ACCENTS = {
    '#00e5ff': { rgb: '0, 229, 255', a2: '#4f7dff' },
    '#4f7dff': { rgb: '79, 125, 255', a2: '#8a5cff' },
    '#a855f7': { rgb: '168, 85, 247', a2: '#00e5ff' },
    '#34d399': { rgb: '52, 211, 153', a2: '#00e5ff' }
  };
  function applyAccent(hex) {
    const meta = ACCENTS[hex] || ACCENTS['#00e5ff'];
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-rgb', meta.rgb);
    document.documentElement.style.setProperty('--accent-2', meta.a2);
    if (window.HeroScene) window.HeroScene.setAccent(hex, meta.a2);
  }
  function applyMotion(v) {
    const mult = v / 7; // slider 0..10, 7 = baseline 1
    document.documentElement.style.setProperty('--motion', mult.toFixed(2));
    if (window.HeroScene) window.HeroScene.setMotion(reduce ? 0 : mult);
  }
  function applyBlur(v) { document.documentElement.style.setProperty('--glass-blur', v + 'px'); }

  /* ============================================================
     BOOT SEQUENCE
     ============================================================ */
  const boot = $('#boot');
  const pr = $('.boot-ring .pr');
  const pctEl = $('.boot-pct');
  const logEl = $('.boot-log');
  const LOGS_EN = [
    'initializing kernel <b>core.sys</b>',
    'mounting <b>/dev/portfolio</b>',
    'loading shader pipeline <b>webgl.v2</b>',
    'calibrating particle field <b>2.6k nodes</b>',
    'syncing neural skill matrix',
    'establishing secure uplink',
    'render systems <b>online</b>'
  ];
  const bootLogs = () => (window.I18N ? window.I18N.logs() : LOGS_EN);
  function runBoot() {
    if (runBoot._started) return; runBoot._started = true;
    let p = 0, li = 0;
    const total = 408;
    const tick = () => {
      p += Math.random() * 9 + 3;
      if (p > 100) p = 100;
      pctEl.textContent = String(Math.floor(p)).padStart(3, '0');
      pr.style.strokeDashoffset = total - (total * p) / 100;
      const LOGS = bootLogs();
      const idx = Math.min(LOGS.length - 1, Math.floor((p / 100) * LOGS.length));
      if (idx !== li) { li = idx; logEl.innerHTML = LOGS[idx]; }
      if (p < 100) setTimeout(tick, 130 + Math.random() * 120);
      else setTimeout(finishBoot, 480);
    };
    tick();
  }
  function finishBoot() {
    if (finishBoot._done) return; finishBoot._done = true;
    boot.classList.add('done');
    document.body.classList.remove('no-scroll');
    startHero();
    setTimeout(() => { boot.style.display = 'none'; }, 900);
  }

  /* ============================================================
     HERO ENTRANCE
     ============================================================ */
  function startHero() {
    // init 3D
    if (window.THREE && window.HeroScene) {
      try {
        window.HeroScene.init($('#hero-canvas'), {
          accent: T.accent, accent2: (ACCENTS[T.accent] || {}).a2,
          motion: reduce ? 0 : T.motion / 7, density: T.density
        });
      } catch (e) { console.warn('hero scene failed', e); }
    }
    // text entrance — CSS keyframes whose end-state is the natural visible style.
    // Safety net: remove the class after the entrance window so content can never
    // get stuck in the hidden start-state (e.g. if animations are throttled).
    if (!reduce) {
      const h = $('.hero');
      h.classList.add('animate');
      setTimeout(() => h.classList.remove('animate'), 2600);
    }
    // floating chips drift
    if (!reduce) {
      $$('.hero-chip').forEach((c, i) => {
        c.animate(
          [{ transform: 'translateY(0)' }, { transform: `translateY(${i % 2 ? 12 : -12}px)` }, { transform: 'translateY(0)' }],
          { duration: 5000 + i * 800, iterations: Infinity, easing: 'ease-in-out' }
        );
      });
    }
  }

  /* ============================================================
     HUD / NAV / SCROLL PROGRESS
     ============================================================ */
  const hud = $('.hud');
  const prog = $('.scroll-prog');
  const navLinks = $$('.nav-links a');
  const heroCanvas = $('#hero-canvas');
  function onScroll() {
    const y = window.scrollY;
    hud.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    // hero scroll progress (0 at top → 1 after one viewport) drives the 3D scene
    const hp = Math.max(0, Math.min(1, y / (window.innerHeight * 0.9)));
    if (window.HeroScene) window.HeroScene.setScroll(hp);
    // fade the fixed canvas out as the hero leaves so deeper sections stay clean
    if (heroCanvas) {
      const fade = 1 - Math.max(0, Math.min(1, (y - window.innerHeight * 0.5) / (window.innerHeight * 0.6)));
      heroCanvas.style.opacity = fade.toFixed(3);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // active section
  const sections = $$('section[id]');
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObs.observe(s));

  // smooth scroll for nav + ctas
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const t = $(id);
        if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 10, behavior: reduce ? 'auto' : 'smooth' }); }
      }
    });
  });

  /* ============================================================
     REVEALS + COUNTERS + SKILL BARS
     ============================================================ */
  const revObs = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }) : null;
  const revealEls = $$('[data-reveal]');
  if (revObs) revealEls.forEach(el => revObs.observe(el));
  // Robust fallback: reveal anything in the viewport on scroll/resize, independent of IO.
  function checkReveals() {
    const vh = window.innerHeight;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (el.classList.contains('in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
    }
  }
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals);
  setTimeout(checkReveals, 400);
  // safety net: if nothing revealed shortly after load (e.g. IO throttled), force-show
  setTimeout(() => { if (!document.querySelector('[data-reveal].in')) revealEls.forEach(el => el.classList.add('in')); }, 2600);

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.indexOf('.') >= 0) ? 1 : 0;
    const dur = 1500; const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (k < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
    };
    requestAnimationFrame(step);
  }
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  const barObs = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.bar i');
        if (fill) setTimeout(() => fill.style.width = fill.dataset.w + '%', 120);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 }) : null;
  const skillRows = $$('.skill-row');
  if (barObs) skillRows.forEach(el => barObs.observe(el));
  function checkBars() {
    const vh = window.innerHeight;
    skillRows.forEach(row => {
      const fill = row.querySelector('.bar i');
      if (!fill || fill.style.width) return;
      const r = row.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) fill.style.width = fill.dataset.w + '%';
    });
  }
  window.addEventListener('scroll', checkBars, { passive: true });
  setTimeout(checkBars, 500);

  /* ============================================================
     TIMELINE BEAM + NODE LIGHTING
     ============================================================ */
  const tl = $('.timeline');
  const beam = $('.tl-beam');
  const tlItems = $$('.tl-item');
  function updateTimeline() {
    if (!tl) return;
    const rect = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.65;
    const traveled = Math.max(0, Math.min(rect.height, start - rect.top));
    beam.style.height = traveled + 'px';
    tlItems.forEach(it => {
      const nr = it.querySelector('.tl-node').getBoundingClientRect();
      it.classList.toggle('lit', nr.top < start + 8);
    });
  }
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();

  /* ============================================================
     PROJECT TILT + SHINE
     ============================================================ */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    $$('.proj').forEach(card => {
      const max = 8;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg) translateZ(0)`;
        const sh = card.querySelector('.proj-shine');
        if (sh) { sh.style.setProperty('--mx', px * 100 + '%'); sh.style.setProperty('--my', py * 100 + '%'); }
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const form = $('#contact-form');
  if (form) {
    const sendBtn = $('.send-btn');
    const note = $('.form-note');
    const setErr = (field, on) => field.classList.toggle('err', on);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fName = $('#f-name'), fEmail = $('#f-email'), fMsg = $('#f-msg');
      let ok = true;
      const nameF = fName.closest('.field'), emailF = fEmail.closest('.field'), msgF = fMsg.closest('.field');
      if (!fName.value.trim()) { setErr(nameF, true); ok = false; } else setErr(nameF, false);
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value);
      if (!emailOk) { setErr(emailF, true); ok = false; } else setErr(emailF, false);
      if (fMsg.value.trim().length < 8) { setErr(msgF, true); ok = false; } else setErr(msgF, false);
      if (!ok) { note.textContent = (window.I18N && window.I18N.current === 'fr') ? '// transmission bloquée — vérifiez les champs' : '// transmission blocked — check fields'; note.style.color = '#ff8088'; return; }

      const fr = window.I18N && window.I18N.current === 'fr';
      sendBtn.classList.add('sending');
      sendBtn.querySelector('.lbl').textContent = fr ? 'TRANSMISSION…' : 'TRANSMITTING…';
      note.style.color = '';
      let dots = 0;
      const di = setInterval(() => { dots = (dots + 1) % 4; note.textContent = (fr ? '// liaison' : '// uplink') + '.'.repeat(dots); }, 280);
      setTimeout(() => {
        clearInterval(di);
        sendBtn.classList.remove('sending'); sendBtn.classList.add('sent');
        sendBtn.querySelector('.lbl').textContent = fr ? 'MESSAGE ENVOYÉ ✓' : 'MESSAGE SENT ✓';
        note.textContent = fr ? '// signal reçu — réponse sous 24h' : '// signal received — response inbound within 24h';
        note.style.color = 'var(--accent)';
        form.reset();
        setTimeout(() => {
          sendBtn.classList.remove('sent');
          sendBtn.querySelector('.lbl').textContent = (window.I18N && window.I18N.current === 'fr') ? 'TRANSMETTRE LE MESSAGE' : 'TRANSMIT MESSAGE';
        }, 3200);
      }, 2000);
    });
  }

  /* ---------- AI typing effect in contact ---------- */
  const typer = $('#ai-type');
  if (typer && !reduce) {
    let phrases = (window.I18N ? window.I18N.ai() : ['Ready to build something extraordinary.']);
    let pi = 0, ci = 0, del = false, gen = 0;
    window.addEventListener('langchange', () => { phrases = window.I18N.ai(); pi = 0; ci = 0; del = false; gen++; });
    const tick = (myGen) => {
      if (myGen !== gen) return; // a newer language run superseded this one
      const cur = phrases[pi] || '';
      typer.textContent = cur.slice(0, ci);
      if (!del && ci < cur.length) { ci++; setTimeout(() => tick(myGen), 45); }
      else if (!del && ci === cur.length) { del = true; setTimeout(() => tick(myGen), 1900); }
      else if (del && ci > 0) { ci--; setTimeout(() => tick(myGen), 24); }
      else { del = false; pi = (pi + 1) % phrases.length; setTimeout(() => tick(myGen), 350); }
    };
    // restart cleanly whenever language changes
    let lastGen = -1;
    const boot = () => { if (lastGen !== gen) { lastGen = gen; tick(gen); } requestAnimationFrame(boot); };
    boot();
  }

  /* ============================================================
     TWEAKS PANEL (host protocol)
     ============================================================ */
  const panel = $('#tweaks');
  function showPanel() { panel.classList.add('show'); }
  function hidePanel() { panel.classList.remove('show'); }
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') showPanel();
    if (d.type === '__deactivate_edit_mode') hidePanel();
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  function persist(edits) { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); }

  $('#tk-close').addEventListener('click', () => { hidePanel(); window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); });

  // accent swatches
  $$('.tk-swatch').forEach(sw => {
    sw.classList.toggle('sel', sw.dataset.c === T.accent);
    sw.addEventListener('click', () => {
      $$('.tk-swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
      T.accent = sw.dataset.c;
      applyAccent(T.accent);
      persist({ accent: T.accent, accent2: (ACCENTS[T.accent] || {}).a2 });
    });
  });
  // motion
  const mSlider = $('#tk-motion'), mVal = $('#tk-motion-v');
  mSlider.value = T.motion; mVal.textContent = T.motion;
  mSlider.addEventListener('input', () => {
    T.motion = +mSlider.value; mVal.textContent = T.motion; applyMotion(T.motion); persist({ motion: T.motion });
  });
  // density
  const dSlider = $('#tk-density'), dVal = $('#tk-density-v');
  dSlider.value = Math.round(T.density * 100); dVal.textContent = Math.round(T.density * 100) + '%';
  let dT;
  dSlider.addEventListener('input', () => {
    dVal.textContent = dSlider.value + '%';
    clearTimeout(dT);
    dT = setTimeout(() => { T.density = +dSlider.value / 100; if (window.HeroScene) window.HeroScene.setDensity(T.density); persist({ density: T.density }); }, 200);
  });
  // blur
  const bSlider = $('#tk-blur'), bVal = $('#tk-blur-v');
  bSlider.value = T.blur; bVal.textContent = T.blur + 'px';
  bSlider.addEventListener('input', () => {
    T.blur = +bSlider.value; bVal.textContent = T.blur + 'px'; applyBlur(T.blur); persist({ blur: T.blur });
  });

  /* ---------- apply initial tweak values ---------- */
  applyAccent(T.accent);
  applyMotion(T.motion);
  applyBlur(T.blur);

  /* ============================================================
     CUSTOM CURSOR (desktop / fine-pointer only)
     ============================================================ */
  if (window.matchMedia('(pointer:fine)').matches && !reduce) {
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.documentElement.classList.add('has-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let visible = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = '1'; }
    }, { passive: true });
    window.addEventListener('mouseout', (e) => { if (!e.relatedTarget) { dot.style.opacity = ring.style.opacity = '0'; visible = false; } });
    window.addEventListener('mousedown', () => document.documentElement.classList.add('cursor-down'));
    window.addEventListener('mouseup', () => document.documentElement.classList.remove('cursor-down'));

    const hoverSel = 'a, button, input, textarea, .proj, .social, .tk-swatch, .lab-item[data-lab], [role="button"], label';
    const textSel = 'input, textarea';
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target.closest(hoverSel) : null;
      document.documentElement.classList.toggle('cursor-hover', !!t);
      document.documentElement.classList.toggle('cursor-text', !!(e.target.closest && e.target.closest(textSel)));
    });

    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ============================================================
     LANGUAGE SWITCH
     ============================================================ */
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

  /* ---------- kick off ---------- */
  document.body.classList.add('no-scroll');
  if (reduce) {
    // reduced-motion: skip the boot animation
    pctEl.textContent = '100'; pr.style.strokeDashoffset = 0;
    setTimeout(finishBoot, 120);
  } else {
    window.addEventListener('load', () => setTimeout(runBoot, 200));
    // fallback if load already fired
    if (document.readyState === 'complete') setTimeout(runBoot, 300);
  }
})();
