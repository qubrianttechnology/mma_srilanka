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
