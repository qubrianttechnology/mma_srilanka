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

const enquiryForm = document.querySelector('[data-form]');
if (enquiryForm) {
  const form = enquiryForm;
  const status = form.querySelector('[data-form-status]');
  const draft = form.querySelector('[data-email-draft]');
  const draftText = form.querySelector('[data-draft-text]');
  const emailLink = form.querySelector('[data-email-link]');
  const nameField = form.elements.namedItem('name');

  const clearDraft = () => {
    nameField.setCustomValidity('');
    draft.hidden = true;
    draftText.value = '';
    emailLink.href = 'mailto:info@mmasrilanka.com';
    status.textContent = '';
  };
  form.addEventListener('input', clearDraft);
  form.addEventListener('change', clearDraft);
  form.addEventListener('submit', event => {
    event.preventDefault();
    nameField.setCustomValidity(nameField.value.trim() ? '' : 'Please enter your name.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = key => String(data.get(key) || '').trim();
    const subject = `SLMMAF membership enquiry — ${value('interest')}`;
    const body = [
      'Hello SLMMAF,', '', 'I would like to enquire about getting involved.', '',
      `Name: ${value('name')}`, `Email: ${value('email')}`, `Role: ${value('interest')}`,
      ...(value('phone') ? [`Phone: ${value('phone')}`] : []),
      ...(value('city') ? [`City / district: ${value('city')}`] : []),
      '', value('message') || 'Please let me know the requirements and next steps for my enquiry.',
      '', 'Thank you.'
    ].join('\r\n');
    emailLink.href = `mailto:info@mmasrilanka.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    draftText.value = `To: info@mmasrilanka.com\nSubject: ${subject}\n\n${body}`;
    draft.hidden = false;
    status.textContent = 'Your draft is ready. Review it in your email app and press Send. This website has not sent your enquiry.';
    emailLink.click();
  });
  form.querySelector('[data-copy-draft]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftText.value);
      status.textContent = 'Draft copied. Paste it into your email service and send it to info@mmasrilanka.com.';
    } catch {
      draftText.focus();
      draftText.select();
      status.textContent = 'Select and copy the draft below, then paste it into your email service and send it to info@mmasrilanka.com.';
    }
  });
  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      clearDraft();
      form.elements.namedItem('interest').value = link.dataset.interest;
      nameField.focus({ preventScroll: true });
    });
  });
  form.hidden = false;
}
