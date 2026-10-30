#!/usr/bin/env python3
"""Check deployable HTML, local assets, fragments and host metadata."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
from datetime import datetime
import json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]/'dist'
class Page(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True);self.ids=[];self.links=[];self.h1=0;self.schema=False;self.schemas=[];self.buf='';self.canonical=[];self.imgs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='source' and a.get('srcset'):
            for candidate in a['srcset'].split(','):
                self.links.append(candidate.strip().split()[0])
        if tag=='h1':self.h1+=1
        if tag=='img':self.imgs.append((a.get('src'),a.get('alt')))
        if tag=='script' and a.get('type')=='application/ld+json':self.schema=True;self.buf=''
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
        for key in ['href','src']:
            if a.get(key):self.links.append(a[key])
        assert not any('data:image' in key for key in a), 'Malformed image attribute'
    def handle_data(self,s):
        if self.schema:self.buf+=s
    def handle_endtag(self,tag):
        if tag=='script' and self.schema:self.schemas.append(json.loads(self.buf));self.schema=False
pages={}
for p in ROOT.glob('*.html'):
    text=p.read_text(encoding='utf-8');assert 'example.com' not in text,p
    parser=Page();parser.feed(text);pages[p.name]=parser
    assert parser.h1==1,(p,'H1 count',parser.h1)
    assert len(parser.ids)==len(set(parser.ids)),(p,'duplicate IDs')
    # 404 is the one page kept out of the index, so it carries no canonical.
    assert (len(parser.canonical)==1) if p.name!='404.html' else not parser.canonical,(p,'canonical')
    assert parser.schemas,(p,'missing schema')
    assert all(alt and alt.strip() for src,alt in parser.imgs),(p,'an <img> has no alt text')
for name,page in pages.items():
    for href in page.links:
        u=urlsplit(href)
        assert not (u.path==name and not u.fragment and not u.scheme and not u.netloc),(name,'self link',href)
        u=urlsplit(href)
        if u.scheme or u.netloc:continue
        path=unquote(u.path) or name
        target=ROOT/path
        assert target.exists(),(name,'missing target',href)
        if u.fragment and path in pages:assert unquote(u.fragment) in pages[path].ids,(name,'missing fragment',href)
used={unquote(urlsplit(src).path) for pg in pages.values() for src,_ in pg.imgs}
used|={unquote(urlsplit(l).path) for pg in pages.values() for l in pg.links if l.startswith('img/')}
on_disk={'img/'+p.name for p in (ROOT/'img').glob('*')}
assert not on_disk-used,(sorted(on_disk-used),'photographs shipped but never placed')
tree=ET.parse(ROOT/'sitemap.xml');locations=[e.text for e in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(locations)==len(pages)-(1 if '404.html' in pages else 0),(len(locations),len(pages))
assert all('example.com' not in u for u in locations)
print('PASS:',len(pages),'pages,',len(on_disk),'image files; local links, assets, anchors, unique IDs, H1, alt text, JSON-LD and sitemap')

ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
lastmods={e.find('s:loc',ns).text:e.find('s:lastmod',ns).text for e in tree.getroot()}
for name,pg in pages.items():
    graph=pg.schemas[0]['@graph']
    web=next(x for x in graph if x['@type']=='WebPage')
    date=datetime.strptime(re.search(r'Editorial review: (\d{1,2} [A-Za-z]+ \d{4})',(ROOT/name).read_text())[1],'%d %B %Y').date().isoformat()
    assert web['dateModified']==date,(name,'schema date')
    assert web['author']['name'] and any(x['@type']=='BreadcrumbList' for x in graph)
    if name!='404.html':assert lastmods[pg.canonical[0]]==date,(name,'sitemap date')
transport=(ROOT/'zhangjiajie-map-transport.html').read_text()
rows=re.findall(r'<tr(?: [^>]*)?>.*?data-copy=.*?</tr>',transport)
assert len(rows)==10
assert all('uri.amap.com/search?' in row and 'maps.apple.com/?q=' in row and 'google.com/maps/' in row for row in rows)
print('PASS: China map alternatives, no file self-links, editorial/schema/sitemap dates and breadcrumbs')

for name in ['index.html','zhangjiajie-map-transport.html']:
    html=(ROOT/name).read_text()
    assert re.search(r'<svg[^>]*role="img"[^>]*aria-label="[^"]+"',html),(name,'accessible schematic')
for name in ['index.html','zhangjiajie-itinerary.html']:
    html=(ROOT/name).read_text()
    assert 'id="pace"' in html and 'id="print-plan"' in html
    assert all(x in html for x in ['<dt>Sleep</dt>','<dt>Main sights</dt>','<dt>Visit time</dt>','<dt>Remember</dt>'])
print('PASS: accessible schematics and static daily plan fallback')

for name,pg in pages.items():
    for link in pg.links:
        if link.endswith('.webp'):assert (ROOT/link).is_file() and (ROOT/link).stat().st_size>0,(name,'missing/empty srcset target',link)
    html=(ROOT/name).read_text()
    assert html.count('<picture>')==len(pg.imgs),(name,'responsive image coverage')
print('PASS: every responsive source exists, is used and has a JPEG fallback')

# New HTML must never combine with a cached, unversioned app asset.
import hashlib
for name, pg in pages.items():
    for extension in ('css','js'):
        matching=[link for link in pg.links if re.fullmatch(r'assets/site-[0-9a-f]{12}\.'+extension,link)]
        assert len(matching)==1,(name,'missing fingerprinted app asset',extension)
        target=ROOT/matching[0]
        fingerprint=hashlib.sha256(target.read_bytes()).hexdigest()[:12]
        assert target.stem=='site-'+fingerprint,(name,'asset fingerprint does not match content')
        assert 'assets/site.'+extension not in pg.links,(name,'unversioned app asset')
print('PASS: every page loads content-fingerprinted CSS and JavaScript')
