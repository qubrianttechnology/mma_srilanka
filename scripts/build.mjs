import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const sourceSiteUrl = 'https://www.mmasrilanka.lk';
const defaultSiteUrl = 'https://www.mmasrilanka.lk';
const siteUrl = (process.env.SITE_URL || defaultSiteUrl).replace(/\/$/, '');

let parsedSiteUrl;
try {
  parsedSiteUrl = new URL(siteUrl);
} catch {
  throw new Error('SITE_URL must be a valid HTTPS URL');
}

if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.search || parsedSiteUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS URL without a query string or fragment');
}

const files = [
  'index.html',
  'styles.css',
  'script.js',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  const source = join(root, file);
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });

  if (['index.html', 'robots.txt', 'sitemap.xml'].includes(file)) {
    const contents = await readFile(source, 'utf8');
    await writeFile(destination, contents.replaceAll(sourceSiteUrl, siteUrl));
  } else {
    await cp(source, destination);
  }
}

await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
console.log(`Cloudflare Workers asset bundle created: ${output}`);
console.log(`Canonical site URL: ${siteUrl}`);
