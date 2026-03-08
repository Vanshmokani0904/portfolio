/* ═══════════════════════════════════════════════════════════════
   VANSH MOKANI — AI/ML PORTFOLIO  |  script.js  (v2 — 3D Edition)
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  init3DBackground();
  initTheme();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSkillBars();
  initActiveNav();
  initTypingEffect();
  initCardTilt3D();
  initCounters();
  initProfile3DMouseParallax();
  initFormHandler();
});

/* ══════════════════════════════════════════════════════════════
   1. THREE.JS 3D BACKGROUND — Neural network / particle web
══════════════════════════════════════════════════════════════ */
function init3DBackground() {
  if (!window.THREE) return;

  const canvas   = document.getElementById('bg3d');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 400;

  /* ── Particles (stars / nodes) ── */
  const PARTICLE_COUNT = 280;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const spread     = 700;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities.push({
      x: (Math.random() - 0.5) * 0.15,
      y: (Math.random() - 0.5) * 0.15,
      z: (Math.random() - 0.5) * 0.1,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 2.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    color: 0x60a5fa,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ── Connection lines ── */
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const MAX_DIST = 100;
  let linesMesh  = null;

  function buildLines() {
    const linePositions = [];
    const pos = geo.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < MAX_DIST) {
          linePositions.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
          linePositions.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
        }
      }
    }

    if (linesMesh) { scene.remove(linesMesh); linesMesh.geometry.dispose(); }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);
  }

  /* ── Floating 3D torus (decorative) ── */
  const torusGeo = new THREE.TorusGeometry(120, 1.5, 8, 100);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xa78bfa, transparent: true, opacity: 0.12,
    wireframe: true,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(260, -80, -200);
  scene.add(torus);

  const torusGeo2 = new THREE.TorusGeometry(80, 1, 8, 80);
  const torusMat2 = new THREE.MeshBasicMaterial({
    color: 0x60a5fa, transparent: true, opacity: 0.1,
    wireframe: true,
  });
  const torus2 = new THREE.Mesh(torusGeo2, torusMat2);
  torus2.position.set(-260, 100, -180);
  scene.add(torus2);

  /* ── Mouse interaction ── */
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Theme-aware colour update ── */
  function updateThemeColour() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    mat.color.set(isDark ? 0x60a5fa : 0x4f46e5);
    lineMat.color.set(isDark ? 0x60a5fa : 0x4f46e5);
    torusMat.color.set(isDark ? 0xa78bfa : 0x7c3aed);
    torusMat2.color.set(isDark ? 0x60a5fa : 0x4f46e5);
  }
  document.getElementById('themeToggle')
          .addEventListener('click', () => setTimeout(updateThemeColour, 50));
  updateThemeColour();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  /* ── Animate ── */
  let frameCount = 0;
  const pos      = geo.attributes.position.array;

  function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i*3]     += velocities[i].x;
      pos[i*3 + 1] += velocities[i].y;
      pos[i*3 + 2] += velocities[i].z;

      // Bounce at bounds
      if (Math.abs(pos[i*3])     > spread/2) velocities[i].x *= -1;
      if (Math.abs(pos[i*3+1])   > spread/2) velocities[i].y *= -1;
      if (Math.abs(pos[i*3+2])   > spread/2) velocities[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    // Rebuild lines every 3 frames (performance)
    if (frameCount % 3 === 0) buildLines();

    // Camera parallax
    camera.position.x += (mouse.x * 40 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 30 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Spin toruses
    torus.rotation.x  += 0.003;
    torus.rotation.y  += 0.005;
    torus2.rotation.x += 0.004;
    torus2.rotation.z += 0.003;

    // Slowly rotate particle cloud
    particles.rotation.y += 0.0003;

    renderer.render(scene, camera);
  }

  buildLines();
  animate();
}

