#!/usr/bin/env python3
"""Write content/image-dims.json: {"/work/x/01.png": [width, height], ...} for every image under public/.

Used for <img width height> so the browser reserves space before images load (no layout shift).
Re-run after adding images: python3 scripts/image-dims.py
"""

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def dims(path: Path) -> list[int] | None:
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
                         capture_output=True, text=True).stdout
    vals = [round(float(line.split()[-1])) for line in out.splitlines() if "pixel" in line]
    return vals if len(vals) == 2 and all(vals) else None


def main() -> None:
    result = {}
    for path in sorted(PUBLIC.rglob("*")):
        if path.suffix.lower() in EXTS:
            d = dims(path)
            if d:
                result["/" + str(path.relative_to(PUBLIC))] = d
    (ROOT / "content" / "image-dims.json").write_text(json.dumps(result, indent=1) + "\n")
    print(f"{len(result)} images")


if __name__ == "__main__":
    main()
