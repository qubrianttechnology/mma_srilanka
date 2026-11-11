# Federation emblem update

The owner supplied **Sri Lanka MMA Federation Emblem (1).png** and requested background removal and replacement of every website logo. The emblem's own black/white artwork and outer white border are part of the logo; only the exterior dark backdrop is removed.

## Final assets

- `assets/slmmaf-emblem-transparent.png`: 1024 × 1024 transparent PNG used by the page templates, sharing metadata and organisation structured data.
- `assets/slmmaf-official-logo.png`: the same updated PNG retained for existing local consumers. Requests to this old public path redirect to the canonical new asset.
- `assets/slmmaf-icon-192.png` and `assets/slmmaf-icon-512.png`: transparent app icons in the web manifest.
- `favicon.png`: 96 × 96 transparent favicon. Updated page references use a version query to refresh existing browser caches.

The image was edited with the **built-in Imagegen tool**, not the API/CLI fallback. The selected cutout was exported with a smooth circular crop to remove detached edge pixels, centred on a transparent square, and resized for the website icons. The generated alpha inside the emblem is retained. Light and dark background previews were inspected before deployment.

## Selected edit prompt

> Use case: background-extraction. Edit target: the supplied Sri Lanka MMA Federation emblem PNG. Remove ONLY the dark burgundy/near-black background outside the emblem's outer white circular border, replacing that exterior background with genuine alpha transparency. Preserve the entire emblem EXACTLY: the outer white border, gold ring, all interior black and white areas, lions, fighter, medal, colours, proportions and original lettering. Text must remain verbatim and unaltered: SRI LANKA / MIXED MARTIAL ARTS FEDERATION / SLMMAF. Do not redraw, redesign, retype, restyle, simplify or add anything. Keep the circular emblem centred, fully visible and sharp with minimal transparent padding. Output a clean high-resolution transparent PNG for the website logo.
