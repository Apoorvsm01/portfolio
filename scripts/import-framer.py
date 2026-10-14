#!/usr/bin/env python3
"""Convert a Framer page export (/tmp/framer-export/<slug>.json) into typed case-study JSON.

Usage: python3 scripts/import-framer.py [export_dir]
Writes content/case-studies/<slug>.json and downloads images to public/work/<slug>/.
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORT = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/framer-export")
SLUGS = [
    "woven", "drive-coach-ios", "fleet-co-pilot", "fleet-dashboard", "syncare-ai-health",
    "spatialshowroom", "sitelens", "omniabrowser", "how2to",
]
# Framer page metadata titles are generic ("Apoorv's Portfolio") on these pages.
TITLE_OVERRIDES = {
    "how2to": "How2To", "omniabrowser": "Omnia Browser", "spatialshowroom": "Spatial Showroom",
    "syncare-ai-health": "SynCare", "sitelens": "SiteLens",
}
# Corrections to Framer content. Drive Coach iOS was built at Woven by Toyota.
EXTRA_FACTS = {
    "drive-coach-ios": [
        (0, {"label": "Company", "value": "Woven by Toyota"}),
        (None, {"label": "Audience", "value": "Technicians and new drivers (B2B + B2C)"}),
    ],
}
FACT_LABELS = {"platforms", "category", "role", "project duration", "duration", "timeline", "team", "tools"}
# Framer code components / decoration that can't be ported as content.
IGNORED_COMPONENTS = {"Loader", "Scroll Down Arrow", "Dot Slider", "Ticker", "Center Text", "Primary Button", "Star Rating"}


def download(url: str, dest_dir: Path, index: int) -> str:
    ext = Path(url.split("?")[0]).suffix or ".png"
    dest = dest_dir / f"{index:02d}{ext}"
    if not dest.exists():
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
    return "/" + str(dest.relative_to(ROOT / "public"))


def split_title(meta_title: str) -> str:
    return re.split(r"\s+[—|]\s+", meta_title or "")[0].strip()


def convert(slug: str) -> dict:
    data = json.loads((EXPORT / f"{slug}.json").read_text())
    meta = data.get("metadata") or {}
    img_dir = ROOT / "public" / "work" / slug
    img_dir.mkdir(parents=True, exist_ok=True)

    study = {
        "slug": slug,
        "title": TITLE_OVERRIDES.get(slug) or split_title(meta.get("title", "")) or slug,
        "description": meta.get("description", ""),
        "tags": [],
        "hmw": "",
        "facts": [],
        "prototype": None,
        "heroImages": [],
        "sections": [],
        "unportedComponents": [],
    }
    section = None
    awaiting_hmw = False
    image_count = 0
    seen_images = set()
    seen_videos = set()

    def current():
        nonlocal section
        if section is None:
            section = {"label": "", "blocks": []}
            study["sections"].append(section)
        return section

    for b in data["blocks"]:
        kind = b["kind"]
        if kind == "component":
            name, c = b["name"], b["controls"]
            if name in ("Header Tag", "Primary Tag") and c.get("title"):
                if c["title"] in study["tags"]:
                    continue
                study["tags"].append(c["title"])
            elif name == "Highlighter Tag":
                title = c.get("title", "")
                if title.lower().startswith("how might we"):
                    awaiting_hmw = True
                else:
                    section = {"label": title, "blocks": []}
                    study["sections"].append(section)
            elif name == "Text Card":
                card = {"label": c.get("heading", ""), "value": c.get("bodyText", "")}
                if card["label"].strip().lower() in FACT_LABELS:
                    study["facts"].append(card)
                else:
                    blocks = current()["blocks"]
                    if blocks and blocks[-1]["type"] == "cards":
                        blocks[-1]["cards"].append(card)
                    else:
                        blocks.append({"type": "cards", "cards": [card]})
            elif name == "Embed" and c.get("uRL"):
                if study["prototype"] is None:
                    study["prototype"] = {"embed": c["uRL"], "link": None}
                else:
                    current()["blocks"].append({"type": "embed", "src": c["uRL"]})
            elif name == "Vimeo" and c.get("uRL"):
                vid = re.search(r"vimeo\.com/(\d+)", c["uRL"])
                if vid and vid.group(1) not in seen_videos:
                    seen_videos.add(vid.group(1))
                    current()["blocks"].append({"type": "video", "vimeoId": vid.group(1)})
            elif name not in IGNORED_COMPONENTS:
                study["unportedComponents"].append(name)
            continue
        if kind == "link":
            href = b["href"]["href"] if isinstance(b["href"], dict) else b["href"]
            if study["prototype"] is not None and not study["prototype"]["link"] and href.startswith("http"):
                study["prototype"]["link"] = href
            continue
        if kind == "image":
            if b["src"] in seen_images:
                continue
            seen_images.add(b["src"])
            image_count += 1
            img = {"src": download(b["src"], img_dir, image_count), "alt": b["alt"]}
            if not study["sections"] and not study["facts"]:
                study["heroImages"].append(img)
            elif not study["sections"]:
                study["heroImages"].append(img)
            else:
                blocks = current()["blocks"]
                if blocks and blocks[-1]["type"] == "images":
                    blocks[-1]["images"].append(img)
                else:
                    blocks.append({"type": "images", "images": [img]})
            continue
        if kind == "list":
            current()["blocks"].append({"type": "list", "items": b["items"]})
            continue
        if kind == "text":
            text, tag = b["text"], b["tag"]
            if awaiting_hmw:
                study["hmw"] = text
                awaiting_hmw = False
            elif text == study["title"] or text.lower().startswith("view") and "prototype" in text.lower():
                continue
            elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
                current()["blocks"].append({"type": "heading", "text": text})
            else:
                current()["blocks"].append({"type": "paragraph", "text": text})

    study["tags"] = [t for t in study["tags"] if t.lower() != study["title"].lower()]
    for pos, fact in EXTRA_FACTS.get(slug, []):
        study["facts"].insert(len(study["facts"]) if pos is None else pos, fact)
    study["unportedComponents"] = sorted(set(study["unportedComponents"]))
    study["imageCount"] = image_count
    return study


def main() -> None:
    out = ROOT / "content" / "case-studies"
    out.mkdir(parents=True, exist_ok=True)
    for slug in SLUGS:
        study = convert(slug)
        (out / f"{slug}.json").write_text(json.dumps(study, indent=2, ensure_ascii=False) + "\n")
        print(f"{slug}: {len(study['sections'])} sections, {study['imageCount']} images, "
              f"unported={study['unportedComponents']}")


if __name__ == "__main__":
    main()
