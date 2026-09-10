const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) document.documentElement.classList.add('motion-ready');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

toggle?.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  document.body.classList.remove('menu-open');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach((section) => observer.observe(section));
}

// Scroll-reveal groups are assigned here to keep the HTML semantic and uncluttered.
const revealGroups = [
  ['.section-kicker, .intro-copy, .section-head, .events-top, .join-inner > div, .join-form, .footer-main > *', 'reveal'],
  ['.stat-grid article, .programme-card, .value-list article, .event-list article, .news-side article', 'reveal'],
  ['.news-lead', 'reveal reveal-scale']
];

const revealItems = [];
revealGroups.forEach(([selector, classes]) => {
  document.querySelectorAll(selector).forEach((element) => {
    classes.split(' ').forEach((className) => element.classList.add(className));
    revealItems.push(element);
  });
});

document.querySelectorAll('.stat-grid, .programme-grid, .value-list, .event-list, .news-side').forEach((group) => {
  [...group.children].forEach((item, index) => item.style.setProperty('--reveal-delay', `${index * 90}ms`));
});

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -45px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// A small GPU-friendly hero drift adds depth without moving layout elements.
if (!reduceMotion) {
  const heroImage = document.querySelector('.hero-image');
  let ticking = false;
  const updateHeroDepth = () => {
    if (heroImage && window.scrollY < window.innerHeight) {
      heroImage.style.setProperty('--hero-shift', `${Math.min(window.scrollY * 0.1, 70)}px`);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeroDepth);
      ticking = true;
    }
  }, { passive: true });
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

document.querySelector('[data-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('[data-form-status]');
  status.textContent = 'Thank you. Online submissions will open soon—please email info@mmasrilanka.lk for now.';
  form.reset();
});
