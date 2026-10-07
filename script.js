const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const sidebar = document.querySelector('[data-sidebar]');
const closeButton = document.querySelector('[data-menu-close]');
const backdrop = document.querySelector('[data-menu-backdrop]');
const mobileNav = window.matchMedia('(max-width: 1100px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let menuOpen = false;
const background = [header, document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
const previousInert = new Map();

function setMenu(open, restoreFocus = false) {
  menuOpen = open && mobileNav.matches;
  sidebar.classList.toggle('open', menuOpen);
  sidebar.inert = !menuOpen;
  toggle.classList.toggle('open', menuOpen);
  toggle.setAttribute('aria-expanded', String(menuOpen));
  toggle.setAttribute('aria-label', menuOpen ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', menuOpen);
  if (menuOpen) {
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    background.forEach(element => {
      if (!previousInert.has(element)) previousInert.set(element, element.inert);
      element.inert = true;
    });
    // Commit drawer visibility before moving keyboard focus into it.
    sidebar.getBoundingClientRect();
    closeButton.focus({ preventScroll: true });
  } else {
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    previousInert.forEach((value, element) => { element.inert = value; });
    previousInert.clear();
    if (restoreFocus && mobileNav.matches) toggle.focus();
  }
}

toggle.addEventListener('click', () => setMenu(!menuOpen));
closeButton.addEventListener('click', () => setMenu(false, true));
backdrop.addEventListener('click', () => setMenu(false, true));
sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
mobileNav.addEventListener('change', () => {
  const focusWasInSidebar = sidebar.contains(document.activeElement);
  setMenu(false, focusWasInSidebar);
  if (!mobileNav.matches && focusWasInSidebar) document.querySelector('#desktop-nav a[aria-current="page"]')?.focus();
});
document.addEventListener('keydown', event => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
  if (event.key === 'Tab') {
    const focusable = [...sidebar.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.documentElement.classList.add('nav-ready');
setMenu(false);
if (!reduceMotion) document.documentElement.classList.add('motion-ready');
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// The current page is marked in the HTML, including when JavaScript is disabled.

// Page content stays visible immediately, including on short viewports and deep links.

document.querySelector('[data-year]').textContent = new Date().getFullYear();

document.querySelector('[data-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('[data-form-status]');
  status.textContent = 'Thank you. Online submissions will open soon—please email info@mmasrilanka.com for now.';
  form.reset();
});
