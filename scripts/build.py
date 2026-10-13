#!/usr/bin/env python3
"""Build deployable static files and host-aware SEO metadata. No dependencies."""
import os, re, shutil, json
from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
URL = os.environ.get('SITE_URL', 'https://colddcc.github.io/zhangjiajie').rstrip('/')
assert URL.startswith('https://'), 'SITE_URL must be an https URL'
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
for p in ROOT.glob('*.html'):
    s = p.read_text()
    page_url = URL + ('/' if p.name == 'index.html' else '/' + p.name)
    s = s.replace('<!-- HOST_META -->', '<link rel="canonical" href="'+escape(page_url, quote=True)+'">\n<meta property="og:url" content="'+escape(page_url, quote=True)+'">')
    # Root source files intentionally have no guessed canonical; deployment injects it.
    (OUT/p.name).write_text(s)
for name in ['assets', 'favicon.svg', '.nojekyll']:
    p=ROOT/name
    if p.is_dir(): shutil.copytree(p,OUT/name)
    elif p.exists(): shutil.copy2(p,OUT/name)
if (ROOT/'CNAME').exists(): shutil.copy2(ROOT/'CNAME',OUT/'CNAME')
pages=sorted(OUT.glob('*.html'))
(OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(URL+('/' if p.name=='index.html' else '/'+p.name))+'</loc><lastmod>2026-10-13</lastmod></url>\n' for p in pages if p.name!='404.html')+'</urlset>\n')
(OUT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+URL+'/sitemap.xml\n')
print('Built',len(pages),'pages for',URL)
