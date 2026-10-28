# Optimization validation — 29 October 2026

## Implemented

- Batch 1 (#2): ten Amap + Apple + Google searches, file self-link repair, editorial-date-driven WebPage/BreadcrumbList/WebSite metadata and sitemap.
- Batch 2 (#3): original accessible SVG; one shared planner component and static fallback; 18 combinations per planner page; sleep/sights/time/reminders; family and postponement-aware weather variants; URL, copy and print. Published time suggestions are linked and dated; no fixed queue estimates or unverified coordinates.
- Batch 3: WebP variants without upscaling (800/1200/1600 where source size permits), picture/srcset/sizes, JPEG fallbacks, hero priority, complete image-source checks, PR build/browser checks, and historical note moved to docs.
- Original JPEGs, image captions/licences, analytics-free operation, existing URLs and original static assertions remain.

## Passed locally

- `python scripts/build.py`; `python scripts/check.py`; `node --check assets/site.js`.
- All 65 JPEG/WebP files decode using Pillow; all srcset targets exist, are nonempty and count toward used assets.
- 12 pages × 390/768/1024px: no horizontal overflow and every image loads. Chromium 153, DPR 1.
- 36 planner cases (18 per page): day count, field count, attraction selection, family/rain changes, disabled extra for four days, invalid-query fallback and shared URL restoration.
- No-JS context: every H1 visible, static three-day plans retained.
- New planner: 50 visible text elements pass computed foreground/background WCAG AA thresholds. Schematic text uses the existing AA palette; labels have solid backgrounds so route lines do not cross text.
- Four-day rainy itinerary: one A4 page in Chromium PDF output. Print button invocation and clipboard success/fallback are covered by browser checks.
- Mobile schematic and full homepage screenshots inspected. Home schematic follows the planner and uses a smaller preview.

## Measured image bytes

Local HTTP, fresh browser context, DPR 1, all four homepage photographs loaded (lazy loading forced only for measurement). Same selected widths at 390/768/1024px.

| Metric | Before | After |
|---|---:|---:|
| Four homepage image response bodies | 725,309 B | 347,442 B |
| Hero image response body | 288,682 B | 87,596 B |
| Image directory on disk | 4,523,599 B | 9,655,533 B |

Homepage image bytes decrease by 52.1%; hero decreases by 69.7%. The directory grows because all original JPEG fallbacks plus 42 WebP derivatives are shipped. This is not a full-page transfer or LCP measurement. No AVIF added.

## External checks still open

- Actual mobile Amap/Apple/Google search result accuracy for each entrance in mainland China. Links use names, not verified coordinate pins.
- Google Rich Results Test; schema syntax, relationships and dates are checked locally.
- Production deployment and live-page verification; these changes are PRs, not a verified release.
- Lighthouse mobile before/after and full-page transfer under a defined network profile; no LCP claim made.
- Full accessibility audit including manual keyboard/screen-reader review is not implied by the targeted contrast/layout tests.

## Intentionally deferred

No personal about page: real byline and visit history have not been supplied. No ticket-price changes. Unknown visit/queue/transfer timings remain qualitative. Existing operator notices keep their dated scope.

## Release order

PRs are stacked for review. Merge #2 first, retarget #3 to master and merge after checks; then retarget batch 3 to master. Each merge deploys separately. Verify the live site after each deployment. Revert the relevant PR to roll back that batch.
