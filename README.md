# Zhangjiajie Field Notes

Buildless English travel guides with a browser-local 2/3/4-day itinerary selector. No API key or database. The deploy build uses Pillow for responsive images; source HTML still opens directly.

## GitHub Pages

In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The workflow checks the pages and publishes `dist/` on pushes to `master`.

Default address: `https://colddcc.github.io/zhangjiajie/`.

For a custom domain, set the repository Actions variable `SITE_URL` to the full HTTPS domain and configure the same domain in Pages settings. Add a `CNAME` file containing only the hostname if using a branch-based deployment.

## Cloudflare Pages

- Production branch: `master`
- Framework: None
- Build command: `python -m pip install -r requirements-build.txt
python scripts/build.py && python scripts/check.py`
- Output directory: `dist`
- Environment variable: `SITE_URL=https://your-actual-domain`

The build injects canonical URLs, makes `og:image` absolute and generates a matching sitemap and robots file. Set `SITE_URL` before publishing to another hostname so search engines see the correct domain.

## Local checks

```sh
python -m pip install -r requirements-build.txt
python scripts/build.py
python scripts/check.py
node --check assets/site.js
```

Root HTML pages can also be opened directly. They intentionally omit canonicals until the build knows the publication URL. All content is visible without JavaScript; the selector and copy buttons are enhancements.

`check.py` asserts one `<h1>` and one parseable JSON-LD block per page, unique element ids, that every local link, fragment and image target exists, that no `<img>` is left without alt text, that no shipped photograph sits unused, and that the sitemap covers every page except `404.html`.

## Layout

```
/               12 HTML pages (10 guides + credits + 404)
/assets/        site.css (design system + photography layer), site.js (enhancements)
/img/           23 photographs, already resized for the web
/scripts/       build.py (host-aware metadata) and check.py (static checks)
.github/        Pages workflow
favicon.svg  robots.txt  sitemap.xml
```

## Photography

Every image on the site is a real `<img>` with alt text and a `<figcaption>` naming its author and licence — not a CSS background, which could carry neither. All 23 are third-party works from Wikimedia Commons, downloaded and resized here. `credits.html` is the written licence record: resizing a JPEG strips the embedded rights metadata, so the terms survive only as that table.

The photographs are served from `/img`, so nothing hotlinks another domain at page-view time.

`assets/site.css` ends in a documented **PHOTOGRAPHY LAYER**. It is appended rather than woven into the design system so the two can be read, and reverted, separately.

## Editorial notes

- Tianmen Mountain route notice reviewed on 13 October 2026. Long city cableway closed; Route C uses the separate cave express cableway. Check later operator notices.
- Conflicting unverified exact ticket prices were removed. Current guides compare inclusions and direct visitors to confirm their selected product.
- No analytics or bookings are installed. No visitor data is sent by the itinerary selector.

## Browser verification status — 29 October 2026

The final build passes all 12 pages at 390, 768 and 1024px with loaded images and no horizontal overflow, 36 planner combinations, URL restoration, and no-JS static fallback checks. All 36 planner combinations print on one A4 page, with selected travel style and a reopen link; ordinary guides retain their printed content. Mobile selects stack vertically and inactive controls are hidden without JavaScript. New planner text passes computed contrast checks. Detailed evidence and remaining external checks are recorded in `docs/optimization-validation.md`.

Previous baseline:

Checked on a local server at 390, 768 and 1024 px: no horizontal overflow on any page, every photograph loads, and text colours clear WCAG 2.1 AA (4.5:1 small, 3:1 large) against their real rendered backgrounds, including caption bands measured over a white photograph as the worst case.

## Field tools and responsive images

The planner is generated from `snippets/planner.html` for both pages, with a static default retained in source HTML. URLs use `days`, `extra` and `pace`. Four days includes both extras. Every day links to its guide and Chinese-name/map row; selection parameters survive the home → itinerary → map → itinerary journey. Less walking is not a step-free accessibility claim; weather mode may require postponement. Published timing suggestions are dated and linked; no fixed queue times are asserted.

`images.py` creates WebP variants at 320/480/800/1200/1600px, capped at original width, in `dist/img`. The build inserts picture/source/srcset markup while retaining the original JPEG, alt and attribution. Variants inherit each source image’s licence in `credits.html`. The output package contains both formats, so total disk bytes increase; modern browsers select a WebP instead of downloading both.

Optional interaction/browser checks (Node): install `jsdom` and `playwright`, then run `node scripts/planner-check.cjs`; install Chromium with `npx playwright install chromium`, run `node scripts/browser-check.cjs`. No browser or npm dependency is shipped to visitors.

The three PRs are stacked for review: merge batch 1 first, retarget batch 2 to master, then merge it and retarget batch 3. Each production merge triggers a separate deployment. A pushed PR is not a verified live release.

`node scripts/image-budget.cjs` checks real Chromium image selection on the homepage and mountain comparison page at 390/768/1024px and DPR 1/2. Set `IMAGE_BASELINE_DIR` to an older `dist` to compare response body bytes under the same conditions. `CHROMIUM_PATH` can select an existing browser. CI saves the measurements as a workflow artifact. Layout-specific `sizes` are derived from HTML ancestors so a reused photo can request different sizes in a card and an editorial split.

Clipboard access is optional: when unavailable or denied, a selectable-text dialog provides the same copy content, with Escape/Done returning focus to the originating button. Full-plan copies retain guide, map and timing-source URLs. Browser checks cover this fallback and 320px enlarged-text reflow in addition to the normal layout suite.
