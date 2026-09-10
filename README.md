# Sri Lanka MMA Federation website

A responsive, accessible and SEO-ready static website configured for GitHub Pages.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the website automatically whenever code is pushed to `main`.

1. Open `https://github.com/qubrianttechnology/mma_srilanka/settings/pages`.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Commit and push the project changes:

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

4. Open the repository **Actions** tab and wait for **Deploy to GitHub Pages** to complete.
5. The website will be available at `https://qubrianttechnology.github.io/mma_srilanka/`.

The workflow uses the permissions and official Pages actions required by GitHub. It generates a clean `dist/` artifact and adds `.nojekyll` automatically.

### Local production build

```bash
npm run build
python -m http.server 8080 --directory dist
```

To use a custom domain later, update the `SITE_URL` value in `.github/workflows/deploy-pages.yml` and configure that domain in the repository's Pages settings.

## Motion and interaction

- Sequenced hero entrance and image focus animation
- IntersectionObserver-powered section reveals with staggered cards
- RequestAnimationFrame-throttled hero depth effect
- Button, card, navigation and event micro-interactions
- Automatic reduced-motion fallback for accessibility

## Before production launch

- Confirm whether the GitHub Pages URL or an official custom domain will be used, then update `SITE_URL` in the deployment workflow.
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