/* ══════════════════════════════════════════════════════════════
   2. CARD 3D TILT + GLARE on mouse move
══════════════════════════════════════════════════════════════ */
function initCardTilt3D() {
  const cards = document.querySelectorAll('.card-3d');

  cards.forEach(card => {
    const glare = card.querySelector('.card-glare');

    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -9;
      const tiltY = dx *  9;

      card.style.transform  = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
      card.style.transition = 'transform 0.08s ease, box-shadow 0.3s ease';
      card.style.boxShadow  = `${-dx*12}px ${-dy*12}px 50px rgba(96,165,250,0.18)`;

      if (glare) {
        const glareX = ((e.clientX - rect.left) / rect.width)  * 100;
        const glareY = ((e.clientY - rect.top)  / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;
        glare.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease';
      card.style.boxShadow  = '';
      if (glare) { glare.style.opacity = '0'; }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   3. HERO PROFILE 3D MOUSE PARALLAX
══════════════════════════════════════════════════════════════ */
function initProfile3DMouseParallax() {
  const wrap = document.getElementById('profile3dWrap');
  if (!wrap) return;

  document.addEventListener('mousemove', (e) => {
    const rx = ((e.clientY / window.innerHeight) - 0.5) * 20;
    const ry = ((e.clientX / window.innerWidth)  - 0.5) * 20;
    wrap.style.transform = `perspective(800px) rotateX(${-rx}deg) rotateY(${ry}deg)`;
    wrap.style.transition = 'transform 0.15s ease';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    wrap.style.transform  = 'perspective(800px) rotateX(0) rotateY(0)';
    wrap.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
  });
}

/* ══════════════════════════════════════════════════════════════
   4. THEME TOGGLE
══════════════════════════════════════════════════════════════ */
function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('vm-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('vm-theme', next);
    lucide.createIcons();
  });
}

/* ══════════════════════════════════════════════════════════════
   5. NAVBAR SCROLL SHADOW + ACTIVE LINK
══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════════════════════════════════════
   6. MOBILE MENU
══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('mobileOverlay');
  const closeBtn  = document.getElementById('overlayClose');

  const open  = () => overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');

  hamburger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

/* ══════════════════════════════════════════════════════════════
   7. SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx      = siblings.indexOf(entry.target);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 90);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   8. SKILL BARS
══════════════════════════════════════════════════════════════ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const obs  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => obs.observe(b));
}

/* ══════════════════════════════════════════════════════════════
   9. ANIMATED COUNTERS (About stats)
══════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1400;
      const step   = dur / target;
      let cur      = 0;

      const tick = () => {
        cur++;
        el.textContent = cur;
        if (cur < target) setTimeout(tick, step);
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => obs.observe(c));
}

/* ══════════════════════════════════════════════════════════════
   10. TYPING EFFECT
══════════════════════════════════════════════════════════════ */
function initTypingEffect() {
  const roleEl = document.querySelector('.role-text');
  if (!roleEl) return;

  const phrases = [
    'AI/ML Engineering Student',
    'Python Developer',
    'ML Enthusiast',
    'AI Builder 🚀'
  ];

  let pi = 0, ci = 0, del = false, paused = false;

  function tick() {
    const cur = phrases[pi];
    if (!del) {
      roleEl.textContent = cur.slice(0, ci + 1);
      ci++;
      if (ci === cur.length) {
        paused = true;
        setTimeout(() => { paused = false; del = true; }, 2400);
      }
    } else {
      roleEl.textContent = cur.slice(0, ci - 1);
      ci--;
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    }
    if (!paused) setTimeout(tick, del ? 42 : 88);
    else         setTimeout(tick, 100);
  }
  setTimeout(tick, 700);
}

/* ══════════════════════════════════════════════════════════════
   11. CONTACT FORM
══════════════════════════════════════════════════════════════ */
function handleFormSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = form.querySelector('[type="submit"]');

  const name  = form.name.value.trim();
  const email = form.email.value.trim();
  const msg   = form.message.value.trim();

  if (!name || !email || !msg) { shakeEl(form); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.style.borderColor = '#f87171';
    form.email.focus();
    setTimeout(() => form.email.style.borderColor = '', 2000);
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Sending…';

  setTimeout(() => {
    form.reset();
    btn.disabled  = false;
    btn.innerHTML = '<i data-lucide="send"></i> Send Message';
    success.classList.add('show');
    lucide.createIcons();
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 1500);
}

function shakeEl(el) {
  el.style.animation = 'shake 0.5s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// Inject shake keyframe
const _shake = document.createElement('style');
_shake.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0);}
    20%{transform:translateX(-8px);}
    40%{transform:translateX(8px);}
    60%{transform:translateX(-5px);}
    80%{transform:translateX(5px);}
  }
`;
document.head.appendChild(_shake);

/* ══════════════════════════════════════════════════════════════
   12. RESUME BUTTON
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resumeBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
       const a = document.createElement('a');
       a.href     = 'resume.pdf';
       a.download = 'Vansh_Mokani_Resume.pdf';
       a.click();
    showToast('📄 Add resume.pdf to the folder, then uncomment lines in script.js');
  });
});

/* ══════════════════════════════════════════════════════════════
   13. SMOOTH SCROLL
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY
                  - document.getElementById('navbar').offsetHeight - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   14. TOAST
══════════════════════════════════════════════════════════════ */
function showToast(msg, dur = 3200) {
  document.querySelectorAll('.vm-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'vm-toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'32px', left:'50%',
    transform:'translateX(-50%) translateY(20px)',
    background:'var(--glass-bg)', border:'1px solid var(--glass-border)',
    backdropFilter:'blur(20px)', color:'var(--text)',
    padding:'12px 24px', borderRadius:'100px',
    fontSize:'0.82rem', fontFamily:'var(--font-mono)',
    zIndex:'9999', opacity:'0',
    transition:'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    boxShadow:'0 8px 32px rgba(0,0,0,0.3)', whiteSpace:'nowrap',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
  }));
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => t.remove(), 400);
  }, dur);
}

/* ══════════════════════════════════════════════════════════════
   HOW TO ADD A NEW PROJECT — copy this block inside .projects-grid
   ────────────────────────────────────────────────────────────
   <div class="project-card glass reveal card-3d" data-project="5">
     <div class="card-glare"></div>
     <div class="project-top">
       <div class="project-icon">🔥</div>
       <div class="project-links">
         <a href="YOUR_GITHUB" target="_blank" class="icon-btn">
           <i data-lucide="github"></i></a>
         <a href="YOUR_DEMO" class="icon-btn">
           <i data-lucide="external-link"></i></a>
       </div>
     </div>
     <h3 class="project-title">Your Project Name</h3>
     <p class="project-desc">Short description here.</p>
     <div class="project-tags">
       <span class="p-tag">Python</span>
       <span class="p-tag">AI</span>
     </div>
   </div>
══════════════════════════════════════════════════════════════ */
