#!/bin/sh
# Writes 1280px-wide WebP copies of project cover images to public/thumbs/ and rebuilds
# src/lib/card-thumbs.json, which getProjectCards() reads to serve the small copy on cards.
# The full-size originals stay for the case study pages.
#   scripts/card-thumbs.sh /work/woven/01.jpg /work/how2to/03.png ...
# With no arguments it re-encodes every cover listed in the current manifest.
set -e
cd "$(dirname "$0")/.."
[ $# -eq 0 ] && set -- $(node -e 'console.log(require("./src/lib/card-thumbs.json").join(" "))')
for src in "$@"; do
  out="public/thumbs${src%.*}.webp"
  mkdir -p "$(dirname "$out")"
  cwebp -quiet -q 80 -resize 1280 0 "public$src" -o "$out"
done
find public/thumbs -name '*.webp' | sort | node -e '
  const lines = require("fs").readFileSync(0, "utf8").trim().split("\n");
  const srcs = lines.map((p) => p.replace(/^public\/thumbs/, "").replace(/\.webp$/, ""));
  // Map each thumb back to its original, whatever its extension was.
  const fs = require("fs");
  const orig = srcs.map((s) => [".png", ".jpg", ".jpeg"].map((e) => s + e).find((f) => fs.existsSync("public" + f)));
  fs.writeFileSync("src/lib/card-thumbs.json", JSON.stringify(orig.filter(Boolean), null, 2) + "\n");
'
