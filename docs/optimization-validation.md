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

## Follow-up usability regression fixes — 29 October 2026

- Scoped planner-only print isolation to the two planner pages. Previously, the shared print rule also hid sections in ordinary guides. All ten non-planner pages now retain visible titles, main content and first sections in print media tests.
- Replaced the accidentally wrapping flex controls with an explicit responsive grid: three columns on desktop, one on phones. Browser assertions check vertical stacking and 44px minimum select height at 390px.
- Added the selected days/style/extra summary and a fully parameterized reopen link to the printed plan. Clarified that four days includes both extras. The copy text includes the selected summary.
- Without JavaScript, inactive selects, print/copy actions and Chinese-name copy buttons are hidden; static plans and names remain readable. Direct `file://` opening remains interactive without attempting an unsupported history mutation.
- Re-ran build, all static checks, both JS syntax checks, 36 DOM cases, full 12-page × three-width browser checks, file URLs, clipboard success/failure, print visibility and no-JS checks.
- Generated all 36 PDFs (18 combinations on each planner page); every PDF is one A4 page. These local checks do not establish mobile map pin accuracy, Lighthouse results or production deployment.

## Destination lookup and mobile map usability — 29 October 2026

- The destination table becomes individual cards below 600px. Explicit table/row/cell roles retain tabular semantics; desktop keeps the original comparison table. All 10 Chinese names and three map services per place remain in the static HTML.
- Optional search matches English or Chinese text, ignoring case and surrounding spaces. Includes an announced result count, an empty state and a show-all button. No requests, storage or analytics are added.
- Following a schematic anchor clears filtering so its target is visible. Printing restores all ten destination rows regardless of the active query. With JavaScript disabled the lookup controls stay hidden and all destinations remain available.
- Browser regression checks pass for airport/West station/Chinese queries, case/whitespace, no results, reset, anchor recovery, mobile card fit, 44px map targets, copying the airport’s Chinese name, full print output, and no-JS fallback. Re-ran the existing 12-page three-width and 36-case planner regression suite.
- This validates the interface and generated links, not the accuracy of external map search results on an actual phone in mainland China.
