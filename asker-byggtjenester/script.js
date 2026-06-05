// Header scroll effect
const header = document.getElementById('top')?.closest('body')
  ? document.querySelector('.site-header')
  : null;

document.addEventListener('scroll', () => {
  const h = document.querySelector('.site-header');
  if (h) h.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('main-nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  // Close on link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Contact form (demo — no real submission)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Melding sendt!';
    btn.disabled = true;
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.textContent = 'Send melding';
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 4000);
  });
}

// Fade-in on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .why-card, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
