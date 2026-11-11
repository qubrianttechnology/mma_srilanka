import { affiliationState } from '/affiliation-status.mjs';

const filterForm = document.querySelector('[data-club-filters]');


if (filterForm) {
  const cards = [...document.querySelectorAll('[data-club]')];
  const count = document.querySelector('[data-club-count]');
  const empty = document.querySelector('[data-no-clubs]');
  const query = filterForm.elements.q;
  const country = filterForm.elements.country;
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const initialCountry = country.value;
  function applyFilters(updateUrl = true) {
    const words = normalize(query.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach(card => {
      const matches = (!country.value || card.dataset.country === country.value) && words.every(word => normalize(card.dataset.search).includes(word));
      card.hidden = !matches;
      if (matches) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? 'club' : 'clubs'} listed${country.value ? ` in ${country.selectedOptions[0].textContent}` : ''}`;
    empty.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      query.value.trim() ? url.searchParams.set('q', query.value.trim()) : url.searchParams.delete('q');
      country.value ? url.searchParams.set('country', country.value) : url.searchParams.delete('country');
      history.replaceState(null, '', url);
    }
  }
  function readUrl() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    const requestedCountry = params.get('country');
    country.value = [...country.options].some(option => option.value === requestedCountry) ? requestedCountry : initialCountry;
    applyFilters(false);
  }
  function reset() {
    query.value = '';
    country.value = initialCountry;
    applyFilters();
  }
  filterForm.hidden = false;
  filterForm.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  query.addEventListener('input', () => applyFilters());
  country.addEventListener('change', () => applyFilters());
  filterForm.addEventListener('reset', event => { event.preventDefault(); reset(); });
  document.querySelector('[data-clear-clubs]')?.addEventListener('click', () => { reset(); query.focus(); });
  window.addEventListener('popstate', readUrl);
  readUrl();
}
function refreshAffiliation() {
  document.querySelectorAll('[data-affiliation-badge]').forEach(badge => {
    const state = affiliationState(badge.dataset.affiliationBadge, undefined, badge.dataset.affiliationRenewal !== 'exempt');
    badge.textContent = state.label;
    badge.className = `club-status club-status--${state.key}`;
  });
  document.querySelectorAll('[data-affiliation-summary]').forEach(summary => {
    summary.textContent = affiliationState(summary.dataset.affiliationSummary, undefined, summary.dataset.affiliationRenewal !== 'exempt').summary;
  });
}
refreshAffiliation();
setInterval(refreshAffiliation, 60000);
window.addEventListener('focus', refreshAffiliation);
document.addEventListener('visibilitychange', refreshAffiliation);
