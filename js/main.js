/* ============================================================
   main.js — Portfolio JavaScript
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   CANVAS ANIMATED BACKGROUND
   Renders a field of soft glowing particles on a dark canvas
   that slowly drift and pulse, creating a premium depth effect.
   ────────────────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* Accent palette */
  const PALETTE = [
    [79,  127, 255],   /* electric blue   */
    [124, 58,  237],   /* violet          */
    [6,   182, 212],   /* teal / cyan     */
  ];

  let W, H, particles, animId;

  /* ── Particle factory ── */
  function createParticle() {
    const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      radius: 1.5 + Math.random() * 3.5,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: 0.05 + Math.random() * 0.2,
      r, g, b,
      /* pulsing phase offset */
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.003 + Math.random() * 0.007,
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.round((W * H) / 12000);
    particles = Array.from({ length: count }, createParticle);
  }

  /* ── Render loop ── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Subtle deep gradient fill so canvas feels layered */
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.9);
    bg.addColorStop(0,   'rgba(10, 15, 40, 0.45)');
    bg.addColorStop(1,   'rgba(5,  8,  16, 0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      /* Update */
      p.phase += p.phaseSpeed;
      const pulse = 0.6 + 0.4 * Math.sin(p.phase);
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap edges */
      if (p.x < -50)  p.x = W + 50;
      if (p.x > W + 50) p.x = -50;
      if (p.y < -50)  p.y = H + 50;
      if (p.y > H + 50) p.y = -50;

      /* Draw glow */
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 8);
      glow.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${p.alpha * pulse * 0.9})`);
      glow.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${p.alpha * pulse * 0.3})`);
      glow.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      /* Hard core */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha * pulse * 2})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  /* ── Init ── */
  resize();
  draw();

  /* ── Debounced resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      resize();
      draw();
    }, 150);
  });

  /* ── Pause when tab hidden (performance) ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });
}());


/* ──────────────────────────────────────────────────────────
   NAVBAR — scroll opacity + mobile toggle
   ────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!navbar || !toggle || !navLinks) return;

  /* Scroll class */
  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile toggle */
  function openMenu() {
    navLinks.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  /* Close on link click (mobile) */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) closeMenu();
  });
}());


/* ──────────────────────────────────────────────────────────
   SMOOTH SCROLL — internal anchor links
   ────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      /* Move focus to target for accessibility */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}());


/* ──────────────────────────────────────────────────────────
   SCROLL REVEAL — IntersectionObserver
   ────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealTargets = [
    '.hero-content',
    '.about-image-col',
    '.about-content-col',
    '.project-card',
    '.process-step',
    '.service-item',
    '.testimonial-card',
    '.stat-item',
    '.faq-item',
    '.cta-content',
    '.services-visual',
    '.services-content',
    '.section-header',
  ];

  const elements = document.querySelectorAll(revealTargets.join(','));

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    /* Staggered delay for grid items */
    const siblings = el.parentElement ? el.parentElement.children : [];
    const idx = Array.from(siblings).indexOf(el);
    if (idx > 0 && idx < 6) {
      el.style.transitionDelay = `${idx * 80}ms`;
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}());


/* ──────────────────────────────────────────────────────────
   FAQ ACCORDION
   ────────────────────────────────────────────────────────── */
(function initFAQ() {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  const items = faqList.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer  = item.querySelector('.faq-answer');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      items.forEach(other => {
        const otherTrigger = other.querySelector('.faq-trigger');
        const otherAnswer  = other.querySelector('.faq-answer');
        if (otherTrigger && otherAnswer && other !== item) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          collapseAnswer(otherAnswer);
        }
      });

      /* Toggle current */
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        collapseAnswer(answer);
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        expandAnswer(answer);
      }
    });

    /* Keyboard support */
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  function expandAnswer(el) {
    el.hidden = false;
    const h = el.scrollHeight;
    el.style.maxHeight = '0px';
    el.style.overflow  = 'hidden';
    el.style.transition = 'max-height 0.36s cubic-bezier(0.22, 1, 0.36, 1)';
    /* Force reflow */
    void el.offsetHeight;
    el.style.maxHeight = h + 'px';
    el.addEventListener('transitionend', () => {
      el.style.maxHeight = '';
      el.style.overflow  = '';
    }, { once: true });
  }

  function collapseAnswer(el) {
    if (el.hidden) return;
    const h = el.scrollHeight;
    el.style.maxHeight  = h + 'px';
    el.style.overflow   = 'hidden';
    el.style.transition = 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    void el.offsetHeight;
    el.style.maxHeight = '0px';
    el.addEventListener('transitionend', () => {
      el.hidden = true;
      el.style.maxHeight  = '';
      el.style.overflow   = '';
      el.style.transition = '';
    }, { once: true });
  }
}());


/* ──────────────────────────────────────────────────────────
   COUNTER ANIMATION (Stats section)
   ────────────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start  = performance.now();

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}());


/* ──────────────────────────────────────────────────────────
   ACTIVE NAV LINK — highlight on scroll
   ────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], main[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70', 10)}px 0px 0px 0px` });

  sections.forEach(s => observer.observe(s));
}());
