import { enhanceSeo } from './seo.mjs';
import { renderClubs, validateClubs } from './clubs.mjs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const sourceSiteUrls = ['https://www.mmasrilanka.lk', 'https://www.mmasrilanka.com', 'https://mmasrilanka.com'];
const defaultSiteUrl = 'https://mmasrilanka.com';
let siteUrl = (process.env.SITE_URL || defaultSiteUrl).replace(/\/$/, '');

let parsedSiteUrl;
try {
  parsedSiteUrl = new URL(siteUrl);
} catch {
  throw new Error('SITE_URL must be a valid HTTPS URL');
}

if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.search || parsedSiteUrl.hash || parsedSiteUrl.username || parsedSiteUrl.password || parsedSiteUrl.pathname !== '/') {
  throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query string or fragment');
}

// Keep production metadata on the primary domain even with a legacy build override.
if (parsedSiteUrl.hostname === 'www.mmasrilanka.com') {
  siteUrl = defaultSiteUrl;
}

const files = [
  'index.html',
  'about.html',
  'programmes.html',
  'events.html',
  'news.html',
  'contact.html',
  'clubs.html',
  'clubs.js',
  'styles.css',
  'script.js',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest'
];

const clubData = JSON.parse((await readFile(join(root, 'data/clubs.json'), 'utf8')).replace(/^\uFEFF/, ''));
validateClubs(clubData);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  const source = join(root, file);
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });

  if (file.endsWith('.html') || ['robots.txt', 'sitemap.xml'].includes(file)) {
    const contents = await readFile(source, 'utf8');
    await writeFile(destination, sourceSiteUrls.reduce((html, origin) => html.replaceAll(origin, siteUrl), contents));
  } else {
    await cp(source, destination);
  }
}

await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
const clubTemplate = await readFile(join(output, 'clubs.html'), 'utf8');
const clubSite = renderClubs({ data: clubData, template: clubTemplate, siteUrl });
for (const [file, html] of clubSite.pages) {
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}
await rm(join(output, 'clubs.html'));
const pageFiles = new Set([...files.filter(file => file.endsWith('.html') && file !== 'clubs.html'), ...clubSite.pages.keys()]);
for (const file of pageFiles) {
  const destination = join(output, file);
  const html = await readFile(destination, 'utf8');
  await writeFile(destination, enhanceSeo(html, { file, siteUrl, verification: process.env.GOOGLE_SITE_VERIFICATION || '' }));
}
const routes = ['', 'about', 'programmes', 'events', 'news', 'contact', ...clubSite.paths];
await writeFile(join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + routes.map(route => '  <url><loc>' + siteUrl + '/' + route + '</loc></url>').join('\n') + '\n</urlset>\n');
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
await writeFile(join(output, 'robots.txt'), robots.replace(/^Sitemap:.*$/m, 'Sitemap: ' + siteUrl + '/sitemap.xml'));
console.log('Affiliated clubs published: ' + clubSite.count);
console.log(`Cloudflare Workers asset bundle created: ${output}`);
console.log(`Canonical site URL: ${siteUrl}`);
