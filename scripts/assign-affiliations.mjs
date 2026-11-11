import { readFile, writeFile } from 'node:fs/promises';
import { assignAffiliationNumbers } from './affiliations.mjs';
import { validateClubs } from './clubs.mjs';

const file = new URL('../data/clubs.json', import.meta.url);
const data = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
validateClubs(data);
const assigned = assignAffiliationNumbers(data);
validateClubs(assigned);
if (JSON.stringify(data) !== JSON.stringify(assigned)) await writeFile(file, JSON.stringify(assigned, null, 2) + '\n');
for (const club of assigned.clubs.filter(club => club.affiliationNumber)) console.log(`${club.affiliationNumber}: ${club.name}`);
