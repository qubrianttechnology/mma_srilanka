# Sri Lanka MMA Federation website

A responsive, accessible and SEO-ready static website configured for Cloudflare Pages.

## Cloudflare Pages deployment

### Option 1: Connect a Git repository

1. Push this folder to a GitHub or GitLab repository.
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Use these build settings:

   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: leave blank

4. Add a production environment variable named `SITE_URL` with the final HTTPS origin, for example `https://www.mmasrilanka.lk`.
5. Deploy. New commits to the production branch will deploy automatically.

### Option 2: Deploy from the terminal

```bash
npm install
npm run deploy
```

Wrangler opens the Cloudflare login flow the first time. The Pages project name is `sri-lanka-mma-federation`; change it in both `package.json` and `wrangler.jsonc` if needed.

### Local production preview

```bash
npm install
npm run preview
```

The build creates a clean `dist/` folder and substitutes `SITE_URL` into the canonical URL, social metadata, sitemap and robots file. On PowerShell, test a custom domain build with:

```powershell
$env:SITE_URL='https://www.example.lk'
npm run build
Remove-Item Env:SITE_URL
```

Cloudflare-specific `_headers` and `_redirects` files add security headers, sensible caching and canonical redirects.

## Motion and interaction

- Sequenced hero entrance and image focus animation
- IntersectionObserver-powered section reveals with staggered cards
- RequestAnimationFrame-throttled hero depth effect
- Button, card, navigation and event micro-interactions
- Automatic reduced-motion fallback for accessibility

## Before production launch

- Confirm the official domain and set it as the Cloudflare `SITE_URL` environment variable.
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
