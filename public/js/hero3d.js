/* ============================================================
   HERO 3D SCENE — Three.js
   Particle field + wireframe crystal + holographic grid floor
   Exposes window.HeroScene { init, setAccent, setMotion, setDensity }
   ============================================================ */
(function () {
  let renderer, scene, camera, raf;
  let particles, crystal, crystalGlow, grid, ring1, ring2;
  let accent = new THREE.Color(0x00e5ff);
  let accent2 = new THREE.Color(0x4f7dff);
  let motion = 1;          // 0..1.4 multiplier
  let density = 1;         // particle density multiplier
  let scrollP = 0;         // hero scroll progress 0..1 (target)
  let scrollPe = 0;        // eased
  let offsetX = 0, offsetXTarget = 0;  // responsive rightward shift of the centerpiece
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let canvas, W, H;
  let baseCount = 2600;
  let baseCamZ = 22;       // responsive camera distance (set in resize)

  function makeParticles() {
    if (particles) { scene.remove(particles); particles.geometry.dispose(); particles.material.dispose(); }
    const count = Math.floor(baseCount * density);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 34;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 6;
      spd[i] = 0.2 + Math.random() * 0.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aspeed', new THREE.BufferAttribute(spd, 1));
    const sprite = makeDot();
    const mat = new THREE.PointsMaterial({
      size: 0.13, map: sprite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: accent, opacity: 0.85, sizeAttenuation: true
    });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function makeDot() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  }

  function makeCrystal() {
    const geo = new THREE.IcosahedronGeometry(5.4, 1);
    const mat = new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.55 });
    crystal = new THREE.Mesh(geo, mat);
    scene.add(crystal);
    // inner solid faint
    const innerMat = new THREE.MeshBasicMaterial({ color: accent2, transparent: true, opacity: 0.045 });
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(5.2, 0), innerMat);
    crystal.add(inner);
    // glow points at vertices
    const vGeo = new THREE.IcosahedronGeometry(5.4, 1);
    const vMat = new THREE.PointsMaterial({ size: 0.4, map: makeDot(), color: accent,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 });
    crystalGlow = new THREE.Points(vGeo, vMat);
    crystal.add(crystalGlow);
    crystal.position.set(0, 0, -2);
  }

  function makeRings() {
    const mk = (r, op) => {
      const g = new THREE.RingGeometry(r, r + 0.04, 96);
      const m = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: op, side: THREE.DoubleSide });
      return new THREE.Mesh(g, m);
    };
    ring1 = mk(8.4, 0.22); ring1.rotation.x = Math.PI * 0.5; crystal.add(ring1);
    ring2 = mk(10.2, 0.12); ring2.rotation.x = Math.PI * 0.42; ring2.rotation.y = 0.4; crystal.add(ring2);
  }

  function makeGrid() {
    grid = new THREE.GridHelper(80, 50, accent, accent);
    grid.material.transparent = true; grid.material.opacity = 0.14; grid.material.depthWrite = false;
    grid.position.y = -13; grid.position.z = -10;
    scene.add(grid);
  }

  function applyAccentColors() {
    if (particles) particles.material.color = accent;
    if (crystal) { crystal.material.color = accent; crystalGlow.material.color = accent; }
    if (ring1) ring1.material.color = accent;
    if (ring2) ring2.material.color = accent;
    if (grid) { grid.material.color = accent; }
  }

  function resize() {
    if (!renderer) return;
    W = canvas.clientWidth; H = canvas.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    // On landscape screens the hero text is left-aligned; push the 3D centerpiece
    // into the right third so it balances the text and fills the empty right space.
    // Computed in world units from the actual projected half-width at the crystal's
    // depth, so it lands consistently regardless of aspect ratio.
    const aspect = W / H;
    const dist = 24;                                   // camera(22) → crystal(~-2)
    const halfH = Math.tan((58 * Math.PI / 180) / 2) * dist;
    const halfW = halfH * aspect;
    // Responsive horizontal placement: smoothly ramp the rightward shift with
    // viewport width AND aspect so there is no abrupt jump at any single
    // breakpoint. Phones / portrait stay CENTERED (shift → 0); wide landscape
    // desktop pushes the centerpiece into the right third to balance the
    // left-aligned hero text. Tune SHIFT_MAX to move it further right/left.
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const SHIFT_MAX = 0.5;                             // 0 = centered, 0.5 = halfway toward the right edge
    const widthT = clamp01((W - 760) / (1500 - 760));  // 0 at 760px → 1 at 1500px
    const aspectT = clamp01((aspect - 1.1) / (1.9 - 1.1)); // 0 at 1.1 → 1 at 1.9 aspect
    offsetXTarget = SHIFT_MAX * widthT * aspectT * halfW;

    // Responsive camera distance: keep the camera CLOSE on phones so the
    // centerpiece stays large and clearly visible (pulling back shrinks it and
    // fades it into the dark fog), and move in a bit more on wide desktop so the
    // scene reads larger there too. zoomT: 0 at 480px → 1 at 1100px wide.
    const CAM_FAR = 22;                                // phone → crystal stays clearly visible
    const CAM_NEAR = 19;                               // big desktop → a bit larger than before
    const zoomT = clamp01((W - 480) / (1100 - 480));
    baseCamZ = CAM_FAR + (CAM_NEAR - CAM_FAR) * zoomT;
  }

  let t0 = performance.now();
  function animate() {
    raf = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    const m = motion;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    scrollPe += (scrollP - scrollPe) * 0.07;
    const sp = scrollPe;
    offsetX += (offsetXTarget - offsetX) * 0.06;

    if (crystal) {
      // scroll drives an extra spin + a "fly into the crystal" scale-up
      crystal.rotation.y += dt * (0.18 + sp * 1.1) * m;
      crystal.rotation.x += dt * 0.07 * m;
      crystal.rotation.z = sp * 0.6;
      const cs = 1 + sp * 1.9;
      crystal.scale.setScalar(cs);
      crystal.position.x = mouse.x * 1.2 + offsetX * (1 - sp);
      crystal.position.y = -mouse.y * 0.9 + sp * 2.0;
      crystal.material.opacity = 0.55 * (1 - sp * 0.85);
      crystalGlow.material.opacity = 0.9 * (1 - sp * 0.7);
      ring1.rotation.z += dt * (0.4 + sp * 1.5) * m;
      ring2.rotation.z -= dt * (0.25 + sp * 1.2) * m;
      ring1.material.opacity = 0.22 * (1 - sp);
      ring2.material.opacity = 0.12 * (1 - sp);
    }
    if (particles) {
      particles.rotation.y += dt * (0.02 + sp * 0.25) * m;
      const stream = 0.6 + sp * 5.5; // particles streak past as you scroll
      const p = particles.geometry.attributes.position;
      const s = particles.geometry.attributes.aspeed;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) + s.getX(i) * dt * stream * m;
        if (y > 20) y = -20;
        p.setY(i, y);
      }
      p.needsUpdate = true;
    }
    if (grid) {
      grid.position.z = -10 + ((now * 0.0006 * m) % 1.6) + sp * 14;
      grid.material.opacity = 0.14 * (1 - sp * 0.6);
    }

    // camera parallax + scroll dolly (push through the scene)
    const camZ = baseCamZ - sp * 16;
    camera.position.x += (mouse.x * 2.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 1.6 - camera.position.y) * 0.04;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.lookAt(0, 0, -2);

    renderer.render(scene, camera);
  }

  function init(canvasEl, opts) {
    canvas = canvasEl;
    opts = opts || {};
    if (opts.accent) accent = new THREE.Color(opts.accent);
    if (opts.accent2) accent2 = new THREE.Color(opts.accent2);
    if (typeof opts.motion === 'number') motion = opts.motion;
    if (typeof opts.density === 'number') density = opts.density;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.018);
    camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
    camera.position.set(0, 0, 22);

    makeParticles();
    makeCrystal();
    makeRings();
    makeGrid();
    applyAccentColors();
    resize();
    camera.position.z = baseCamZ;   // start at the responsive distance (no zoom-in on load)
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else { t0 = performance.now(); animate(); }
    });
  }

  window.HeroScene = {
    init,
    setAccent(hex, hex2) { accent = new THREE.Color(hex); if (hex2) accent2 = new THREE.Color(hex2); applyAccentColors(); },
    setMotion(v) { motion = v; },
    setDensity(v) { density = v; makeParticles(); applyAccentColors(); },
    setScroll(v) { scrollP = Math.max(0, Math.min(1, v)); }
  };
})();
