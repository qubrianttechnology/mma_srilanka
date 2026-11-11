import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { assignAffiliationNumbers, affiliationAssetPaths, writeAffiliationAssets } from './affiliations.mjs';
import { renderClubs, validateClubs } from './clubs.mjs';

const club = {slug:'first-club',name:'First Club',countryCode:'LK',country:'Sri Lanka',city:'Colombo',description:'First Club training in Colombo.',status:'approved'};
const original = {clubs:[club,{...club,slug:'second-club',name:'Second & Third Club'},{...club,slug:'draft-club',status:'draft'}]};
const assigned = assignAffiliationNumbers(original);
assert.equal(original.clubs[0].affiliationNumber, undefined, 'Assignment must not mutate its input');
assert.deepEqual(assigned.clubs.map(club => club.affiliationNumber), ['SLMMAF-CLUB-0001','SLMMAF-CLUB-0002',undefined]);
assert.equal(assigned.affiliationSequence, 2);
assert.deepEqual(assignAffiliationNumbers(assigned), assigned, 'Rebuilding must not renumber clubs');
const reordered = assignAffiliationNumbers({...assigned,clubs:[assigned.clubs[1],assigned.clubs[0]]});
assert.deepEqual(reordered.clubs.map(club => club.affiliationNumber), ['SLMMAF-CLUB-0002','SLMMAF-CLUB-0001']);
const later = assignAffiliationNumbers({affiliationSequence:12,clubs:[{...club,status:'suspended',affiliationNumber:'SLMMAF-CLUB-0008'},{...club,slug:'later-club'}]});
assert.equal(later.clubs[1].affiliationNumber, 'SLMMAF-CLUB-0013');
const removed = assignAffiliationNumbers({affiliationSequence:later.affiliationSequence,clubs:[{...club,slug:'replacement-club'}]});
assert.equal(removed.clubs[0].affiliationNumber, 'SLMMAF-CLUB-0014', 'Do not reuse removed or retired numbers');
assert.throws(() => validateClubs({clubs:[assigned.clubs[0],{...assigned.clubs[1],affiliationNumber:'SLMMAF-CLUB-0001'}]}), /Duplicate affiliation/);
for (const value of ['../escape','SLMMAF-CLUB-0000','SLMMAF-CLUB-00001','SLMMAF-CLUB-9007199254740992']) assert.throws(() => validateClubs({clubs:[{...club,affiliationNumber:value}]}));
assert.throws(() => assignAffiliationNumbers({affiliationSequence:-1,clubs:[]}), /affiliationSequence/);
assert.throws(() => affiliationAssetPaths({...club,affiliationNumber:'../escape'}));

const template = await readFile(new URL('../clubs.html', import.meta.url), 'utf8');
const published = renderClubs({data:assigned,template,siteUrl:'https://example.test'});
const output = await mkdtemp(join(tmpdir(), 'slmmaf-affiliation-'));
try {
  await writeAffiliationAssets({clubs:published.clubs,siteUrl:'https://example.test',output});
  for (const club of published.clubs) {
    const assets = affiliationAssetPaths(club);
    const image = PNG.sync.read(await readFile(join(output, assets.png)));
    assert.equal(image.width, 1200);
    assert.equal(image.height, 1200);
    assert.deepEqual([...image.data.slice(0,4)], [255,255,255,255], 'Preserve a white quiet zone');
    const decoded = jsQR(new Uint8ClampedArray(image.data), image.width, image.height, {inversionAttempts:'dontInvert'});
    assert.equal(decoded?.data, `https://example.test/clubs/${club.slug}/`, 'A separate QR reader must decode the exact profile URL');
    const label = await readFile(join(output, assets.label), 'utf8');
    assert(label.includes(club.affiliationNumber));
    assert(label.includes(club.name.replaceAll('&','&amp;')));
    const profile = published.pages.get(`clubs/${club.slug}/index.html`);
    assert(profile.includes(`src="/${assets.svg}"`));
    assert(profile.includes(`href="/${assets.png}" download=`));
    assert(profile.includes(`href="/${assets.label}" download=`));
    assert(profile.includes(`"value":"${club.affiliationNumber}"`));
  }
} finally {
  assert.equal(dirname(resolve(output)), resolve(tmpdir()));
  await rm(output, {recursive:true,force:true});
}
console.log('Passed: persistent unique affiliation numbers, no reuse, input validation, certificate labels and independently decoded QR images.');
