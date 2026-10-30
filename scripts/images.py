#!/usr/bin/env python3
"""Create responsive WebP variants at build time, keeping original JPEG fallbacks.
Install Pillow from requirements-build.txt. Never upscale the credited originals.
"""
from pathlib import Path
from PIL import Image
from html.parser import HTMLParser
from io import BytesIO

def generate(folder):
    variants = {}
    for path in sorted(folder.glob('*.jpg')):
        with Image.open(path) as image:
            image = image.convert('RGB')
            widths = sorted({min(w, image.width) for w in (320, 480, 800, 1200, 1600)})
            entries = []
            for width in widths:
                height = round(image.height * width / image.width)
                target = path.with_name(f'{path.stem}-{width}.webp')
                buffer = BytesIO()
                image.resize((width, height), Image.Resampling.LANCZOS).save(buffer, 'WEBP', quality=65, method=6)
                target.write_bytes(buffer.getvalue())
                entries.append((target.name, width))
            variants[path.name] = entries
    return variants

def responsive(html, variants):
    # Choose sizes from actual layout ancestors, not filename: a photograph can
    # be a card in one page and a full-width editorial split in another.
    class Pictures(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=False)
            self.stack = []
            self.edits = []
            self.offsets = [0]
            for line in html.splitlines(keepends=True):
                self.offsets.append(self.offsets[-1] + len(line))

        def handle_starttag(self, tag, attrs):
            classes = {c for _, cs in self.stack for c in cs}
            if tag == 'img':
                a = dict(attrs)
                name = a.get('src', '').removeprefix('img/')
                if name in variants:
                    if 'home-hero' in classes:
                        sizes = '(max-width: 760px) calc(100vw - 40px), (max-width: 1080px) calc(40.48vw - 35.62px), 402px'
                    elif 'rail' in classes:
                        sizes = '(max-width: 520px) calc(50vw - 28px), (max-width: 900px) calc(33.333vw - 29.333px), (max-width: 1080px) calc(16.667vw - 21px), 159px'
                    elif 'card' in classes:
                        sizes = '(max-width: 760px) calc(100vw - 42px), (max-width: 1080px) calc(33.333vw - 31.333px), 329px'
                    elif 'split' in classes:
                        sizes = '(max-width: 760px) 100vw, 50vw'
                    else:
                        sizes = '(max-width: 760px) calc(100vw - 40px), (max-width: 856px) calc(100vw - 56px), 800px'
                    srcset = ', '.join(f'img/{file} {width}w' for file, width in variants[name])
                    original = self.get_starttag_text()
                    replacement = f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}">{original}</picture>'
                    line, column = self.getpos()
                    pos = self.offsets[line - 1] + column
                    self.edits.append((pos, pos + len(original), replacement))
            if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
                self.stack.append((tag, set(dict(attrs).get('class', '').split())))

        def handle_endtag(self, tag):
            for index in range(len(self.stack) - 1, -1, -1):
                if self.stack[index][0] == tag:
                    del self.stack[index:]
                    break

    parser = Pictures()
    parser.feed(html)
    for start, end, replacement in reversed(parser.edits):
        html = html[:start] + replacement + html[end:]
    return html

if __name__ == '__main__':
    folder = Path(__file__).resolve().parents[1] / 'dist' / 'img'
    variants = generate(folder)
    print('Generated responsive variants for', len(variants), 'JPEG photographs')
