# MMA Sri Lanka SEO and owner handoff

The owner reports that the website appears for “SLMMAF” but is difficult to find for “MMA Sri Lanka”. This is a reported query visibility issue. No authorised Search Console connection is available here, so query performance and Google indexing status have not been inspected. Neither an indexing failure nor a specific ranking cause has been established.

The website name is **MMA Sri Lanka**. The organisation remains **Sri Lanka Mixed Martial Arts Federation**, abbreviated **SLMMAF**. Existing federation branding and user changes are preserved.

## Project and routes

This is static HTML/CSS/JavaScript with a Node build, not a client-rendered framework. Cloudflare Workers Static Assets serves `dist/` through `src/index.js`; `wrangler.jsonc` runs the Worker first. `scripts/build.mjs` copies public assets, generates approved club pages, applies SEO metadata and generates the sitemap. GitHub Actions runs the existing checks. No applicable AGENTS.md was found in the checkout or ancestor directories.

| Canonical path | Page |
| --- | --- |
| `/` | MMA Sri Lanka homepage |
| `/about` | Federation mission and commitment |
| `/programmes` | Athlete development, coaching, affiliation and beginner guidance |
| `/clubs/` | Affiliated club directory |
| `/clubs/countries/lk/` | Existing Sri Lanka club directory |
| `/clubs/mma-colombo-combat-club/` | Existing approved club profile |
| `/events` | Planned camps and education announcements |
| `/news` | Federation development updates |
| `/contact` | Contact details and membership enquiries |

The production origin is `https://mmasrilanka.com`. Top-level pages omit a trailing slash; generated club routes use one. The build converts internal HTML links to canonical routes and preserves fragment anchors. HTML variants and legacy homepage paths redirect permanently, preserving queries. The Worker now combines production HTTP/www and path normalisation in one redirect. Local and workers.dev previews retain their own origins. A www redirect needs working DNS, a certificate and routing to this Worker; code does not provision these.

## Completed changes

- Set the exact homepage title to “MMA Sri Lanka | Sri Lanka Mixed Martial Arts Federation”.
- Set the homepage description to “Explore MMA in Sri Lanka with SLMMAF: affiliated clubs, athlete development, coaching programmes, federation news and upcoming events.” This reflects existing content; unconfirmed event details remain explicit.
- Standardised the website name in visible copy, metadata, generated breadcrumbs, club titles, WebSite markup and the manifest. All seven source pages have distinct titles/descriptions; generated club pages retain distinct metadata.
- Aligned Open Graph and Twitter titles/descriptions with each page, retaining existing suitable images. The homepage's square federation emblem uses a Twitter summary card.
- Made the homepage's relationship to SLMMAF explicit. Preserved one main heading per page and the existing layout, beginner guide and membership enquiry functionality.
- Added athlete/coaching anchors and contextual links among programmes, clubs, events, news and contact. Clarified programme enquiries and unpublished event details. Removed the unsupported event mailing-list signup promise; the contact form prepares an email draft.
- Retained the federation SportsOrganization entity (an Organization subtype), logo, contact details and stable identifier. Corrected the single homepage WebSite entity to MMA Sri Lanka, with the full federation name and SLMMAF as alternatives. Club pages reference their own stable organisation entity and the federation identifier. No verified official social profiles were supplied, so no federation sameAs links were invented.
- Preserved valid robots.txt and sitemap configuration. The build lists only published canonical pages without fabricated modification dates. Draft, suspended and expired club records remain excluded.
- Added production HTTPS/www and additional homepage redirects. Kept missing pages as 404 responses with noindex. No public administrative pages exist in the asset bundle; source scripts and club data are not served.
- Strengthened existing SEO and Worker checks for homepage metadata, names, sharing metadata, indexability, schema definitions, images, redirects and sitemap coverage.

Files edited for this task: all seven HTML source pages; `scripts/seo.mjs`, `scripts/clubs.mjs`, `scripts/seo-check.mjs`, `scripts/worker.test.mjs`; `src/index.js`; `site.webmanifest`; `README.md`; and this file. Existing changes to `styles.css` and `script.js` were left intact. No deployment, Git push, external website edit, Search Console submission or ranking measurement was performed.

## Verification

Verified locally on 12 October 2026:

