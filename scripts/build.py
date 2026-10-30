#!/usr/bin/env python3
"""Build deployable static files and host-aware SEO metadata. No dependencies."""
import os, re, shutil, json
from datetime import datetime
from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
URL = os.environ.get('SITE_URL', 'https://colddcc.github.io/zhangjiajie').rstrip('/')
assert URL.startswith('https://'), 'SITE_URL must be an https URL'
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
dates = {}
for p in ROOT.glob('*.html'):
    s = p.read_text(encoding='utf-8')
    if p.name in {'index.html', 'zhangjiajie-itinerary.html'}:
        fragment = (ROOT/'snippets/planner.html').read_text()
        on_routes = p.name == 'zhangjiajie-itinerary.html'
        fragment = fragment.replace('{noscript}', 'Alternative routes are below.' if on_routes else 'Alternative routes are available on the itinerary page.')
        fragment = fragment.replace('{route_link}', '' if on_routes else '<p><a href="zhangjiajie-itinerary.html">Read routes, overnight bases and alternatives →</a></p>')
        s = re.sub(r'<section id="planner".*?</section>', lambda m: fragment, s, flags=re.S)
    review = re.search(r'Editorial review: (\d{1,2} [A-Za-z]+ \d{4})', s)
    assert review, f'{p.name}: missing editorial review date'
    dates[p.name] = datetime.strptime(review[1], '%d %B %Y').date().isoformat()
    page_url = URL + ('/' if p.name == 'index.html' else '/' + p.name)
    s = s.replace('<!-- HOST_META -->', '<link rel="canonical" href="'+escape(page_url, quote=True)+'">\n<meta property="og:url" content="'+escape(page_url, quote=True)+'">')
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    page = json.loads(match[1])
    page.pop('@context', None)
    page.update({'@id': page_url + '#webpage', 'url': page_url,
                 'dateModified': dates[p.name],
                 'author': {'@type': 'Organization', 'name': 'Zhangjiajie Field Notes'}})
    crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Start here', 'item': URL + '/'}]
    if p.name != 'index.html':
        crumbs.append({'@type': 'ListItem', 'position': 2, 'name': page['name'], 'item': page_url})
    graph = [page, {'@type': 'BreadcrumbList', '@id': page_url + '#breadcrumbs', 'itemListElement': crumbs}]
    page['breadcrumb'] = {'@id': page_url + '#breadcrumbs'}
    if p.name == 'index.html':
        graph.append({'@type': 'WebSite', '@id': URL + '/#website', 'name': 'Zhangjiajie Field Notes', 'url': URL + '/'})
    s = s[:match.start(1)] + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c') + s[match.end(1):]
    # Social crawlers cannot resolve a relative og:image, so it is made absolute here.
    s = s.replace('content="img/', 'content="'+escape(URL, quote=True)+'/img/')
    # Root source files intentionally have no guessed canonical; deployment injects it.
    (OUT/p.name).write_text(s, encoding='utf-8')
for name in ['assets', 'img', 'favicon.svg', '.nojekyll']:
    p=ROOT/name
    if p.is_dir(): shutil.copytree(p,OUT/name)
    elif p.exists(): shutil.copy2(p,OUT/name)
if (ROOT/'CNAME').exists(): shutil.copy2(ROOT/'CNAME',OUT/'CNAME')
pages=sorted(OUT.glob('*.html'))
(OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(URL+('/' if p.name=='index.html' else '/'+p.name))+'</loc><lastmod>'+dates[p.name]+'</lastmod></url>\n' for p in pages if p.name!='404.html')+'</urlset>\n')
(OUT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+URL+'/sitemap.xml\n')
print('Built',len(pages),'pages for',URL)
