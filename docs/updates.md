# Website update records

## Documentation review — 13 November 2026

This record describes the current local source and certificate files. It does not confirm that uncommitted changes have been deployed or indexed by Google.

### Club directory and affiliation

- MMA Colombo Combat Club is listed first, with other clubs following the data order. Club cards use one row per club at every screen size.
- International Japan Karate-Do Youshin Dojo has its own club profile, public instructor/contact details and permanent affiliation number `SLMMAF-CLUB-0002`. MMA Colombo uses `SLMMAF-CLUB-0001`.
- Approved clubs receive permanent profile URLs and generated PNG/SVG QR codes plus certificate labels. Preserve issued numbers and club slugs when renewing.
- Annual affiliation expires on the anniversary at midnight in Asia/Colombo. Approved profiles and QR links remain available with an expired badge; Worker requests and open pages refresh the status automatically.
- Youshin Dojo's issue date is 11 November 2026. MMA Colombo is explicitly exempt from annual renewal. Directory, country and profile pages show only the issue date; the renewal due date is hidden. The affiliation status tests cover that display rule.

See [club data instructions](../data/README.md) and [affiliation dates](club-affiliation-dates.md) for implementation and renewal details.

### Branding and certificates

- Website branding uses the transparent federation emblem, including app icons and favicon. Asset paths and image preparation are recorded in [logo assets](logo-assets.md).
- The local `certificates/` folder contains MMA Colombo and Youshin Dojo print deliverables, previews and QR verification images. Youshin revisions include signatures, the issue date, branding/header refinements and signatory names through v9. See [certificate records](../certificates/README.md).
- Certificate files are local deliverables; `scripts/build.mjs` does not copy the `certificates/` folder into the public asset bundle.

### News announcement

- `news.html` features the Judge and Referee Training Programme for **24 November 2026**, at **MMA Colombo Wattala Branch**.
- The lead card displays `assets/judge-referee-training-2026-11-24.png`, links to the full-size poster and links to the detailed announcement at `#judge-referee-training`.
- The previous federation approach story remains in the side list. Poster-specific CSS preserves the full image aspect ratio, and the News stylesheet reference uses `training-poster-20261124` to refresh cached styles.

### Documentation corrections

`data/README.md` now describes the current annual expiry behavior, issue-date fields and permanent QR availability. `SEO.md` identifies the current rules separately from older verification records. The root README links to these records and the certificate documentation. This review changed Markdown documentation only; no deployment or new runtime test result is claimed here.
