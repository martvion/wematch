// WeMatch Partners — interactivity
(function () {
  // Navbar toggle (mobile)
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navList = document.querySelector('.nav-list');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && e.target !== navToggle) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close after clicking a link
    if (navList) {
      navList.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          mainNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Contact form — local fallback success message
  const form = document.querySelector('form[name="contact"]');
  if (form) {
    const success = form.querySelector('.form-success');
    form.addEventListener('submit', (e) => {
      // When running locally (file://) Netlify won’t handle the submission.
      if (location.protocol === 'file:') {
        e.preventDefault();
        if (success) {
          success.hidden = false;
          setTimeout(() => (success.hidden = true), 5000);
        }
        form.reset();
      }
    });
  }

  // Interactive parallax for hero orbs
  const hero = document.querySelector('.hero-visual');
  const orb1 = hero?.querySelector('.orb-1');
  const orb2 = hero?.querySelector('.orb-2');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && orb1 && orb2 && !prefersReduced) {
    let px = 0, py = 0; // interactive offsets (-1..1 scaled later)
    let ix1 = 0, iy1 = 0, ix2 = 0, iy2 = 0; // idle offsets in px
    let pending = false, hasPointer = false;
    const range1 = 40; // increased amplitude for orb1 (more visible)
    const range2 = 26; // increased amplitude for orb2 (counter motion)

    const apply = () => {
      pending = false;
      const tx1 = (px * range1) + ix1;
      const ty1 = (py * range1) + iy1;
      const tx2 = (-px * range2) + ix2;
      const ty2 = (-py * range2) + iy2;
      orb1.style.setProperty('--tx', tx1.toFixed(1) + 'px');
      orb1.style.setProperty('--ty', ty1.toFixed(1) + 'px');
      orb2.style.setProperty('--tx', tx2.toFixed(1) + 'px');
      orb2.style.setProperty('--ty', ty2.toFixed(1) + 'px');
    };

    const queue = () => { if (!pending) { pending = true; requestAnimationFrame(apply); } };

    // Pointer interaction (mouse / stylus)
    const onPointerMove = (e) => {
      hasPointer = true;
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      px = x * 2; // amplify
      py = y * 2;
      queue();
    };
    const onPointerLeave = () => { px = 0; py = 0; queue(); };

    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Idle floating animation (always on to ensure visibility without interaction)
    const start = performance.now();
    const animateIdle = (t) => {
      const sec = (t - start) / 1000;
      // Two different waves and phases for subtle, organic motion
      ix1 = Math.sin(sec * 0.6) * 8;      // up to 8px
      iy1 = Math.cos(sec * 0.7) * 6;      // up to 6px
      ix2 = Math.cos(sec * 0.5 + 1) * 6;  // up to 6px, phase shifted
      iy2 = Math.sin(sec * 0.8 + 0.7) * 5; // up to 5px
      apply();
      requestAnimationFrame(animateIdle);
    };
    requestAnimationFrame(animateIdle);

    // Scroll fallback for touch/mobile (moves on vertical scroll)
    const onScroll = () => {
      if (hasPointer) return; // don't fight pointer interaction
      const rect = hero.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const heroCenterY = rect.top + rect.height / 2;
      const viewportCenterY = viewportH / 2;
      const dy = (viewportCenterY - heroCenterY) / viewportH; // approx -0.5..0.5
      px = 0; // keep X stable on scroll
      py = Math.max(-0.9, Math.min(0.9, dy * 2.4)); // stronger fallback
      queue();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // initialize
    onScroll();
  }
})();
