# Zhangjiajie Field Notes

Buildless English travel guides with a browser-local 2/3/4-day itinerary selector. No API key, database or package installation.

## GitHub Pages

In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The workflow checks the pages and publishes `dist/` on pushes to `master`.

Default address: `https://colddcc.github.io/zhangjiajie/`.

For a custom domain, set the repository Actions variable `SITE_URL` to the full HTTPS domain and configure the same domain in Pages settings. Add a `CNAME` file containing only the hostname if using a branch-based deployment.

## Cloudflare Pages

- Production branch: `master`
- Framework: None
- Build command: `python scripts/build.py && python scripts/check.py`
- Output directory: `dist`
- Environment variable: `SITE_URL=https://your-actual-domain`

The build injects canonical URLs, makes `og:image` absolute and generates a matching sitemap and robots file. Set `SITE_URL` before publishing to another hostname so search engines see the correct domain.

## Local checks

```sh
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

## Verified in a browser

Checked on a local server at 390, 768 and 1024 px: no horizontal overflow on any page, every photograph loads, and text colours clear WCAG 2.1 AA (4.5:1 small, 3:1 large) against their real rendered backgrounds, including caption bands measured over a white photograph as the worst case.
