import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
const {default:worker}=await import('../src/index.js');
const env={ASSETS:{fetch:async()=>new Response('ok',{status:200,headers:{'Content-Type':'text/html'}})}};
for(const [input,expected] of [['/index.html','/'],['/index','/'],['/index/','/'],['/home','/'],['/home/','/'],['/home.html','/'],['/about.html','/about'],['/about/','/about'],['/clubs','/clubs/'],['/clubs.html','/clubs/'],['/clubs/mma-colombo-combat-club','/clubs/mma-colombo-combat-club/'],['/clubs/countries/lk/index.html','/clubs/countries/lk/']]){
 const response=await worker.fetch(new Request('https://example.test'+input+'?ref=test'),env);
 assert.equal(response.status,301);assert.equal(response.headers.get('Location'),'https://example.test'+expected+'?ref=test');
}
for (const method of ['GET', 'HEAD']) {
 for (const input of ['http://mmasrilanka.com/about.html', 'http://www.mmasrilanka.com/about/', 'https://www.mmasrilanka.com/about']) {
  const response = await worker.fetch(new Request(input + '?ref=test', {method}), env);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), 'https://mmasrilanka.com/about?ref=test');
 }
 assert.equal((await worker.fetch(new Request('https://mmasrilanka.com/about', {method}), env)).status, 200);
}
assert.equal((await worker.fetch(new Request('http://127.0.0.1:8787/about'), env)).status, 200);
for(const route of ['/','/about','/clubs/','/clubs/mma-colombo-combat-club/','/clubs/countries/lk/']) assert.equal((await worker.fetch(new Request('https://example.test'+route),env)).status,200);
const missing=await worker.fetch(new Request('https://example.test/missing.png'),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
assert.equal(missing.status,404);assert.equal(missing.headers.get('X-Robots-Tag'),'noindex');assert.equal(missing.headers.get('Cache-Control'),null);
const post=await worker.fetch(new Request('https://example.test/contact.html',{method:'POST'}),env);assert.equal(post.status,200);
console.log('Canonical redirects, query preservation, no redirect loops, method handling and 404 indexing rules passed.');

const database = new DatabaseSync(':memory:');
database.exec(await readFile(new URL('../migrations/0001_registrations.sql', import.meta.url), 'utf8'));
const registrationEnv = {
  REGISTRATION_LIMIT: { limit: async () => ({ success: true }) },
  REGISTRATIONS: {
    prepare(sql) {
      const statement = database.prepare(sql);
      return { bind: (...values) => ({ run: async () => statement.run(...values) }) };
    }
  }
};
const applicant = {
  requestId: '46d5fbe6-6a78-4c08-a821-ae098f047407',
  name: 'Test Athlete',
  email: 'athlete@example.test',
  interest: 'Athlete',
  programme: 'camp'
};
const submit = (fields = applicant, bindings = registrationEnv, origin = 'https://example.test') =>
  worker.fetch(new Request('https://example.test/api/registration', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  }), bindings);

assert.equal((await submit(applicant, registrationEnv, 'https://other.test')).status, 403);
assert.equal((await submit({ ...applicant, programme: 'unknown' })).status, 400);
assert.equal((await submit({ ...applicant, message: 'x'.repeat(8192) })).status, 413);
assert.equal((await submit(applicant, {
  ...registrationEnv, REGISTRATION_LIMIT: { limit: async () => ({ success: false }) }
})).status, 429);
assert.equal((await submit(applicant, {
  ...registrationEnv, REGISTRATIONS: { prepare() { throw new Error('Database offline'); } }
})).status, 503);
assert.equal((await submit()).status, 200);
assert.equal((await submit()).status, 200);
const saved = database.prepare('SELECT email, programme FROM registrations').all();
assert.equal(saved.length, 1);
assert.equal(saved[0].email, applicant.email);
assert.equal(saved[0].programme, 'National MMA Development Camp');
database.close();
console.log('Registration validation, rate limit, database failure and duplicate retry checks passed.');
