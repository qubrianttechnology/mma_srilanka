const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const sidebar = document.querySelector('[data-sidebar]');
const closeButton = document.querySelector('[data-menu-close]');
const backdrop = document.querySelector('[data-menu-backdrop]');
const mobileNav = window.matchMedia('(max-width: 1100px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A short, optional welcome on the first home-page visit in each tab.
const siteIntro = document.querySelector('[data-site-intro]');
if (siteIntro) {
  let hasSeenIntro = false;
  try { hasSeenIntro = sessionStorage.getItem('slmmaf-intro-seen') === '1'; } catch { /* Storage may be unavailable. */ }
  if (!reduceMotion && !hasSeenIntro && !window.location.hash && typeof siteIntro.showModal === 'function') {
    let closing = false;
    let exitTimer;
    let dismissTimer;
    const cleanUpIntro = () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(dismissTimer);
      document.body.classList.remove('intro-active');
      siteIntro.hidden = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
    const dismissIntro = (immediately = false) => {
      if (closing || !siteIntro.open) return;
      closing = true;
      window.clearTimeout(dismissTimer);
      siteIntro.classList.add('is-leaving');
      const finish = () => { siteIntro.close(); cleanUpIntro(); };
      if (immediately) finish();
      else exitTimer = window.setTimeout(finish, 450);
    };
    const onVisibilityChange = () => {
      if (document.hidden) dismissIntro(true);
    };
    siteIntro.addEventListener('cancel', event => { event.preventDefault(); dismissIntro(true); });
    siteIntro.addEventListener('close', cleanUpIntro);
    siteIntro.hidden = false;
    siteIntro.showModal();
    document.body.classList.add('intro-active');
    try { sessionStorage.setItem('slmmaf-intro-seen', '1'); } catch { /* The intro still works without storage. */ }
    document.addEventListener('visibilitychange', onVisibilityChange);
    dismissTimer = window.setTimeout(() => dismissIntro(), 2800);
  }
}

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

const registrationForm = document.querySelector('[data-form]');
if (registrationForm) {
  const status = registrationForm.querySelector('[data-form-status]');
  const submitButton = registrationForm.querySelector('button[type="submit"]');
  const programme = registrationForm.elements.namedItem('programme');
  const params = new URLSearchParams(window.location.search);
  const requestedProgramme = params.get('programme');
  let requestId;
  const linkedProgramme = [...programme.options].find(option => option.value === requestedProgramme);
  if (linkedProgramme) programme.value = linkedProgramme.value;
  if (params.get('affiliation') === 'club') {
    programme.value = 'membership';
    registrationForm.elements.namedItem('interest').value = 'Club representative';
  }

  registrationForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    status.textContent = 'Sending your registration request…';
    try {
      requestId ??= crypto.randomUUID();
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(registrationForm)), requestId })
      });
      const result = await response.json();
      status.textContent = result.message;
      if (response.ok) {
        registrationForm.reset();
        if (linkedProgramme) programme.value = linkedProgramme.value;
        requestId = undefined;
      }
    } catch {
      status.textContent = 'Your request could not be sent. Please try again or email info@mmasrilanka.com.';
    } finally {
      submitButton.disabled = false;
    }
  });
  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      registrationForm.elements.namedItem('interest').value = link.dataset.interest;
      programme.value = 'membership';
      registrationForm.elements.namedItem('name').focus({ preventScroll: true });
    });
  });
  registrationForm.hidden = false;
  if (window.location.hash === '#registration') registrationForm.scrollIntoView();
}
