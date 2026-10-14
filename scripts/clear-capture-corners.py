#!/usr/bin/env python3
"""Make the white page background around Framer widget captures transparent.

framer.screenshot() renders on white, so rounded widgets get white corners that glare on the dark site.
Flood-fills near-white pixels from each image corner to alpha 0. Edits content/framer-captures/woven/widget-*.png
in place. Run with: uv run --with pillow python3 scripts/clear-capture-corners.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

CAPTURES = Path(__file__).resolve().parent.parent / "content" / "framer-captures" / "woven"
SENTINEL = (255, 0, 255, 0)  # fill colour, swapped to transparent afterwards


def clear(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        r, g, b, a = img.getpixel(xy)
        if a and min(r, g, b) > 235:  # only flood from a white corner
            ImageDraw.floodfill(img, xy, SENTINEL, thresh=40)
    img.putdata([(0, 0, 0, 0) if p == SENTINEL else p for p in img.get_flattened_data()])
    img.save(path)
    print(f"cleared {path.name}")


for p in sorted(CAPTURES.glob("widget-*.png")):
    clear(p)
