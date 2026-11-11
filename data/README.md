# Managing affiliated clubs

Edit `data/clubs.json`, then run `npm run build`. Preview the generated website with `npm run dev`; club profiles and country pages are generated in `dist/`. Do not edit generated files in `dist/`.

Each club requires:

- `slug`: permanent, unique lowercase URL identifier, using letters, numbers and hyphens.
- `name`: official club name.
- `countryCode`: two-letter uppercase country code, such as `LK`.
- `country`: consistent public country name, such as `Sri Lanka`.
- `city`: public town or service area. The first supplied club uses `Colombo / Gampaha` until an exact location is supplied.
- `description`: factual public club description.
- `status`: `draft`, `approved` or `suspended`. Only approved clubs are published.

Optional fields: `region`, `streetAddress`, `postalCode`, `phone`, `email`, `website` (HTTPS), `affiliationNumber`, `disciplines` (array of names), and `validUntil` (`YYYY-MM-DD`). Omit unknown fields; do not use placeholder numbers or fabricated addresses. Sri Lankan national telephone numbers are converted to +94 for click-to-call links.

For a useful, searchable club profile, also provide verified public details where available:

- `alternateNames`: an array of actual short names used by the club. These appear visibly on the profile and in structured data; do not add a list of search keywords.
- `trainingInformation`: factual text about coaching, age groups, beginner access and how to join. Do not invent fees, timetables or credentials.
- `trainingLocations`: an array of objects containing `name` (the venue), `city` and an optional confirmed `streetAddress`. Each location appears in the profile and club structured data. Omit unconfirmed venues.

Every approved club automatically receives a permanent profile URL, a search title containing its name and city, a description drawn from its own public description, matching social metadata, a canonical URL, club and breadcrumb structured data, and crawlable links from the main and country directories. Official websites, aliases, disciplines and venues are added to structured data when supplied. The sitemap is rebuilt from all published clubs, so no per-club SEO code or manual sitemap edit is needed. Give each club its own factual description; the SEO check rejects duplicate page descriptions and titles.

The MMA Colombo details were checked against its [official website](https://mmacolombo.com/) and [contact page](https://mmacolombo.com/contact.html) on 11 November 2026. Its phone matches the existing federation record. The listed venues are HNB Building, Kohuwala and RY Academy and Studio, Wattala. Class times are intentionally referred to the club for confirmation. This directory's SEO changes apply to federation profiles, not to another website's source.

An approved club generates:

- Its directory entry at `/clubs/`.
- A club profile at `/clubs/{slug}/`.
- An entry on `/clubs/countries/{countryCode}/` (lowercase country code).
- Sitemap entries, unique metadata and structured club information.

Countries are populated from approved club records. Search and country filters enhance server-rendered links; the directory and profiles are readable without JavaScript.

Draft, suspended and expired clubs do not appear in the built output or sitemap. A rebuild and deployment are required when any record changes, including expiry dates. Expiry is evaluated on the UTC build date; schedule builds if expiry must be applied automatically on a particular day. An omitted expiry date does not assert a fixed validity period.

## Google discovery

The default public origin is `https://mmasrilanka.com`, matching the existing robots.txt sitemap domain. Set `SITE_URL` if the actual public origin differs. The build uses the same origin for canonical URLs, social metadata, structured data, the sitemap and robots.txt.

After publishing the production site, verify the domain in Google Search Console and submit `/sitemap.xml`. Club pages must be publicly reachable. Indexing and ranking remain Google's decision and are not guaranteed. No Search Console submission or deployment is performed by the build.

Run `node scripts/clubs.test.mjs` to check validation, publication rules, country pages and escaping.

Run `npm test` and `npm run check:seo` before deployment. The checks cover automatic SEO for additional club records, valid entity references, visible training details, official website links, publication rules and sitemap/directory discovery for every currently approved club. After deployment, inspect the club URL in the verified domain's Google Search Console property and request indexing, then submit `https://mmasrilanka.com/sitemap.xml` once. Google can discover future club URLs from that same sitemap after each build and deployment; inclusion and ranking are not guaranteed. The build does not send Search Console requests.
