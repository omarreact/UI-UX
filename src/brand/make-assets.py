#!/usr/bin/env python3
"""Render first-party Softly brand exports from SVG masters.
Build-tool dependency only; no frontend CDN or runtime dependency."""
from pathlib import Path
import cairosvg

root = Path(__file__).resolve().parents[2]
brand = root / "src" / "brand"
out = root / "assets" / "brand"
out.mkdir(parents=True, exist_ok=True)

renders = [
    ("social-card.svg", "social-card.png", 1200, 630),
    ("app-icon.svg", "icon-192.png", 192, 192),
    ("app-icon.svg", "icon-512.png", 512, 512),
    ("app-icon.svg", "apple-touch-icon.png", 180, 180),
]
for source, target, width, height in renders:
    cairosvg.svg2png(
        url=str(brand / source),
        write_to=str(out / target),
        output_width=width,
        output_height=height,
    )
    print(f"Rendered {target} ({width}x{height})")
