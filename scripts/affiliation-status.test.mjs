import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { affiliationExpiry, affiliationState, refreshAffiliationHtml, sriLankaDate } from '../src/affiliation-status.mjs';
import { renderClubs, validateClubs } from './clubs.mjs';
import worker from '../src/index.js';

assert.equal(affiliationExpiry('2026-11-11'), '2027-11-11');
assert.equal(affiliationExpiry('2024-02-29'), '2025-02-28');
assert.equal(affiliationState('2026-11-11', '2026-11-10').key, 'scheduled');
assert.equal(affiliationState('2026-11-11', '2026-11-11').key, 'active');
assert.equal(affiliationState('2026-11-11', '2027-11-10').key, 'active');
assert.equal(affiliationState('2026-11-11', '2027-11-11').key, 'expired');
assert.equal(affiliationState('2026-11-11', '2027-11-12').key, 'expired');
assert.equal(affiliationState(undefined, '2027-11-11').key, 'pending');
assert.equal(affiliationState(undefined, '2035-11-11', false).key, 'active');
assert.equal(sriLankaDate(new Date('2027-11-10T18:29:59Z')), '2027-11-10');
assert.equal(sriLankaDate(new Date('2027-11-10T18:30:00Z')), '2027-11-11');

const template = await readFile(new URL('../clubs.html', import.meta.url), 'utf8');
const data = JSON.parse(await readFile(new URL('../data/clubs.json', import.meta.url), 'utf8'));
const dojo = data.clubs.find(club => club.slug === 'international-japan-karate-do-youshin-dojo');
const colombo = data.clubs.find(club => club.slug === 'mma-colombo-combat-club');
assert.equal(colombo.affiliationRenewalRequired, false);
assert.equal(colombo.affiliationIssuedOn, undefined);
assert.equal(dojo.affiliationIssuedOn, '2026-11-11');
for (const value of ['2026-02-30', '11/11/2026', '', 20261111]) {
  assert.throws(() => validateClubs({ clubs: [{ ...dojo, affiliationIssuedOn: value }] }), /affiliationIssuedOn/);
}
assert.throws(() => validateClubs({ clubs: [{ ...dojo, affiliationRenewalRequired: 'false' }] }), /boolean/);

const site = renderClubs({ data, template, siteUrl: 'https://example.test', today: '2026-11-11' });
const expiredSite = renderClubs({ data, template, siteUrl: 'https://example.test', today: '2027-11-11' });
assert.deepEqual(expiredSite.paths, site.paths, 'Profiles and QR targets survive expiry');
assert.equal(expiredSite.clubs[1].affiliationNumber, dojo.affiliationNumber);
const profilePath = `clubs/${dojo.slug}/index.html`;
const profile = site.pages.get(profilePath);
assert(profile.includes('<time datetime="2026-11-11">11 November 2026</time>'));
assert(profile.includes('<time datetime="2027-11-11">11 November 2027</time>'));
assert(expiredSite.pages.get(profilePath).includes('club-status--expired'));

for (const path of ['clubs/index.html', 'clubs/countries/lk/index.html', profilePath]) {
  const html = refreshAffiliationHtml(site.pages.get(path), '2027-11-11');
  assert(html.includes('class="club-status club-status--expired">Affiliation expired</span>'));
  if (path !== profilePath) assert(html.includes('data-affiliation-renewal="exempt" class="club-status club-status--active">SLMMAF affiliated</span>'));
  assert.equal(refreshAffiliationHtml(html, '2027-11-11'), html);
}
const membership = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(match => JSON.parse(match[1])).find(node => node['@type'] === 'SportsOrganization' && node['@id']?.includes('/clubs/'))?.memberOf;
assert(membership(refreshAffiliationHtml(profile, '2027-11-10')));
assert.equal(membership(refreshAffiliationHtml(profile, '2027-11-11')), undefined);
const colomboHtml = refreshAffiliationHtml(site.pages.get(`clubs/${colombo.slug}/index.html`), '2030-01-01');
assert(colomboHtml.includes('club-status--active'));
assert(!colomboHtml.includes('Affiliation issued:'));
assert(!colomboHtml.includes('Renewal due:'));
assert(!colomboHtml.includes('Affiliation is valid for one year'));
assert(membership(colomboHtml));

const renewedData = { ...data, clubs: data.clubs.map(club => club.slug === dojo.slug ? { ...club, affiliationIssuedOn: '2027-11-11' } : club) };
const renewed = renderClubs({ data: renewedData, template, siteUrl: 'https://example.test', today: '2027-11-11' });
assert(renewed.pages.get(profilePath).includes('club-status--active'));
assert.deepEqual(renewed.paths, site.paths);
assert.equal(renewed.clubs[1].affiliationNumber, dojo.affiliationNumber);

// Use the unchanged build across the Sri Lanka anniversary boundary.
const RealDate = Date;
let now = '2027-11-10T18:29:59Z';
let receivedHeaders;
const env = { ASSETS: { fetch: async request => {
  receivedHeaders = request.headers;
  return new Response(request.method === 'HEAD' ? null : profile, { headers: { 'Content-Type': 'text/html', ETag: 'old-asset', 'Last-Modified': 'Wed, 11 Nov 2026 00:00:00 GMT', 'Cache-Control': 'public, max-age=86400' } });
} } };
try {
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new RealDate(now).getTime(); }
  };
  const request = () => new Request(`https://example.test/clubs/${dojo.slug}/`, { headers: { 'If-None-Match': 'old-asset', 'If-Modified-Since': 'Wed, 11 Nov 2026 00:00:00 GMT' } });
  const before = await worker.fetch(request(), env);
  assert((await before.text()).includes('club-status--active'));
  now = '2027-11-10T18:30:00Z';
  const after = await worker.fetch(request(), env);
  assert.equal(after.status, 200);
  assert.equal(after.headers.get('Cache-Control'), 'no-store');
  assert.equal(after.headers.get('ETag'), null);
  assert.equal(after.headers.get('Last-Modified'), null);
  assert.equal(receivedHeaders.get('If-None-Match'), null);
  assert.equal(receivedHeaders.get('If-Modified-Since'), null);
  const expired = await after.text();
  assert(expired.includes('club-status--expired'));
  assert(expired.includes('Renewal is required.'));
  assert.equal(membership(expired), undefined);
  const head = await worker.fetch(new Request(request(), { method: 'HEAD' }), env);
  assert.equal(head.headers.get('Cache-Control'), 'no-store');
  assert.equal(await head.text(), '');
} finally { globalThis.Date = RealDate; }
console.log('Passed: one-year expiry at Sri Lanka midnight, leap dates, renewal, permanent QR profiles, MMA Colombo exemption and uncached Worker responses.');
