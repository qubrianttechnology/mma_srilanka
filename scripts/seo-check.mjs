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
 for (const pattern of [/<title>/g, /<meta name="description"/g, /<link rel="canonical"/g]) assert.equal([...html.matchAll(pattern)].length,1,`Duplicate metadata: ${file}`);
 assert(!/MMA Srilanka/.test(html),`Inconsistent site name: ${file}`);
 assert(!/<meta[^>]+name="(?:robots|googlebot)"[^>]+content="[^"]*(?:noindex|nofollow|none)/i.test(html),`Public page blocks indexing: ${file}`);
 assert(/<meta name="robots" content="index, follow, max-image-preview:large">/.test(html),`Public robots metadata: ${file}`);
 assert.equal(html.match(/<meta property="og:site_name" content="([^"]+)"/)?.[1],'MMA Sri Lanka');
 for(const name of ['og:title','twitter:title']) assert.equal(html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]+)"`))?.[1],title,`Social title: ${file}`);
 for(const name of ['og:description','twitter:description']) assert.equal(html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]+)"`))?.[1],description,`Social description: ${file}`);
 assert.equal(html.match(/<meta property="og:url" content="([^"]+)"/)?.[1],canonical,`Social URL: ${file}`);
 const image=html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
 assert(image && new URL(image).origin === new URL(canonical).origin,`Production sharing image: ${file}`);
 assert.equal(html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1],image,`Twitter image: ${file}`);
 await stat(await target(new URL(image).pathname));
 assert(!titles.has(title),`Duplicate title: ${file}`); titles.add(title);
 assert(!descriptions.has(description),`Duplicate description: ${file}`);descriptions.add(description);
 assert(!canonicals.has(canonical),`Duplicate canonical: ${file}`);canonicals.add(canonical);
 assert.equal(new URL(canonical).pathname,pagePath(file.replaceAll('\\','/')));
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`Heading structure: ${file}`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const nodes=schemas.flatMap(s=>s['@graph'] || [s]);
 const schemaIds=nodes.filter(n=>n['@id']).map(n=>n['@id']);
 assert.equal(new Set(schemaIds).size,schemaIds.length,`Duplicate schema entities: ${file}`);
 const page=nodes.find(n=>n['@id']===canonical+'#webpage');
 if(page?.breadcrumb) assert(nodes.some(n=>n['@type']==='BreadcrumbList'&&n['@id']===page.breadcrumb['@id']),`Breadcrumb reference: ${file}`);
 const orgId=new URL(canonical).origin+'/#organization';
 const organizations=nodes.filter(n=>n['@id']===orgId);
 assert.equal(organizations.length,1,`Single federation entity: ${file}`);
 assert.equal(organizations[0].name,'Sri Lanka Mixed Martial Arts Federation');
 assert(organizations[0].alternateName.includes('SLMMAF'));
 assert.equal(organizations[0].url,new URL(canonical).origin+'/');
 await stat(await target(new URL(organizations[0].logo).pathname));
 const websites=nodes.filter(n=>n['@type']==='WebSite');
 assert.equal(websites.length,file==='index.html'?1:0,`WebSite is defined once on home: ${file}`);
 assert(schemas.some(s=>s['@graph']?.some(n=>n['@id']===canonical+'#webpage')),`WebPage schema: ${file}`);
 if(file==='index.html')assert(schemas.some(s=>s['@graph']?.some(n=>n['@type']==='WebSite'&&n.name==='MMA Sri Lanka')));
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
assert.equal(new Set(locations).size,locations.length,'Duplicate sitemap URLs');
assert(!sitemap.includes('<lastmod>'),'Do not fabricate sitemap modification dates');
for(const canonical of canonicals)assert(locations.includes(canonical),`Missing sitemap entry ${canonical}`);
const origin=new URL([...canonicals][0]).origin;
for(const canonical of canonicals)assert.equal(new URL(canonical).origin,origin,'Consistent production origin');
assert((await readFile(join(root,'robots.txt'),'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
const robots=await readFile(join(root,'robots.txt'),'utf8');
assert(/User-agent: \*/.test(robots)&&/^Allow: \/$/m.test(robots),'Public crawling allowed');
assert(!/^Disallow: \/$/m.test(robots),'Public site must not be blocked');
const home=await readFile(join(root,'index.html'),'utf8');
const snippet='<html><head><title>Test</title><meta name="description" content="Description"><link rel="canonical" href="https://test.invalid/about"></head><body><main id="main"></main></body></html>';
const escaped=enhanceSeo(snippet,{file:'about.html',siteUrl:'https://test.invalid',verification:'test"><script>alert(1)</script>'});
assert(!escaped.includes('<script>alert(1)</script>'));
assert(home.includes('MMA Sri Lanka')&&home.includes('MMA in Sri Lanka'));
assert.equal(home.match(/<title>(.*?)<\/title>/)?.[1],'MMA Sri Lanka | Sri Lanka Mixed Martial Arts Federation');
assert.equal(home.match(/<meta name="description" content="([^"]+)"/)?.[1],'Explore MMA in Sri Lanka with SLMMAF: affiliated clubs, athlete development, coaching programmes, federation news and upcoming events.');
const manifest=JSON.parse(await readFile(join(root,'site.webmanifest'),'utf8'));
assert.equal(manifest.name,'MMA Sri Lanka');
console.log(`SEO checks passed for ${files.length} pages: unique metadata, canonical URLs, crawlable links, anchors, heading structure, JSON-LD, sitemap and robots.txt.`);
