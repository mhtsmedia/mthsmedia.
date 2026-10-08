/* MTHS Media – shared site behavior */
(function () {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

const ICON_SUN = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const ICON_MOON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>`;

function paintThemeIcon() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon = document.getElementById('themeIcon');
  if (icon) icon.innerHTML = dark ? ICON_SUN : ICON_MOON;
}
paintThemeIcon();

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  paintThemeIcon();
});

function toggleMenu() {
  const btn = document.querySelector('.hamburger');
  const nav = document.getElementById('mobileNav');
  const open = btn.classList.toggle('open');
  nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function toggleFaq(btn) {
  const item = btn.closest('.faq__item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq__item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function dismissCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { banner.hidden = true; return; }
  banner.classList.add('cookie-banner--leaving');
  banner.addEventListener('transitionend', () => { banner.hidden = true; }, { once: true });
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  dismissCookieBanner();
}

function declineCookies() {
  localStorage.setItem('cookieConsent', 'declined');
  dismissCookieBanner();
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── Reveal on scroll ─────────────────────── */
function startRevealObserver() {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-lines, .kicker-line').forEach(el => revealObserver.observe(el));
}
// Wait for webfonts to finish loading first: the reveal-lines titles animate via a
// clipped transform, and if Fraunces swaps in mid-transition the glyphs redraw with
// different metrics while still clipped, producing garbled/overlapping letters.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startRevealObserver);
} else {
  startRevealObserver();
}

/* ── Header scroll state ──────────────────── */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
  const gy = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty('--gy', gy);
}, { passive: true });

/* ── Parallax images ──────────────────────── */
(function () {
  const imgs = document.querySelectorAll('.parallax-img');
  if (!imgs.length || reduceMotion) return;
  window.addEventListener('scroll', () => {
    imgs.forEach(img => {
      const rect = img.closest('[class]').getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const vCenter = window.innerHeight / 2;
      const offset = (center - vCenter) * 0.08;
      img.style.transform = `translateY(${offset}px) scale(1.08)`;
    });
  }, { passive: true });
})();

/* ── Project card video preview (hover) ────── */
if (hoverCapable) {
  document.querySelectorAll('.project-card').forEach(card => {
    const video = card.querySelector('video[data-src]');
    if (!video) return;
    let loaded = false;
    card.addEventListener('mouseenter', () => {
      if (!loaded) { video.src = video.dataset.src; loaded = true; }
      video.currentTime = 0;
      video.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => { video.pause(); });
  });
}

/* ── Magnetic buttons ──────────────────────── */
if (hoverCapable && !reduceMotion) {
  document.querySelectorAll('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── Testimonials: endless marquee ──────────── */
/* Clones the cards so the row is always wider than the viewport, then moves
   it with rAF and wraps the offset by one set's width, so the loop has no
   seam. Drag and horizontal wheel/trackpad move it by hand; hover pauses it.
   New reviews only need a new .tcard in the HTML. */
(function () {
  const marquee = document.querySelector('.testimonials__marquee');
  const track = marquee && marquee.querySelector('.testimonials__track');
  if (!track) return;
  const originals = Array.from(track.children);
  if (!originals.length) return;

  const speed = 0.4; // px per frame at 60fps
  let setWidth = 0, offset = 0, hovering = false, dragging = false, lastX = 0, lastT = 0;

  function measure() {
    track.querySelectorAll('[data-clone]').forEach(c => c.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setWidth = originals.reduce((w, c) => w + c.offsetWidth + gap, 0);
    const copies = Math.ceil(marquee.offsetWidth / setWidth) + 1;
    for (let i = 0; i < copies; i++) {
      originals.forEach(c => {
        const clone = c.cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }
  }
  function render() {
    offset = ((offset % setWidth) + setWidth) % setWidth;
    track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
  }
  function tick(t) {
    const dt = lastT ? Math.min(t - lastT, 50) : 16.7;
    lastT = t;
    if (!hovering && !dragging && !reduceMotion) offset += speed * dt / 16.7;
    render();
    requestAnimationFrame(tick);
  }

  // Mouse only: a tap on touch screens would otherwise leave it paused
  marquee.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  marquee.addEventListener('pointerleave', () => { hovering = false; });
  marquee.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX;
    marquee.setPointerCapture(e.pointerId);
    marquee.classList.add('is-dragging');
  });
  marquee.addEventListener('pointermove', e => {
    if (!dragging) return;
    offset -= e.clientX - lastX;
    lastX = e.clientX;
  });
  const endDrag = () => { dragging = false; marquee.classList.remove('is-dragging'); };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);
  marquee.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // leave vertical page scroll alone
    e.preventDefault();
    offset += e.deltaX;
  }, { passive: false });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });

  measure();
  requestAnimationFrame(tick);
})();

/* ── Cursor-glow + 3D tilt on cards ─────────── */
/* Spring-smoothed: targets update instantly on mousemove, but the values
   actually written to the CSS vars ease toward them each frame — same
   lerp technique as the custom cursor ring below — so the tilt has real
   momentum instead of snapping straight to the cursor. */
if (hoverCapable && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach(card => {
    let targetRx = 0, targetRy = 0, targetMx = 50, targetMy = 50;
    let curRx = 0, curRy = 0, curMx = 50, curMy = 50;
    let raf = null;

    function step() {
      curRx += (targetRx - curRx) * 0.18;
      curRy += (targetRy - curRy) * 0.18;
      curMx += (targetMx - curMx) * 0.18;
      curMy += (targetMy - curMy) * 0.18;
      card.style.setProperty('--rx', curRx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', curRy.toFixed(2) + 'deg');
      card.style.setProperty('--mx', curMx.toFixed(1) + '%');
      card.style.setProperty('--my', curMy.toFixed(1) + '%');
      const settled = Math.abs(targetRx - curRx) < 0.02 && Math.abs(targetRy - curRy) < 0.02 &&
        Math.abs(targetMx - curMx) < 0.05 && Math.abs(targetMy - curMy) < 0.05;
      raf = settled ? null : requestAnimationFrame(step);
    }
    function ensureLoop() { if (!raf) raf = requestAnimationFrame(step); }

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      targetRx = (px - 0.5) * 12;
      targetRy = -(py - 0.5) * 12;
      targetMx = px * 100;
      targetMy = py * 100;
      ensureLoop();
    });
    card.addEventListener('mouseleave', () => {
      targetRx = 0; targetRy = 0;
      ensureLoop();
    });
  });
}

/* ── Custom cursor ─────────────────────────── */
(function () {
  if (!hoverCapable || reduceMotion) return;
  document.body.classList.add('has-cursor');
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
  let visible = false;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!visible) { visible = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  const hoverSel = 'a, button, .tilt, .theme-toggle, .hero__word, video';
  document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) ring.classList.add('cursor-ring--active'); });
  document.addEventListener('mouseout', e => { if (e.target.closest(hoverSel)) ring.classList.remove('cursor-ring--active'); });
  const textSel = 'input, textarea';
  document.addEventListener('mouseover', e => { if (e.target.closest(textSel)) ring.classList.add('cursor-ring--text'); });
  document.addEventListener('mouseout', e => { if (e.target.closest(textSel)) ring.classList.remove('cursor-ring--text'); });
})();

/* ── Hero video crossfade (home page only) ─── */
document.addEventListener('DOMContentLoaded', () => {
  const layers = [...document.querySelectorAll('.hero-video')];
  if (!layers.length) return;
  const vids = ['media/FjordhotelHero_nettside.mp4', 'media/Paradisio_nettside.mp4', 'media/BaerumPadelHero_nettside.mp4', 'media/HolmenFjordhotellNettside.mp4', 'media/Landskap3_nettside.mp4', 'media/Landskap_nettside.mp4', 'media/Landskap2_nettside.mp4'];
  layers.forEach(v => { v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); });

  let active = 0;
  let idx = 0;

  function preload(layer, i) { layers[layer].src = vids[i]; layers[layer].load(); }

  function advance() {
    const nextLayer = 1 - active;
    const nextIdx = (idx + 1) % vids.length;
    const cur = layers[active];
    const nxt = layers[nextLayer];
    nxt.currentTime = 0;
    nxt.play().catch(() => {});
    nxt.classList.add('is-active');
    cur.classList.remove('is-active');
    preload(active, (nextIdx + 1) % vids.length);
    active = nextLayer;
    idx = nextIdx;
  }

  layers.forEach(v => v.addEventListener('ended', () => { if (v.classList.contains('is-active')) advance(); }));

  preload(0, 0);
  preload(1, 1);
  layers[0].addEventListener('canplay', function once() {
    layers[0].removeEventListener('canplay', once);
    layers[0].play().catch(() => {});
    layers[0].classList.add('is-active');
  });
});

/* ── Hero word cycling (home page only) ──────── */
(function () {
  const words = document.querySelectorAll('.hero__word');
  if (!words.length) return;
  let idx = 0;
  setInterval(() => {
    const prev = idx;
    words[prev].classList.remove('active');
    words[prev].classList.add('exit');
    idx = (idx + 1) % words.length;
    // Wait for the outgoing word to fully fade out before fading the next one
    // in — starting both transitions at once made the two words' letterforms
    // visibly overlap mid-slide.
    setTimeout(() => {
      words[prev].classList.remove('exit');
      words[idx].classList.add('active');
    }, 300);
  }, 2200);
})();

/* ── Cookie banner ──────────────────────────── */
(function () {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (!localStorage.getItem('cookieConsent')) banner.hidden = false;
})();

/* ── Contact form: submit via fetch, inline feedback ─ */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const btn = form.querySelector('.form-btn');
  const btnLabel = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.querySelector('[name="_gotcha"]').value) return; // honeypot tripped

    status.textContent = '';
    status.className = 'form-status';
    btn.disabled = true;
    btn.textContent = 'Sender…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('request failed');
      status.textContent = 'Takk! Meldingen er sendt – vi svarer innen 48 timer.';
      void status.offsetWidth; // force reflow so the fade-in transition has a starting frame
      status.classList.add('is-success');
      form.reset();
    } catch {
      status.textContent = 'Noe gikk galt. Prøv igjen, eller send oss en e-post direkte på kontakt.mthsmedia@gmail.com.';
      void status.offsetWidth;
      status.classList.add('is-error');
    } finally {
      btn.disabled = false;
      btn.textContent = btnLabel;
    }
  });
})();

/* ── Image carousel: arrows step one image, scrolls on forever ─
   A full clone of the set is appended before and after the real
   items. Stepping past the real items slides onto an identical
   clone, then the track silently snaps back to the matching real
   position once the slide finishes — so it reads as an endless
   stream of images instead of a jump-cut back to the start. ── */
(function () {
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('[data-carousel-track]');
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const originals = [...track.children];
    const count = originals.length;
    if (!count) return;

    const cloneSet = () => originals.map(el => {
      const c = el.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    cloneSet().reverse().forEach(c => track.insertBefore(c, track.firstChild));
    cloneSet().forEach(c => track.appendChild(c));

    let index = count; // first real item

    function step() {
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return track.children[0].getBoundingClientRect().width + gap;
    }

    function render(animate) {
      if (!animate) track.style.transition = 'none';
      track.style.transform = `translateX(${-index * step()}px)`;
      if (!animate) {
        track.getBoundingClientRect(); // force reflow before re-enabling the transition
        track.style.transition = '';
      }
    }

    track.addEventListener('transitionend', e => {
      if (e.propertyName !== 'transform') return;
      if (index >= count * 2) { index -= count; render(false); }
      else if (index < count) { index += count; render(false); }
    });

    nextBtn?.addEventListener('click', () => { index++; render(true); });
    prevBtn?.addEventListener('click', () => { index--; render(true); });
    window.addEventListener('resize', () => render(false));

    render(false);
  });
})();
