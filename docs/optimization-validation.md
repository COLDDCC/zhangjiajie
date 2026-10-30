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

## Planner-to-map handoff — 29 October 2026

- Each sightseeing day links to its guide and Chinese-name/map row: East gate for viewpoint days, South gate for Golden Whip Stream, Grand Canyon, or Tianmen mountain gate. Ticket and route notices still govern the actual meeting point; these are planning links, not a claim of verified navigation pins.
- Home-to-itinerary and itinerary-to-map links carry the validated days/extra/style choices. The map page provides a return link restoring the same plan. Only these three selection parameters are passed between pages.
- Matching map rows have accessible labels and programmatic focus targets. A trip link focuses the destination row; pressing Tab reaches its first map service. Static default-day links remain usable without JavaScript.
- Day navigation links are omitted from the compact print layout; the existing parameterized reopen link remains.
- Passed: all 36 planner variants have the intended map anchors and selection parameters; home → itinerary → Tianmen map → itinerary round trip retains four days, canyon preference and family style. Keyboard focus and next-Tab navigation are covered. Existing static, three-width layout, image, bilingual lookup, clipboard and no-JS checks pass. All 36 generated plan PDFs remain one A4 page.

## Responsive image selection refinement — 29 October 2026

The original responsive implementation offered no variant below 800px and used the same `sizes` for every layout. It over-delivered pixels to cards, small comparison thumbnails and the narrow desktop hero. Added 320/480px WebP variants; the HTML parser assigns `sizes` from hero/card/rail/split ancestors. Reused photographs therefore follow their actual placement. JPEG fallbacks, source dimensions, alt, credits and licences remain.

Measured with fresh Chromium contexts, all page images loaded, unchanged WebP quality, local uncompressed HTTP. These compare the immediately preceding WebP build against this refinement, not the original JPEG-only baseline.

| Viewport / density | Page | Previous image bytes | Refined image bytes | Reduction |
|---|---|---:|---:|---:|
| 390px / DPR 1 | Home | 347,442 | 128,734 | 62.9% |
| 390px / DPR 2 | Home | 347,442 | 347,442 | 0.0% |
| 768px / DPR 1 | Home | 347,442 | 59,278 | 82.9% |
| 1024px / DPR 1 | Home | 347,442 | 75,690 | 78.2% |
| 390px / DPR 1 | Mountains comparison | 680,964 | 162,100 | 76.2% |
| 390px / DPR 2 | Mountains comparison | 680,964 | 387,068 | 43.2% |

All twelve page/width/density comparisons show no image-byte increase. Image directory grows from 9,655,533 to 10,638,079 bytes: 23 original JPEGs plus 88 WebP variants, without upscaling. This is a transfer reduction, not a smaller deployment package or a Lighthouse/LCP result.

Passed: build/static checks for all 111 files; complete browser regression and 36 DOM planner cases; selection checks at 390/768/1024px and DPR 1/2 on both measured pages. New `scripts/image-budget.cjs` repeats these measurements, checks small-image selection and optionally compares an old build via `IMAGE_BASELINE_DIR`. CI runs the selection checks and uploads the JSON measurements.

## Copy reliability and enlarged-text reflow — 30 October 2026

- Clipboard rejection or absence now opens a labelled, selectable-text dialog instead of asking readers to find and select unrelated text on the page. It handles both full plans and Chinese destination names. Escape and Done close it and restore focus to the initiating button. The panel fits the tested 667×375 landscape viewport and scrolls internally when needed.
- Destination copy feedback appears beside the pressed button, rather than at the end of all ten rows. Full-plan exports contain labelled daily fields, actual guide/map URLs and the visible dated timing references with their source URLs. Local-file exports omit machine-local `file://` links.
- Enlarged-text tests exposed overflow from the mobile brand, comparison-photo credits, FAQ summaries and long list words. Mobile navigation now puts the brand above a contained guide list; text wraps when necessary. Planner controls use a minimum width in rem so they reflow as text grows.
- Added browser coverage for missing and rejecting clipboard APIs, selected fallback text, Escape/Done focus restoration, panel reuse, local-file export, adjacent destination feedback and browser Back restoration of plan choices.
- All twelve pages pass a 320px layout with root font size 200% and body text 34px, without document-level horizontal overflow or clipped H1 titles. This targeted text-enlargement simulation is not a complete accessibility audit. Tables retain their contained horizontal scrolling.
- Re-ran build/static assertions, 36 planner cases, all three standard viewport widths, map search, image loading, no-JS fallback and all 36 one-page A4 plan PDFs.
