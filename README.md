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
SITE_URL=https://www.mmasrilanka.lk
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
- IntersectionObserver-powered section reveals with staggered cards
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
