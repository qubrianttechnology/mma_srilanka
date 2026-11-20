# Federation emblem update

The owner supplied **Sri Lanka MMA Federation Emblem (1).png** and requested background removal and replacement of every website logo. The emblem's own black/white artwork and outer white border are part of the logo; only the exterior dark backdrop is removed.

## Search favicon compatibility — 15 November 2026

Every public page now declares stable `/favicon.png` and `/favicon.ico` URLs, plus the existing 192px Apple touch icon. The build creates the ICO from the exact existing 96px and 192px PNG bytes without changing the emblem. The PNG remains 96 × 96; the ICO includes 96 × 96 and 192 × 192 frames. SEO checks validate discovery tags on every page and the published icon bytes.

Before this update, the live 96px PNG already returned 200 and met Google's size requirement, while `/favicon.ico` returned 404. Adding ICO support improves compatibility; the missing ICO was not established as the cause of Google's globe icon. Requests carrying Googlebot/Googlebot-Image user-agent strings received the homepage and PNG successfully, but that does not establish actual Google crawl or indexing status. Google controls when and whether it refreshes the search favicon. See https://developers.google.com/search/docs/appearance/favicon-in-search.

The stable icon links supersede the version-query references described in the original asset preparation notes below. No Search Console request has been submitted as part of this source update.

## Final assets

- `assets/slmmaf-emblem-transparent.png`: 1024 × 1024 transparent PNG used by the page templates, sharing metadata and organisation structured data.
- `assets/slmmaf-official-logo.png`: the same updated PNG retained for existing local consumers. Requests to this old public path redirect to the canonical new asset.
- `assets/slmmaf-icon-192.png` and `assets/slmmaf-icon-512.png`: transparent app icons in the web manifest.
- `favicon.png`: 96 × 96 transparent favicon. Updated page references use a version query to refresh existing browser caches.

The image was edited with the **built-in Imagegen tool**, not the API/CLI fallback. The selected cutout was exported with a smooth circular crop to remove detached edge pixels, centred on a transparent square, and resized for the website icons. The generated alpha inside the emblem is retained. Light and dark background previews were inspected before deployment.

## Selected edit prompt

> Use case: background-extraction. Edit target: the supplied Sri Lanka MMA Federation emblem PNG. Remove ONLY the dark burgundy/near-black background outside the emblem's outer white circular border, replacing that exterior background with genuine alpha transparency. Preserve the entire emblem EXACTLY: the outer white border, gold ring, all interior black and white areas, lions, fighter, medal, colours, proportions and original lettering. Text must remain verbatim and unaltered: SRI LANKA / MIXED MARTIAL ARTS FEDERATION / SLMMAF. Do not redraw, redesign, retype, restyle, simplify or add anything. Keep the circular emblem centred, fully visible and sharp with minimal transparent padding. Output a clean high-resolution transparent PNG for the website logo.
