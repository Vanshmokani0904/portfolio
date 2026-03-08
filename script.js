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
  const sections  = document.querySelectorAll('section[id]');
  const links     = document.querySelectorAll('.nav-link');
  const indicator = document.getElementById('navIndicator');
  const navList   = document.getElementById('navLinks');

  if (!indicator || !navList) return;

  /* ── Move the indicator to sit behind a given <a> element ── */
  function moveIndicator(linkEl) {
    if (!linkEl) return;
    // offsetLeft is relative to the offsetParent (navList), so no getBoundingClientRect needed
    // This avoids flicker caused by layout shifts mid-transition
    indicator.style.opacity = '1';
    indicator.style.left    = linkEl.offsetLeft + 'px';
    indicator.style.width   = linkEl.offsetWidth + 'px';
  }

  /* ── Mark one link active and slide the pill ── */
  function setActive(href) {
    links.forEach(l => l.classList.remove('active'));
    const target = [...links].find(l => l.getAttribute('href') === href);
    if (!target) return;
    target.classList.add('active');
    moveIndicator(target);
  }

  /* ── Click handler: update immediately on click ── */
  links.forEach(link => {
    link.addEventListener('click', () => {
      setActive(link.getAttribute('href'));
    });
  });

  /* ── Scroll: track which section is in the viewport ──
     Uses a single observer; whichever section crosses the
     midpoint of the screen becomes active.               */
  let scrollLocked = false;   // brief lock after click so scroll doesn't override

  links.forEach(link => {
    link.addEventListener('click', () => {
      scrollLocked = true;
      setTimeout(() => { scrollLocked = false; }, 900);
    });
  });

  const obs = new IntersectionObserver((entries) => {
    if (scrollLocked) return;
    // Pick the entry with the highest intersection ratio
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) setActive('#' + visible[0].target.id);
  }, {
    threshold    : [0.2, 0.5],
    rootMargin   : '-64px 0px -30% 0px',
  });

  sections.forEach(s => obs.observe(s));

  /* ── Reposition on window resize ── */
  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) moveIndicator(active);
  }, { passive: true });

  /* ── Initial position — wait for fonts & layout to paint ── */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Default to first link if nothing else is active
      const first = links[0];
      if (first) setActive(first.getAttribute('href'));
    });
  });
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
   11. CONTACT FORM — EmailJS Integration
   ──────────────────────────────────────
   HOW TO SET UP (free, 5 minutes):
   1. Go to https://www.emailjs.com and create a free account
   2. Add a service: Dashboard → Email Services → Add Service → Gmail
      Copy your SERVICE ID
   3. Create a template: Email Templates → Create Template
      Use these variables in the template:
        From: {{from_name}} <{{from_email}}>
        Subject: New message from {{from_name}} - Portfolio
        Body:
          Name:    {{from_name}}
          Email:   {{from_email}}
          Message: {{message}}
      Copy your TEMPLATE ID
   4. Get your Public Key: Account → General → Public Key
   5. Paste all three below ↓
══════════════════════════════════════════════════════════════ */

const EMAILJS_SERVICE_ID  = 'service_j4safrz';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_t7874wc';   // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'iXE6EQvdq-nVfMbln1EKe';   // e.g. 'user_XXXXXXXXXXXXXXX'

/* Init EmailJS */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
});

async function handleFormSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error   = document.getElementById('formError');
  const btn     = form.querySelector('[type="submit"]');

  const name  = form.name.value.trim();
  const email = form.email.value.trim();
  const msg   = form.message.value.trim();

  /* Validation */
  if (!name || !email || !msg) { shakeEl(form); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.style.borderColor = '#f87171';
    form.email.focus();
    setTimeout(() => form.email.style.borderColor = '', 2000);
    return;
  }

  /* Button loading state */
  btn.disabled   = true;
  btn.innerHTML  = '<i data-lucide="loader-2" class="spin"></i> Sending…';
  lucide.createIcons();
  if (error) error.classList.remove('show');

  try {
    /* ── Real send via EmailJS ── */
    if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name : name,    // used as {{from_name}} in template
        name      : name,    // used as {{name}} in template
        from_email: email,   // used as {{from_email}} in template
        message   : msg,     // used as {{message}} in template
        reply_to  : email,
        time      : new Date().toLocaleString(),  // used as {{time}} in template
      });
    } else {
      /* No keys set — simulate for testing */
      await new Promise(r => setTimeout(r, 1200));
      console.warn('EmailJS not configured. Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY in script.js');
    }

    /* Success */
    form.reset();
    success.classList.add('show');
    showToast('✅ Message sent! Vansh will reply soon.');
    setTimeout(() => success.classList.remove('show'), 6000);

  } catch (err) {
    /* Error */
    console.error('EmailJS error:', err);
    if (error) {
      error.classList.add('show');
      setTimeout(() => error.classList.remove('show'), 6000);
    }
    showToast('❌ Failed to send. Please email directly at vanshmokani152@gmail.com');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i data-lucide="send"></i> Send Message';
    lucide.createIcons();
  }
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
    /* ── To enable real download:
       1. Add your resume PDF as "resume.pdf" in the folder
       2. Uncomment the lines below:
       ─────────────────────────────
       const a = document.createElement('a');
       a.href     = 'resume.pdf';
       a.download = 'Vansh_Mokani_Resume.pdf';
       a.click();
    */
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

