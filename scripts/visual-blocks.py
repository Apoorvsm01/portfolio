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


VISUAL = {"figure", "metrics", "widgets", "bento"}

# The process section of each study becomes a bento grid: one tile per heading. Tile text comes from
# content/bento-summaries.json ({slug: {title: condensed}}); until a summary exists, the first sentence
# of the tile's own source text is used.
PROCESS_LABELS = ("Approach & Process", "Research Methods", "Process")
SUMMARIES = ROOT / "content" / "bento-summaries.json"

# Prototype frames hug the prototype: the hmi_ui Flutter app letterboxes itself to ~7:3.
PROTOTYPES = {
    "woven": {"aspect": "7 / 3", "link": "https://apoorvsm01.github.io/hmi_ui/drive_coach"},  # Framer linked /fleet by mistake
    "fleet-co-pilot": {"aspect": "7 / 3"},
    "fleet-dashboard": {"aspect": "16 / 10"},
}


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
        # The captures include their own label and heading, so the heading text becomes alt text, not a
        # separate HTML heading (which rendered the same sentence twice).
        fig("ds-colors.png", "Color tokens. " + find("A restrained palette")["text"]),
        fig("ds-text-spacing.png", "Type and spacing scales. " + find("A screen-legible type scale")["text"] + " "
            + find("Consistent spatial rhythm")["text"]),
        fig("ds-corner-radii.png", "Corner radius tokens. " + find("Rounded surfaces")["text"]),
    ]


def first_sentence(blocks: list[dict]) -> str:
    for b in blocks:
        text = b.get("text") or (b.get("items") or [""])[0]
        if text:
            end = text.find(". ")
            return text if end == -1 else text[: end + 1]
    return ""


def bento(study: dict) -> None:
    s = next((x for x in study["sections"] if x["label"] in PROCESS_LABELS), None)
    if s is None or any(b["type"] in VISUAL for b in s["blocks"]):
        return
    summaries = json.loads(SUMMARIES.read_text()).get(study["slug"], {}) if SUMMARIES.exists() else {}
    tiles, trailing = [], []
    for b in s["blocks"]:
        if b["type"] == "heading":
            tiles.append({"title": b["text"], "source": []})
        elif tiles and b["type"] in ("paragraph", "list"):
            tiles[-1]["source"].append(b)
        else:
            trailing.append(b)  # e.g. an image after the last tile stays below the grid
    for t in tiles:
        t["condensed"] = summaries.get(t["title"]) or first_sentence(t["source"])
    s["blocks"] = [{"type": "bento", "items": tiles}] + trailing


def prototype(study: dict) -> None:
    extra = PROTOTYPES.get(study["slug"])
    if extra and study.get("prototype"):
        study["prototype"].update(extra)


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
    for path in sorted(STUDIES.glob("*.json")):
        edit(path.stem, lambda s: (bento(s), prototype(s)))


if __name__ == "__main__":
    main()
