#!/usr/bin/env python3
"""Replace text-fragment runs in visual Framer sections with real visual blocks.

Framer built some sections (design systems, stat tiles, live HMI widgets) from components, so the text importer
only sees loose labels ("Gray 100", "#F2F2F7", "6.4s"). This rewrites those sections into `figure`, `metrics` and
`widgets` blocks using captures taken from the Framer project (content/framer-captures/<slug>/).

Run after scripts/import-framer.py (which calls it automatically).
"""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STUDIES = ROOT / "content" / "case-studies"
CAPTURES = ROOT / "content" / "framer-captures"
PUBLIC = ROOT / "public" / "work"

WIDGETS = [  # (capture slug, Framer component display name)
    ("parking-assist", "Parking Assist"),
    ("drive-mode-selector", "Drive Mode Selector"),
    ("speed-gear-hud", "Speed & Gear HUD"),
    ("coaching-alert", "Coaching Alert"),
    ("climate-dial", "Climate Dial"),
    ("now-playing", "Now Playing"),
]


def publish(slug: str, capture: str) -> str:
    """Copy a capture into public/work/<slug>/ and return its public path."""
    dest = PUBLIC / slug / capture
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(CAPTURES / slug / capture, dest)
    return f"/work/{slug}/{capture}"


VISUAL = {"figure", "metrics", "widgets"}


def section(study: dict, label: str) -> dict | None:
    """The labelled section, or None if it was already converted (keeps the script idempotent)."""
    s = next(s for s in study["sections"] if s["label"] == label)
    return None if any(b["type"] in VISUAL for b in s["blocks"]) else s


def sentences(blocks: list[dict], limit: int = 2) -> list[dict]:
    """The leading heading/paragraph blocks that are real prose, not component labels."""
    out = []
    for b in blocks:
        if b["type"] in ("heading", "paragraph") and len(b["text"]) > 30:
            out.append(b)
            if len(out) == limit:
                break
    return out


def spec_card(study: dict, slug: str, title: str) -> None:
    s = section(study, "Design System")
    if s is None:
        return
    s["blocks"] = sentences(s["blocks"]) + [{
        "type": "figure",
        "image": {"src": publish(slug, "design-system.png"), "alt": f"{title} design system: components and colors"},
        "wide": True,
    }]


def metrics(study: dict, label: str) -> None:
    s = section(study, label)
    if s is None:
        return
    intro = sentences(s["blocks"])
    rest = [b for b in s["blocks"] if b not in intro]
    items = [{"value": rest[i]["text"], "label": rest[i + 1]["text"]}
             for i in range(0, len(rest) - 1, 2)
             if rest[i]["type"] == "heading" and rest[i + 1]["type"] == "paragraph"]
    s["blocks"] = intro + [{"type": "metrics", "items": items}]


def woven(study: dict) -> None:
    s = section(study, "Design System")
    if s is None:
        return
    by_text = {b.get("text", ""): b for b in s["blocks"]}

    def find(prefix: str) -> dict:
        return next(b for t, b in by_text.items() if t.startswith(prefix))

    raw = json.loads((CAPTURES / "woven" / "widgets.json").read_text())
    items = []
    for capture, name in WIDGETS:
        texts = raw[name]["variants"][0]["texts"]
        swiftui, flutter, tailwind = texts[-3:]
        items.append({
            "title": texts[0],
            "subtitle": texts[1],
            "preview": {"src": publish("woven", f"widget-{capture}.png"), "alt": f"{texts[0]} widget: {texts[1]}"},
            "code": {"swiftui": swiftui, "flutter": flutter, "tailwind": tailwind},
        })

    def fig(capture: str, alt: str, caption: str | None = None) -> dict:
        block = {"type": "figure", "image": {"src": publish("woven", capture), "alt": alt}, "wide": True}
        if caption:
            block["caption"] = caption
        return block

    s["blocks"] = [
        find("A small token system"),
        {"type": "heading", "text": "Implementation"},
        {"type": "widgets", "items": items},
        find("Each live component"),
        find("A restrained palette"),
        fig("ds-colors.png", "Coaching HMI color tokens: system grays, brand blue, status colors"),
        find("A screen-legible type scale"),
        fig("ds-text-spacing.png", "Coaching HMI type scale and spacing scale", find("Consistent spatial rhythm")["text"]),
        find("Rounded surfaces"),
        fig("ds-corner-radii.png", "Coaching HMI corner radius tokens"),
    ]


def main() -> None:
    def edit(slug: str, fn) -> None:
        path = STUDIES / f"{slug}.json"
        study = json.loads(path.read_text())
        fn(study)
        path.write_text(json.dumps(study, indent=2, ensure_ascii=False) + "\n")
        print(f"visual blocks: {slug}")

    edit("drive-coach-ios", lambda s: spec_card(s, "drive-coach-ios", "Drive Coach iOS"))
    edit("fleet-co-pilot", lambda s: (spec_card(s, "fleet-co-pilot", "Fleet Co-Pilot"), metrics(s, "Live Telemetry")))
    edit("fleet-dashboard", lambda s: (spec_card(s, "fleet-dashboard", "Fleet Dashboard"), metrics(s, "Team Wins")))
    edit("woven", woven)


if __name__ == "__main__":
    main()