/* ══════════════════════════════════════════════════════════════
   AI ASSISTANT — Groq API  (FREE ✅ — works with Student Pack)
   ──────────────────────────────────────────────────────────
   WHY GROQ?  Completely free, no billing, insanely fast.
   Works perfectly with GitHub Student Developer Pack.

   GET YOUR FREE KEY (30 seconds):
   1. Go to:  https://console.groq.com
   2. Sign up with GitHub (Student Pack) or Google
   3. Click "API Keys" → "Create API Key"
   4. Paste the key below — done! 🚀
══════════════════════════════════════════════════════════════ */

const GROQ_API_KEY = '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';  // ← Paste your FREE Groq API key here (gsk_...)

/* ── Groq models — tried in order if one is rate-limited ── */
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // Best quality,  free: 30 RPM 14,400 RPD
  'llama3-8b-8192',            // Fastest,       free: 30 RPM 14,400 RPD
  'gemma2-9b-it',              // Google Gemma,  free: 30 RPM 14,400 RPD
  'mixtral-8x7b-32768',        // Long context,  free: 30 RPM 14,400 RPD
];

/* ── Vansh's full profile context ── */
const VANSH_CONTEXT = `You are an AI assistant for Vansh Mokani's developer portfolio website.
You represent Vansh and answer questions about him in a friendly, professional, enthusiastic way.
Always speak AS his assistant — referring to him as "Vansh" in third person.
Keep answers concise (2-4 sentences), helpful, and use emojis occasionally.
Format bold text using **double asterisks**.

VANSH'S COMPLETE PROFILE:
Name: Vansh Mokani
Role: AI/ML Engineering Student
Location: India
Email: vanshmokani152@gmail.com
GitHub: github.com/vanshmokani
LinkedIn: https://www.linkedin.com/in/vansh-mokani-273333382/
Status: Actively available for internships and collaborations

SKILLS: Python 92%, C 75%, JavaScript 68%, Machine Learning 85%, Deep Learning 72%, AI Fundamentals 88%, Git & GitHub 80%, VS Code 90%, Cursor AI & Claude AI 82%

PROJECTS:
1. Jarvis AI Voice Assistant — Python voice assistant with speech recognition, music control, automation
2. AI News Reader — Python app reads live news via APIs and text-to-speech
3. Spotify Style Music Player — Python GUI music player with shuffle, playlist support
4. Face + QR Attendance System — Smart attendance using face recognition and QR codes (FEATURED)

CERTIFICATES:
- AI For Everyone — Andrew Ng (Coursera / DeepLearning.AI)
- Generative AI for Everyone — Andrew Ng (Coursera / DeepLearning.AI)
- Machine Learning Specialization — Andrew Ng (Stanford / Coursera)
- IBM AI Engineering Professional Certificate — IBM (Coursera)

If asked about hiring → encourage reaching out at vanshmokani152@gmail.com
If you don't know something → be honest and suggest contacting Vansh directly.`;

/* ── Conversation histories ── */
let chatHistory  = [];
let floatHistory = [];

