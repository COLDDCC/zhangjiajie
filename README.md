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

The build injects canonical URLs and generates a matching sitemap and robots file. Set `SITE_URL` before publishing to another hostname so search engines see the correct domain.

## Local checks

```sh
python scripts/build.py
python scripts/check.py
node --check assets/site.js
```

Root HTML pages can also be opened directly. They intentionally omit canonicals until the build knows the publication URL. All content is visible without JavaScript; the selector and copy buttons are enhancements.

## Editorial notes

- Tianmen Mountain route notice reviewed on 13 October 2026. Long city cableway closed; Route C uses the separate cave express cableway. Check later operator notices.
- Conflicting unverified exact ticket prices were removed. Current guides compare inclusions and direct visitors to confirm their selected product.
- The homepage photograph is externally hosted on Wikimedia. Credit: 颐园居, `Wulingyuan, Zhangjiajie, Hunan 20230702.jpg`, CC BY-SA 4.0. Source and license are linked next to the image; CSS crops the displayed image. A failed image request does not hide guide content.
- No analytics or bookings are installed. No visitor data is sent by the itinerary selector.
- Browser layout QA was unavailable in the editing environment. Automated static and selector checks were used.
