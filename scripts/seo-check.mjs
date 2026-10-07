import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enhanceSeo, pagePath } from './seo.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','dist');
const titles=new Set(), descriptions=new Set(), canonicals=new Set();
const files=(await readdir(root,{recursive:true})).filter(file=>file.endsWith('.html'));
async function target(pathname) {
  let file=join(root,decodeURIComponent(pathname));
  try { if((await stat(file)).isDirectory())file=join(file,'index.html'); }
  catch { file += '.html'; }
  return file;
}
for(const file of files){
 const html=await readFile(join(root,file),'utf8');
 const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 assert(title&&description&&canonical,`Missing metadata: ${file}`);
 assert(!titles.has(title),`Duplicate title: ${file}`); titles.add(title);
 assert(!descriptions.has(description),`Duplicate description: ${file}`);descriptions.add(description);
 assert(!canonicals.has(canonical),`Duplicate canonical: ${file}`);canonicals.add(canonical);
 assert.equal(new URL(canonical).pathname,pagePath(file.replaceAll('\\','/')));
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`Heading structure: ${file}`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert(schemas.some(s=>s['@graph']?.some(n=>n['@id']===canonical+'#webpage')),`WebPage schema: ${file}`);
 if(file==='index.html')assert(schemas.some(s=>s['@graph']?.some(n=>n['@type']==='WebSite'&&n.name==='MMA Srilanka')));
 assert(!html.includes('https://www.mmasrilanka.lk'),`Old domain: ${file}`);
 assert(!/name="keywords"/.test(html),'Do not add keyword stuffing tags');
 for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|tel:)/.test(href))continue;
  const url=new URL(href,canonical);const local=await target(url.pathname);
  const contents=await readFile(local);
  if(url.hash)assert(contents.toString().includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Missing anchor ${href} on ${file}`);
 }
}
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(locations.length,canonicals.size);
for(const canonical of canonicals)assert(locations.includes(canonical),`Missing sitemap entry ${canonical}`);
const origin=new URL([...canonicals][0]).origin;
assert((await readFile(join(root,'robots.txt'),'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
const home=await readFile(join(root,'index.html'),'utf8');
const snippet='<html><head><title>Test</title><meta name="description" content="Description"><link rel="canonical" href="https://test.invalid/about"></head><body><main id="main"></main></body></html>';
const escaped=enhanceSeo(snippet,{file:'about.html',siteUrl:'https://test.invalid',verification:'test"><script>alert(1)</script>'});
assert(!escaped.includes('<script>alert(1)</script>'));
assert(home.includes('MMA Srilanka')&&home.includes('MMA in Sri Lanka'));
console.log(`SEO checks passed for ${files.length} pages: unique metadata, canonical URLs, crawlable links, anchors, heading structure, JSON-LD, sitemap and robots.txt.`);
