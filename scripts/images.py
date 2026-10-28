#!/usr/bin/env python3
"""Create responsive WebP variants at build time, keeping original JPEG fallbacks.
Install Pillow from requirements-build.txt. Never upscale the credited originals.
"""
from pathlib import Path
from PIL import Image
import re
from io import BytesIO

def generate(folder):
    variants = {}
    for path in sorted(folder.glob('*.jpg')):
        with Image.open(path) as image:
            image = image.convert('RGB')
            widths = sorted({min(w, image.width) for w in (800, 1200, 1600)})
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
    def picture(match):
        tag = match[0]
        src = re.search(r'\bsrc="img/([^\"]+)"', tag)
        if not src or src[1] not in variants:
            return tag
        srcset = ', '.join(f'img/{name} {width}w' for name, width in variants[src[1]])
        return f'<picture><source type="image/webp" srcset="{srcset}" sizes="(max-width: 600px) 100vw, (max-width: 1024px) 75vw, 800px">{tag}</picture>'
    return re.sub(r'<img\b[^>]*>', picture, html)

if __name__ == '__main__':
    folder = Path(__file__).resolve().parents[1] / 'dist' / 'img'
    variants = generate(folder)
    print('Generated responsive variants for', len(variants), 'JPEG photographs')
