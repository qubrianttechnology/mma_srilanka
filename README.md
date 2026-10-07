# Sri Lanka MMA Federation website

A responsive, accessible and SEO-ready static website configured for Cloudflare Workers Static Assets.

## Cloudflare deployment

The existing Cloudflare Git-connected project can use these settings:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Root directory: /
Production branch: main
```

The `wrangler.jsonc` file points Wrangler to the generated `dist/` directory and the lightweight Worker in `src/index.js`. The Worker serves the static site, applies security and cache headers, and redirects `/home` and `/index.html` to the canonical home page.

Add this production environment variable in Cloudflare when the final domain is known:

```text
SITE_URL=https://www.mmasrilanka.com
```

Every push to `main` will then build and deploy automatically.

### Local development

```bash
npm install
npm run dev
```

### Manual deployment

```bash
npm install
npm run deploy
```

## Motion and interaction

- Sequenced hero entrance and image focus animation
- Always-visible section content with compact responsive spacing
- RequestAnimationFrame-throttled hero depth effect
- Button, card, navigation and event micro-interactions
- Automatic reduced-motion fallback for accessibility

## Before production launch

- Confirm the official domain and set the Cloudflare `SITE_URL` production environment variable.
- Confirm the official federation name, email address, social profiles, governance statements, statistics, and programme details.
- Connect the interest form in `script.js` to the federation's approved form or CRM endpoint.
- Add verified event dates and news articles as they become available.
- For best social sharing, export a dedicated 1200 × 630 Open Graph image.

## SEO included

- Semantic heading and landmark structure
- Unique title and meta description
- Canonical, robots, Open Graph and Twitter metadata
- `SportsOrganization` JSON-LD structured data
- XML sitemap and robots file
- Descriptive image alternative text
- Responsive layout, reduced-motion support and keyboard navigation

## Website pages

- `index.html`: Home
- `about.html`: About Us, Vision, Mission and Commitment
- `programmes.html`: Development programmes
- `events.html`: Upcoming events
- `news.html`: Federation updates
- `contact.html`: Membership and contact
- `clubs.html`: Directory template; the build generates `/clubs/` and club profiles from `data/clubs.json`

All pages share `styles.css` and `script.js`. Navigation is included in each HTML file, so update header and footer links across all seven pages when changing the menu. The build includes every page in `dist/`; Cloudflare serves the corresponding extension-free URLs listed in the sitemap.

## Affiliated clubs

Club and country pages are generated from `data/clubs.json` at build time. See [data/README.md](data/README.md) for publishing rules, field definitions and Google Search Console steps. Use `npm run dev` to preview generated club pages.

## SEO checks and publication

Run `npm run check:seo` and `npm test` before publishing. See [SEO.md](SEO.md) for the MMA Srilanka keyword map, technical implementation and remaining Search Console steps. Set `GOOGLE_SITE_VERIFICATION` to an actual Search Console HTML token to include it in the generated pages.