- `npm run check:seo` passed: build and all nine generated pages, unique metadata, canonicals, social tags, robots directives, main headings, JSON-LD, links, anchors and sitemap coverage.
- `npm test` passed: club publication/validation, escaping, Worker path/origin redirects, query preservation, HEAD handling, preview behaviour and 404 indexing rules.
- Cloudflare's local Worker preview returned 200 without noindex for all sitemap URLs, robots.txt and sitemap.xml. Redirect targets/queries passed. Unpublished administrative/source paths returned 404 with noindex.
- Browser checks passed on all nine pages at 320, 390, 768 and 1440 pixels without horizontal overflow or missing headings/images. Content and metadata remained readable with JavaScript disabled. Mobile navigation worked. Homepage mobile/desktop screenshots were visually inspected. Evidence is in ignored `.preview/seo-verification.cjs` and `.preview/seo-home-390.png` / `.preview/seo-home-1440.png`.
- Existing live production robots.txt, sitemap and all nine sitemap URLs returned 200; canonicals matched the sitemap. Existing /home and /index.html redirects worked. At inspection, HTTP served content without an HTTPS redirect and www did not resolve. Confirm both after deployment/hostname configuration. These observations do not establish Google indexing or ranking status.

## Owner actions after deployment

### Deploy and verify production

Review and deploy through the existing Cloudflare workflow. Run `npm test` and `npm run check:seo`, then use Workers Builds or `npm run deploy`. Set production `SITE_URL=https://mmasrilanka.com` or leave it unset for the default. Confirm sitemap pages return public 200 responses without noindex. Test HTTP and /index.html redirects. If enabling www, configure its DNS, certificate and Worker custom domain, then confirm its redirect. Ensure bot/firewall settings permit crawling.

### Compare the reported queries

1. Open the verified `mmasrilanka.com` Domain property or `https://mmasrilanka.com/` URL-prefix property in Google Search Console. If necessary, verify through DNS, or set `GOOGLE_SITE_VERIFICATION` to the actual supplied HTML token before building; no token is generated by this project.
2. Open **Performance → Search results**, select **Search type: Web** and **Last 3 months**. Enable **Total clicks**, **Total impressions**, **Average CTR** and **Average position**.
3. Add **Query → Custom (regex) → Matches regex** with `^(mma sri lanka|slmmaf)$`. Compare the exact queries in the **Queries** table and export a baseline. Matching is case insensitive by default.
4. Add **Country → Sri Lanka**, retain the query filter and export this baseline separately. Remove the country filter to return to worldwide data. The **Pages** tab shows which URLs receive impressions; optionally filter to the exact homepage URL.
5. After deployment, compare equal date ranges, such as the last 28 days and previous 28 days, using the same filters. Record the deployment date. Missing query rows may reflect limited/anonymised data, not lack of indexing. Average position is an aggregate, not a fixed rank for every searcher.

See Google's [performance metrics](https://support.google.com/webmasters/answer/7576553) and [filtering instructions](https://support.google.com/webmasters/answer/17011165).

### Inspect the homepage and request indexing

Paste `https://mmasrilanka.com/` into **URL Inspection**. Review indexed status, last crawl, crawl/indexing permissions, user-declared canonical and Google-selected canonical. Select **Test live URL**; check successful fetch and eligibility, then view the tested HTML/screenshot for updated metadata and copy. The live test does not establish that the update is indexed. After a successful post-deployment test, select **Request indexing**. Inspect other changed pages as needed. See Google's [URL Inspection instructions](https://support.google.com/webmasters/answer/9012289).

### Submit the working sitemap

Confirm `https://mmasrilanka.com/sitemap.xml` serves XML with canonical public URLs. In **Sitemaps → Add a new sitemap**, enter that URL (or `sitemap.xml` if the property prefix is prefilled), then **Submit**. Confirm **Success**; inspect error details if fetching fails. Monitor the Page indexing report. Submission does not guarantee indexing. See Google's [Sitemaps instructions](https://support.google.com/webmasters/answer/7451001).

### Obtain relevant federation links

Ask MMA Colombo and other approved affiliated club website owners to add a contextual link, such as “Sri Lanka Mixed Martial Arts Federation (SLMMAF) — MMA Sri Lanka”, pointing to `https://mmasrilanka.com/`. A club can also link to its existing federation profile. Describe only confirmed affiliations. No external club website source or verified website URL is available here, so no backlink or external website URL was invented or published. No outreach messages were sent.

### Supply factual information

Provide confirmed programme availability, eligibility, fees, intakes and qualification details; event dates, venues, registration links and organisers; substantive news with factual dates/results; club venues, timetables and official website URLs; and confirmed federation profile links for sameAs markup. Recognition or international affiliation claims need supporting evidence before publication. Keep approved club records current and rebuild after changes.

Search visibility changes take time while search engines recrawl and reassess pages. Structured data explains names and relationships; it does not guarantee higher rankings. First-page rankings cannot be guaranteed. Google's [site-name guidance](https://developers.google.com/search/docs/appearance/site-names) covers consistent naming and recrawl timing.