/* ══════════════════════════════════════════════════════════════
   MAIN SECTION CHAT
══════════════════════════════════════════════════════════════ */
async function sendAiMessage() {
  const input   = document.getElementById('aiInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const text    = input.value.trim();
  if (!text) return;

  input.value      = '';
  sendBtn.disabled = true;

  appendMessage('aiMessages', text, 'user');
  chatHistory.push({ role: 'user', content: text });

  const typingId = showTyping('aiMessages');
  try {
    const reply = await callGroq(chatHistory);
    removeTyping('aiMessages', typingId);
    appendMessage('aiMessages', reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeTyping('aiMessages', typingId);
    appendMessage('aiMessages', getErrorMessage(err), 'bot');
  }
  sendBtn.disabled = false;
  input.focus();
}

function sendChip(btn) {
  const input = document.getElementById('aiInput');
  input.value = btn.textContent.replace(/^[^\w\s]*\s*/, '').trim();
  document.getElementById('aiChatBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => sendAiMessage(), 300);
}

function clearChat() {
  chatHistory = [];
  document.getElementById('aiMessages').innerHTML = '';
  appendMessage('aiMessages', "Chat cleared! 🧹 Ask me anything about Vansh's skills, projects, or experience.", 'bot');
}

/* ══════════════════════════════════════════════════════════════
   FLOATING WIDGET CHAT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.getElementById('floatToggle');
  const popup   = document.getElementById('floatPopup');
  const iconBot = toggle?.querySelector('.icon-bot');
  const iconX   = toggle?.querySelector('.icon-close');

  toggle?.addEventListener('click', () => {
    const isOpen = popup.classList.toggle('open');
    if (iconBot) iconBot.style.display = isOpen ? 'none'  : 'block';
    if (iconX)   iconX.style.display   = isOpen ? 'block' : 'none';
    if (isOpen)  document.getElementById('floatInput')?.focus();
  });

  /* AI nav link uses href="#ai" — smooth scroll handled globally */
});

async function sendFloatMessage() {
  const input = document.getElementById('floatInput');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  appendMessage('floatMessages', text, 'user', true);
  floatHistory.push({ role: 'user', content: text });

  const typingId = showTyping('floatMessages');
  try {
    const reply = await callGroq(floatHistory);
    removeTyping('floatMessages', typingId);
    appendMessage('floatMessages', reply, 'bot', true);
    floatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeTyping('floatMessages', typingId);
    appendMessage('floatMessages', getErrorMessage(err), 'bot', true);
  }
}

/* ══════════════════════════════════════════════════════════════
   CORE — Groq API call
   Groq uses OpenAI-compatible format — simple & clean
══════════════════════════════════════════════════════════════ */
async function callGroq(history) {
  /* No key → smart demo replies */
  if (!GROQ_API_KEY) {
    return getDemoReply(history[history.length - 1]?.content || '');
  }

  const messages = [
    { role: 'system', content: VANSH_CONTEXT },
    ...history.slice(-12)   // keep last 12 turns for context
  ];

  let lastError = '';

  /* Try each model — auto-fallback on rate limit */
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens  : 400,
          temperature : 0.7,
          top_p       : 0.9,
          stream      : false,
        }),
      });

      const data = await res.json();

      /* Rate limited or model error → try next */
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        if (res.status === 429 || res.status === 503) { lastError = msg; continue; }
        throw new Error(msg);
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastError = 'Empty response'; continue; }
      return text.trim();

    } catch (e) {
      if (e.message?.includes('Failed to fetch')) throw e;
      lastError = e.message;
    }
  }

  throw new Error(lastError || 'All Groq models unavailable');
}

