# Sri Lanka MMA Federation website

A responsive, accessible and SEO-ready static website configured for Cloudflare Workers Static Assets.

## Cloudflare deployment

Connect `https://github.com/qubrianttechnology/mma_srilanka` through Cloudflare Workers Builds. In the Cloudflare dashboard, open **Workers & Pages**, create or select the Worker, and connect the GitHub repository. Authorize the Cloudflare GitHub app to access this repository when prompted.

Use these settings (this project uses Workers Static Assets, not Pages):

```text
Worker name: sri-lanka-mma-federation
Build command: npm test && npm run check:seo
Deploy command: npx wrangler deploy
Root directory: /
Production branch: main
```

The `wrangler.jsonc` file points Wrangler to the generated `dist/` directory and the lightweight Worker in `src/index.js`. The Worker serves the static site, applies security and cache headers, and redirects `/home` and `/index.html` to the canonical home page.

Add this production environment variable in Cloudflare when the final domain is known:

```text
SITE_URL=https://mmasrilanka.com
```

Once connected, every push to `main` will build, validate and deploy automatically. A failing test or SEO check stops the build before deployment. GitHub Actions also runs the checks on pushes and pull requests.

After the first deployment, open the `workers.dev` URL shown by Cloudflare. To use `mmasrilanka.com`, add it under the Worker's **Settings > Domains & Routes > Add > Custom Domain**. The domain must be in the appropriate Cloudflare account; setting `SITE_URL` only changes generated URLs and does not configure DNS. If you also configure the www hostname, redirect it to https://mmasrilanka.com through Cloudflare.

Keep Cloudflare tokens and local environment files out of Git. Workers Builds manages its deployment credential in Cloudflare; this repository does not require a Cloudflare token in GitHub Actions.

## GitHub version control

The production branch is `main`. For an update:

```bash
git pull --ff-only origin main
npm ci
# Edit the website, then validate it.
npm test
npm run check:seo
git add <changed-files>
git commit -m "Describe the website update"
git push origin main
```

For reviewed changes, push a feature branch and open a pull request into `main`. Track `package-lock.json` so local development and Cloudflare install the same dependency versions. Generated `dist/` files are rebuilt and are not committed.

### Local development

```bash
npm ci
npm run dev
```

### Manual deployment

```bash
npm ci
npx wrangler login
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
- The interest form opens a prepared email to `info@mmasrilanka.com`; visitors must send it from their email app. Confirm this inbox is monitored before launch.
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

## Membership enquiries and beginner guidance

The contact page includes role-specific membership enquiries, a three-step explanation and a beginner FAQ. The programmes page includes a beginner guide linked from the home page. Confirmed fees, eligibility rules and membership benefits can be added once the federation supplies them.

The enquiry form validates the required name, email and role, then opens a `mailto:` draft addressed to `info@mmasrilanka.com`. Phone, location and a short message are optional. Visitors must review and send the email themselves; opening a draft is not a submission or membership confirmation. Their entries remain available on the page, with a copyable draft if an email app is unavailable. Editing a field clears the old draft so it can be regenerated. No form data is posted to the Worker or saved by the website. Without JavaScript, the page provides direct email instructions.

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

Run `npm run check:seo` and `npm test` before publishing. See [SEO.md](SEO.md) for the MMA Sri Lanka implementation, verification results and exact owner steps for Search Console query comparisons, indexing and sitemap submission. Set `GOOGLE_SITE_VERIFICATION` to an actual Search Console HTML token to include it in the generated pages.
