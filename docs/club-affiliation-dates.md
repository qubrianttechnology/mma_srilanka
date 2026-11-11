# Club affiliation dates

Store the certificate issue date in `data/clubs.json` as `affiliationIssuedOn: "YYYY-MM-DD"`.
Youshin Dojo uses 11 November 2026, matching its issued certificate. At the owner's explicit request, MMA Colombo has no date or annual expiry rule: `affiliationRenewalRequired: false`. Other clubs default to annual renewal. Do not apply that exemption to new clubs automatically.

Affiliation lasts one calendar year. It expires at 00:00 Asia/Colombo on the anniversary (29 February issues renew on 28 February in a non-leap year). The directory, country listing and permanent QR profile show the issue date and renewal due date. At expiry, the badge becomes **Affiliation expired** and the profile requests renewal. The club's page, number and QR link remain available.

The Worker refreshes badges, affiliation text and membership structured data on every HTML request; no redeployment or cron is needed for expiry. HTML responses for club pages are not cached. Open pages refresh their visible status every minute and when focused. Missing dates show **Affiliation date pending**, and future dates show **Affiliation not yet active**.

On renewal, update `affiliationIssuedOn` to the new certificate issue date and deploy. Keep the existing affiliation number and slug. `status` controls publication: draft/suspended clubs remain unpublished. The old optional `validUntil` field is no longer used to unpublish profiles or extend the one-year term.
