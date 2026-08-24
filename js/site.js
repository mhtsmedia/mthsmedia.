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
  btn.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

function toggleFaq(btn) {
  const item = btn.closest('.faq__item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq__item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.hidden = true;
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

/* ── Cursor-glow + 3D tilt on cards ─────────── */
if (hoverCapable && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (px - 0.5) * 12;
      const ry = -(py - 0.5) * 12;
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
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
  const vids = ['media/Landskap3_nettside.mp4', 'media/Landskap_nettside.mp4', 'media/Landskap2_nettside.mp4'];
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
      status.classList.add('is-success');
      form.reset();
    } catch {
      status.textContent = 'Noe gikk galt. Prøv igjen, eller send oss en e-post direkte på kontakt.mthsmedia@gmail.com.';
      status.classList.add('is-error');
    } finally {
      btn.disabled = false;
      btn.textContent = btnLabel;
    }
  });
})();
