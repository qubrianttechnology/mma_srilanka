import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const env={ASSETS:{fetch:async()=>new Response('ok',{status:200,headers:{'Content-Type':'text/html'}})}};
for(const [input,expected] of [['/index.html','/'],['/home','/'],['/about.html','/about'],['/clubs','/clubs/'],['/clubs.html','/clubs/'],['/clubs/mma-colombo-combat-club','/clubs/mma-colombo-combat-club/'],['/clubs/countries/lk/index.html','/clubs/countries/lk/']]){
 const response=await worker.fetch(new Request('https://example.test'+input+'?ref=test'),env);
 assert.equal(response.status,301);assert.equal(response.headers.get('Location'),'https://example.test'+expected+'?ref=test');
}
for(const route of ['/','/about','/clubs/','/clubs/mma-colombo-combat-club/','/clubs/countries/lk/']) assert.equal((await worker.fetch(new Request('https://example.test'+route),env)).status,200);
const missing=await worker.fetch(new Request('https://example.test/missing.png'),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
assert.equal(missing.status,404);assert.equal(missing.headers.get('X-Robots-Tag'),'noindex');assert.equal(missing.headers.get('Cache-Control'),null);
const post=await worker.fetch(new Request('https://example.test/contact.html',{method:'POST'}),env);assert.equal(post.status,200);
console.log('Canonical redirects, query preservation, no redirect loops, method handling and 404 indexing rules passed.');