/* ══════════════════════════════════════════════════════════════
   DEMO MODE — works perfectly without any API key
══════════════════════════════════════════════════════════════ */
function getDemoReply(question) {
  const q = question.toLowerCase();

  if (q.match(/^(hi|hello|hey|namaste|yo|sup)/))
    return "Hey! 👋 I'm Vansh's AI assistant powered by **Groq + Llama 3**. I know everything about his skills, projects, and experience. What would you like to know?";

  if (q.includes('project') || q.includes('built') || q.includes('build') || q.includes('made'))
    return "Vansh has built **4 real AI projects**! 🚀 His flagship is the **Face + QR Attendance System** using OpenCV & face recognition. He also built **Jarvis AI Voice Assistant**, an **AI News Reader**, and a **Spotify-style Music Player** — all in Python!";

  if (q.includes('skill') || q.includes('python') || q.includes('language') || q.includes('know') || q.includes('code'))
    return "Vansh's strongest skill is **Python** at 92%! 🐍 He's also skilled in **Machine Learning** (85%), **AI Fundamentals** (88%), and **Deep Learning** (72%). He uses Git, VS Code, Cursor AI, and Claude daily.";

  if (q.includes('cert') || q.includes('course') || q.includes('degree') || q.includes('qualif'))
    return "Vansh holds **4 verified certificates** 🎓 — **AI For Everyone**, **Generative AI for Everyone**, and the **Machine Learning Specialization** from Andrew Ng, plus the **IBM AI Engineering Professional Certificate**!";

  if (q.includes('hire') || q.includes('job') || q.includes('intern') || q.includes('avail') || q.includes('collab'))
    return "Yes! Vansh is **actively open** for internships and collaborations 🟢 He's perfect for AI/ML, Python, or intelligent systems roles. Email him at **vanshmokani152@gmail.com** — he responds fast!";

  if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('connect') || q.includes('dm'))
    return "Reach Vansh at 📬 **vanshmokani152@gmail.com** — or connect on **GitHub** (github.com/vanshmokani) and **LinkedIn** (https://www.linkedin.com/in/vansh-mokani-273333382/). He usually replies within 24 hours!";

  if (q.includes('ml') || q.includes('machine learn') || q.includes('deep learn') || q.includes('neural') || q.includes('model'))
    return "Vansh is seriously into AI & ML! 🧠 He's completed Stanford + DeepLearning.AI courses, built face recognition & speech AI systems. His goal: create intelligent tools that solve real-world problems.";

  if (q.includes('jarvis') || q.includes('voice') || q.includes('speech'))
    return "**Jarvis AI Voice Assistant** is super cool! 🤖 Built in Python — it listens to voice commands, controls music, opens apps, and automates tasks. Just like Tony Stark's real Jarvis!";

  if (q.includes('attendance') || q.includes('face recog') || q.includes('qr'))
    return "The **Face + QR Attendance System** is Vansh's flagship project! 👤 It uses **OpenCV** for face recognition + **QR scanning** to auto-mark attendance, block proxy fraud, and export Excel reports. Perfect for schools!";

  if (q.includes('groq') || q.includes('llama') || q.includes('api') || q.includes('key'))
    return "This chat is powered by **Groq + Llama 3** 🚀 — the world's fastest AI inference! Get your FREE key at **console.groq.com** (no credit card needed) and paste it into `script.js`. Takes 30 seconds!";

  if (q.includes('student') || q.includes('pack') || q.includes('github'))
    return "Groq works perfectly with **GitHub Student Developer Pack**! 🎓 Just go to **console.groq.com**, sign in with your GitHub account, create a free API key, and paste it into `script.js`. Zero cost!";

  return "Great question! 🤔 I'm in **demo mode** — add your **FREE Groq API key** from **console.groq.com** to `script.js` to unlock live Llama 3 AI. Meanwhile, Vansh is an AI/ML student with Python expertise, 4 AI projects, and 4 certifications. Ask me anything!";
}

/* ══════════════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════════════ */

function appendMessage(containerId, text, role, small = false) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const isBot = role === 'bot';
  const msg   = document.createElement('div');
  msg.className = `ai-msg ai-msg--${role}`;

  /* Render markdown: **bold**, *italic*, bullet lines */
  const rendered = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,       '<em>$1</em>')
    .replace(/^• (.*)/gm,          '<span style="display:block;margin-left:8px">• $1</span>')
    .replace(/\n/g, '<br>');

  msg.innerHTML = `
    ${isBot
      ? `<div class="ai-msg-avatar"><i data-lucide="sparkles"></i></div>`
      : `<div class="ai-msg-avatar">V</div>`}
    <div class="ai-msg-bubble"><p>${rendered}</p></div>
  `;

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
  lucide.createIcons();
}

function showTyping(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return null;

  const id  = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id        = id;
  div.className = 'ai-msg ai-msg--bot ai-typing';
  div.innerHTML = `
    <div class="ai-msg-avatar"><i data-lucide="sparkles"></i></div>
    <div class="ai-msg-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  lucide.createIcons();
  return id;
}

function removeTyping(containerId, id) {
  if (id) document.getElementById(id)?.remove();
}

function getErrorMessage(err) {
  const m = err.message || '';

  if (m.includes('Invalid API Key') || m.includes('invalid_api_key') || m.includes('401'))
    return "⚠️ Invalid Groq API key. Make sure it starts with **gsk_** — get a fresh one at **console.groq.com** and paste it in script.js.";

  if (m.includes('429') || m.includes('rate') || m.includes('unavailable'))
    return "⚠️ Groq rate limit hit (tried all models). Wait 30 seconds and try again — Groq free tier allows 30 req/min which is very generous!";

  if (m.includes('Failed to fetch') || m.includes('NetworkError'))
    return "⚠️ Network error — can't reach Groq. Check your internet connection and try again.";

  if (m.includes('401'))
    return "⚠️ Unauthorised. Double-check your Groq API key in script.js starts with gsk_.";

  return `⚠️ Error: ${m}. Try again or check your Groq API key at console.groq.com.`;
}
