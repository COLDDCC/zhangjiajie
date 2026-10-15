# Zhangjiajie Field Notes

An English-language 2026 travel guide to Zhangjiajie, Hunan. Static HTML — no build step, no framework, no dependencies.

**Live:** https://colddcc.github.io/zhangjiajie/

## The idea the whole site is built on

Most trip reports treat "Zhangjiajie" as one attraction. It is three separately ticketed areas in three different districts — the Wulingyuan pillar forest, Tianmen Mountain in the city, and the Grand Canyon glass bridge in Cili County — an hour apart by road. People book the wrong ticket and lose a day. Every page exists to resolve one piece of that confusion.

## Pages

| File | Answers |
|---|---|
| `index.html` | What to do, and how the three areas fit together |
| `zhangjiajie-itinerary.html` | Two, three and four day plans, hour by hour |
| `tianmen-mountain.html` | Routes A/B/C, and the 2026 cableway situation |
| `zhangjiajie-glass-bridge.html` | Which glass structure is which, tickets, the bungee |
| `best-time-to-visit-zhangjiajie.html` | Month by month, with cloud-sea odds |
| `zhangjiajie-tickets-prices.html` | Every fee, including what the park pass excludes |
| `chinese-mountains.html` | How Zhangjiajie compares with the other named mountains |
| `credits.html` | File-by-file photo licences, authors and sources |
| `404.html` | On-brand fallback, links back into the guide |

## Structure

```
/               9 HTML pages (7 guides + credits + 404)
/assets/        site.css (design system + image slots), site.js (progressive layer)
/img/           photography, and og-zhangjiajie.jpg for social cards
favicon.svg  robots.txt  sitemap.xml  README.md
```

Shared CSS and JS live in `/assets` once rather than being duplicated per page.

## Preview locally

Open `index.html` in a browser, or serve it:

```
python -m http.server 8000
```

GitHub Pages serves the repository root, so no configuration file is needed.

## Deploy

The repository is public but **Pages is not yet enabled**. To go live:

1. Repository **Settings → Pages → Source: Deploy from a branch**
2. Branch `master`, folder `/ (root)`, **Save**
3. The site appears at `https://colddcc.github.io/zhangjiajie/`

`canonical`, `og:url`, `sitemap.xml` and `robots.txt` are already written for that URL. A custom domain means updating those four places.

## Design notes

- **Palette** wet sandstone, valley mist, pine, Tujia brocade red.
- **Type** Bodoni Moda (display) / Karla (body) / IBM Plex Mono (data), from Google Fonts with `display=swap`.
- **Layout** photographs run full-bleed; text sits in a 74ch measure. The signature component is the vertical index, where the figure beside each entry is that attraction's actual height.
- Every image slot degrades to a duotone gradient in the site palette, so a missing or still-loading photograph never shows as a grey box.

## Performance and accessibility

- No JavaScript required for content: the reveal animation is gated on a `.js` class set in `<head>`, so the copy is readable with scripting off or if `site.js` fails to load.
- `prefers-reduced-motion` disables reveals, the hero parallax and smooth scrolling.
- Body copy and all label colours clear WCAG 2.1 AA (4.5:1) against their backgrounds; large display type clears 3:1.
- Focus-visible outlines, a skip link, semantic tables with `<caption>`, and sticky section navigation on the hub page.
- One request each for CSS and JS across the whole site; pages are 17–30 KB of HTML.

## SEO

- `Article`, `BreadcrumbList` and `FAQPage` JSON-LD on every guide page.
- `FAQPage` entries mirror the on-page questions exactly — nothing marked up that a visitor cannot read.
- One URL per search intent, declared in `sitemap.xml` with matching `canonical` tags.

## An honest caveat on the numbers

Ticket prices, cableway schedules and route arrangements in Zhangjiajie are set by local notice and change at short notice; booking platforms add service charges on top. Figures on the site are approximate and dated. **Use them to build a budget, not to argue at a gate.** Reconfirm with the operators before booking flights around a specific attraction.

## Photography

All 22 images in `/img` are third-party photographs downloaded from Wikimedia Commons — none are original to this site. They were cropped and resized for the web, which strips the rights metadata the originals carried, so the licence record lives on its own page instead: **[`credits.html`](https://colddcc.github.io/zhangjiajie/credits.html)**, linked from every footer.

| Licence | Files | Attribution required |
|---|---|---|
| CC BY-SA 4.0 | 11 | yes |
| CC BY 2.0 | 6 | yes |
| CC BY 3.0 | 2 | yes |
| CC BY-SA 3.0 | 1 | yes |
| CC BY 2.5 | 1 | yes |
| Public domain | 1 | no |

Licence and author were read from each Commons file page on 2026-10-15 (`action=query&prop=imageinfo&iiprop=extmetadata`), not inferred from the filenames. 11 distinct uploaders, the most-reused being `xiquinhosilva` (5 files) and `Rocio Gil` (4). **If you replace an image, update `credits.html` to match** — an inaccurate credit line is worse than no credit line.
