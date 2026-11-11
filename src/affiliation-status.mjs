// Calendar dates use Sri Lanka time. Expiry begins at midnight on the anniversary.
export function sriLankaDate(now = new Date()) {
  return new Date(now.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
}

export function isCalendarDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function affiliationExpiry(issuedOn) {
  if (!isCalendarDate(issuedOn)) return '';
  const [year, month, day] = issuedOn.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  return `${year + 1}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

export function affiliationState(issuedOn, today = sriLankaDate(), renewalRequired = true) {
  if (!renewalRequired) return { key: 'active', label: 'SLMMAF affiliated', summary: 'Affiliated with the Sri Lanka Mixed Martial Arts Federation (SLMMAF).', expiresOn: '' };
  const expiresOn = affiliationExpiry(issuedOn);
  if (!expiresOn) return { key: 'pending', label: 'Affiliation date pending', summary: 'The affiliation issue date is awaiting confirmation.', expiresOn };
  if (today < issuedOn) return { key: 'scheduled', label: 'Affiliation not yet active', summary: 'Federation affiliation has not yet started.', expiresOn };
  if (today >= expiresOn) return { key: 'expired', label: 'Affiliation expired', summary: 'This club’s SLMMAF affiliation has expired. Renewal is required.', expiresOn };
  return { key: 'active', label: 'SLMMAF affiliated', summary: 'Affiliated with the Sri Lanka Mixed Martial Arts Federation (SLMMAF).', expiresOn };
}

export function formatAffiliationDate(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

// Refresh generated fragments on every request, including for crawlers without JS.
export function refreshAffiliationHtml(html, today = sriLankaDate()) {
  return html.replace(/<(span|p) data-affiliation-(badge|summary)="([\d-]*)"([^>]*)>[\s\S]*?<\/\1>/g, (_, tag, kind, issuedOn, attrs) => {
    const exempt = attrs.includes(' data-affiliation-renewal="exempt"');
    const state = affiliationState(issuedOn, today, !exempt);
    return `<${tag} data-affiliation-${kind}="${issuedOn}"${exempt ? ' data-affiliation-renewal="exempt"' : ''}${kind === 'badge' ? ` class="club-status club-status--${state.key}"` : ''}>${kind === 'badge' ? state.label : state.summary}</${tag}>`;
  }).replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (original, json) => {
    const entity = JSON.parse(json);
    if (entity['@type'] !== 'SportsOrganization' || !entity['@id']?.endsWith('#organization')) return original;
    const membership = entity.memberOf;
    // Only the federation affiliation role carries temporal membership.
    if (membership?.['@type'] === 'OrganizationRole' && affiliationState(membership.startDate, today).key !== 'active') delete entity.memberOf;
    return `<script type="application/ld+json">${JSON.stringify(entity).replace(/</g, '\\u003c')}</script>`;
  });
}
