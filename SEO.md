# MMA Srilanka SEO

The main search topic is **MMA Srilanka**, with the natural spelling **MMA Sri Lanka** used in page content. SLMMAF remains the organization's name. Page titles and descriptions match the actual page topic rather than repeating a keyword list.

## Page focus

| URL | Topic |
| --- | --- |
| `/` | MMA Srilanka, MMA in Sri Lanka, SLMMAF |
| `/about` | Sri Lanka Mixed Martial Arts Federation, mission and development |
| `/programmes` | MMA training, athlete development and coach education in Sri Lanka |
| `/clubs/` | Affiliated MMA clubs, country directory |
| `/clubs/countries/lk/` | MMA clubs in Sri Lanka |
| `/clubs/mma-colombo-combat-club/` | MMA Colombo Combat Club, Colombo / Gampaha |
| `/events` | MMA Sri Lanka events and development camps |
| `/news` | MMA Sri Lanka news, athlete welfare, affiliation and coaching |
| `/contact` | MMA Srilanka contact, membership and club affiliation |

## Implemented

- Unique page titles, meta descriptions, social sharing titles and descriptions.
- Consistent public origin: `https://www.mmasrilanka.com`, configurable with `SITE_URL`.
- Canonical URLs, internal links to canonical routes, and permanent redirects from HTML/legacy variants.
- WebSite site-name markup on the home page, with MMA Srilanka / MMA Sri Lanka as site-name variants.
- SportsOrganization and WebPage/AboutPage/ContactPage/CollectionPage structured data; real club details and breadcrumbs.
- Visible breadcrumbs on inner pages; substantive news sections behind reading links.
- A sitemap containing each published page, including approved club and country profiles; consistent robots.txt.
- Real 404 responses remain 404 and receive a noindex header; missing assets do not receive long cache lifetimes.
- Existing responsive layout, deferred scripts, image dimensions, hero preloading and immediate visibility of primary content.
- No fabricated ratings, event dates, addresses, qualifications, publication dates or social profiles.

`npm run check:seo` builds and validates every page's metadata, canonical, local links, anchors, heading structure, structured data and sitemap coverage. `npm test` checks club publication rules and Worker redirects/404 behavior.

## Production steps

1. Deploy the built website to the public domain. `SITE_URL` must match the real primary origin.
2. Verify domain ownership in Google Search Console. A DNS verification record must be installed through the domain provider, or set the `GOOGLE_SITE_VERIFICATION` build environment variable to the actual HTML verification token. No token is generated or fabricated by this project.
3. Submit `https://www.mmasrilanka.com/sitemap.xml` in Search Console and inspect the home, club directory and club profile URLs. Redirect any separately hosted alternate hostname to the primary hostname in the hosting/domain configuration.
4. Monitor the Search Console indexing and performance reports after deployment. Update approved clubs and publish factual event dates and substantive news as they become available.
5. Run PageSpeed Insights against the live domain to measure real delivery and Core Web Vitals. Field performance and external backlinks are not verified by the local build checks.

No deployment, Search Console verification/submission, live ranking claim or indexation guarantee is included in these code changes. Google decides whether and how pages appear.

Official references:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

## AI search discovery

The home and About page identify the federation as their main entity using the same organization ID. The About page provides the full name, abbreviation, website, activities and contact details in visible HTML. The existing wildcard robots.txt rule allows search crawlers, including OAI-SearchBot and Googlebot; adding agent-specific allow rules is unnecessary.

After deployment:

1. Check that the home page, About page, robots.txt and sitemap return public HTTP 200 responses without login or bot challenges. Check Cloudflare settings and crawler logs as well as robots.txt. Verify OpenAI crawler traffic against the IP ranges published in its documentation before changing firewall rules.
2. Complete the Search Console verification and sitemap submission above. Verify the domain in Bing Webmaster Tools and submit the same sitemap there.
3. Keep federation names and website links consistent on real official profiles. Add verified external profile URLs to organization `sameAs` markup only when supplied and confirmed. Publish factual leadership, governance, recognition and event information with supporting sources when available.
4. Monitor indexing reports and actual source links in AI search answers. Answer wording and inclusion vary; manual searches are observations, not proof of universal visibility.

These changes improve discoverability, but do not train ChatGPT, Gemini or other models, force recommendations, or guarantee citations. Google Search AI guidance concerns its Search features and does not guarantee Gemini app answers. No special AI text file or special AI schema is required for Google's AI Search features. Deployment and account-based submissions have not been performed by this change.

Official AI search references:
- https://developers.openai.com/api/docs/bots
- https://developers.google.com/search/docs/appearance/ai-features
