const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const sidebar = document.querySelector('[data-sidebar]');
const closeButton = document.querySelector('[data-menu-close]');
const backdrop = document.querySelector('[data-menu-backdrop]');
const mobileNav = window.matchMedia('(max-width: 1100px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Share the same intro across every page, including on refresh and deep links.
if (!reduceMotion && typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function') {
    const quickIntro = document.body.classList.contains('inner-page');
    const introDuration = quickIntro ? 900 : 2800;
    const exitDuration = quickIntro ? 200 : 450;
    const siteIntro = document.createElement('dialog');
    siteIntro.className = quickIntro ? 'site-intro site-intro--quick' : 'site-intro';
    siteIntro.style.setProperty('--intro-duration', `${introDuration}ms`);
    siteIntro.style.setProperty('--intro-exit-duration', `${exitDuration}ms`);
    siteIntro.setAttribute('data-site-intro', '');
    siteIntro.setAttribute('aria-labelledby', 'intro-title');
    siteIntro.setAttribute('aria-describedby', 'intro-federation');
    siteIntro.innerHTML = `
      <div class="site-intro__ambience" aria-hidden="true"></div>
      <div class="site-intro__top" aria-hidden="true"><span>SLMMAF</span><span>Sri Lanka &middot; Mixed Martial Arts</span></div>
      <div class="site-intro__content">
        <p class="site-intro__eyebrow">Discipline. Honour. Unity.</p>
        <div class="site-intro__seal" aria-hidden="true">
          <svg class="site-intro__octagon" viewBox="0 0 240 240" fill="none"><path d="M78 18H162L222 78V162L162 222H78L18 162V78Z"/><path d="M82 29H158L211 82V158L158 211H82L29 158V82Z"/></svg>
          <img alt="" width="1024" height="1024" decoding="async">
        </div>
        <p class="site-intro__title" id="intro-title">One island.<br><em>One fighting spirit.</em></p>
        <p class="site-intro__federation" id="intro-federation">Sri Lanka Mixed Martial Arts Federation</p>
        <div class="site-intro__line" aria-hidden="true"><span></span></div>
      </div>
      <div class="site-intro__bottom"><span>The next chapter starts here</span></div>`;
    // Reuse the resolved header asset URL so nested club pages use the right path.
    siteIntro.querySelector('img').src = header.querySelector('.brand-logo').src;
    document.body.prepend(siteIntro);
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
      else exitTimer = window.setTimeout(finish, exitDuration);
    };
    const onVisibilityChange = () => {
      if (document.hidden) dismissIntro(true);
    };
    siteIntro.addEventListener('cancel', event => { event.preventDefault(); dismissIntro(true); });
    siteIntro.addEventListener('close', cleanUpIntro);
    siteIntro.showModal();
    document.body.classList.add('intro-active');
    document.addEventListener('visibilitychange', onVisibilityChange);
    dismissTimer = window.setTimeout(() => dismissIntro(), introDuration);
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
  const successDialog = document.querySelector('#registration-success');
  successDialog?.querySelectorAll('[data-registration-success-close]').forEach(button => {
    button.addEventListener('click', () => successDialog.close());
  });
  successDialog?.addEventListener('close', () => {
    document.body.classList.remove('registration-confirmed');
    submitButton.focus({ preventScroll: true });
  });

  const errorBox = registrationForm.querySelector('[data-form-error]');
  const errorTitle = errorBox.querySelector('h3');
  const errorReason = errorBox.querySelector('p');
  const clearRegistrationError = () => {
    errorBox.hidden = true;
    registrationForm.querySelectorAll('[aria-invalid="true"], [aria-describedby~="registration-error-reason"]').forEach(field => {
      field.removeAttribute('aria-invalid');
      const describedBy = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== 'registration-error-reason');
      describedBy.length ? field.setAttribute('aria-describedby', describedBy.join(' ')) : field.removeAttribute('aria-describedby');
    });
  };
  const showRegistrationError = (reason, fieldName, title = 'Not submitted') => {
    clearRegistrationError();
    status.textContent = '';
    status.classList.remove('form-status--success');
    errorTitle.textContent = title;
    errorReason.textContent = reason;
    errorBox.hidden = false;
    const field = fieldName && registrationForm.elements.namedItem(fieldName);
    if (field && typeof field.focus === 'function') {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), 'registration-error-reason'].filter(Boolean).join(' '));
      field.focus({ preventScroll: true });
    }
    errorBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };
  registrationForm.addEventListener('invalid', event => {
    event.preventDefault();
    if (event.target !== registrationForm.querySelector(':invalid')) return;
    const field = event.target;
    const messages = {
      name: 'Please enter your full name.',
      email: field.validity.valueMissing ? 'Please enter your email address.' : 'Please enter a valid email address, such as name@example.com.',
      interest: 'Please choose your role.',
      programme: 'Please choose a programme.'
    };
    showRegistrationError(messages[field.name] || 'Please check this field and try again.', field.name);
  }, true);
  registrationForm.addEventListener('input', event => {
    // Keep the reason visible until the next attempt, while clearing the edited field's error.
    event.target.removeAttribute('aria-invalid');
  });
  const responseError = code => ({
    400: 'Please check your details and try again.',
    403: 'Your request was blocked. Please refresh this page and try again.',
    413: 'Your message is too long. Please shorten it and try again.',
    415: 'Please refresh this page and use the registration form.',
    429: 'Too many attempts. Please wait one minute and try again.'
  }[code] || (code >= 500
    ? 'Registration is temporarily unavailable. Please try again later or email info@mmasrilanka.com.'
    : 'We could not submit your request. Please refresh this page and try again.'));

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
    clearRegistrationError();
    if (navigator.onLine === false) {
      showRegistrationError('You are offline. Please connect to the internet and try again.');
      return;
    }
    submitButton.disabled = true;
    registrationForm.setAttribute('aria-busy', 'true');
    status.classList.remove('form-status--success');
    status.textContent = 'Sending your registration request...';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      requestId ??= crypto.randomUUID();
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...Object.fromEntries(new FormData(registrationForm)), requestId })
      });
      // Hosting errors can return HTML; use the HTTP status if there is no JSON reason.
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        showRegistrationError(typeof result?.message === 'string' && result.message.trim() ? result.message : responseError(response.status), result?.field);
        return;
      }
      if (typeof result?.message !== 'string' || !result.message.trim()) {
        showRegistrationError('We could not confirm your submission. Please try again or contact info@mmasrilanka.com.', undefined, 'Submission not confirmed');
        return;
      }
      status.textContent = result.message;
      registrationForm.reset();
      if (linkedProgramme) programme.value = linkedProgramme.value;
      requestId = undefined;
      status.classList.add('form-status--success');
      if (successDialog && typeof successDialog.showModal === 'function' && !successDialog.open) {
        successDialog.showModal();
        document.body.classList.add('registration-confirmed');
      }
    } catch (error) {
      const reason = error.name === 'AbortError'
        ? 'The request took too long. We could not confirm your submission. Please try again.'
        : 'We could not reach the registration service. Check your internet connection and try again.';
      showRegistrationError(reason, undefined, 'Submission not confirmed');
    } finally {
      window.clearTimeout(timeout);
      submitButton.disabled = false;
      registrationForm.removeAttribute('aria-busy');
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
