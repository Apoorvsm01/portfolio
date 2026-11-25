#!/bin/zsh
# Convert each document in brain-inbox/manifest.txt (paths relative to ~/Library/CloudStorage)
# to plain text under brain-inbox/text/, mirroring the folder layout. Skips files already converted.
set -u
ROOT=~/Library/CloudStorage
OUT=brain-inbox/text
while IFS= read -r rel; do
  src="$ROOT/$rel"; dst="$OUT/${rel%.*}.txt"
  [[ -s "$dst" ]] && continue
  mkdir -p "${dst:h}"
  case "${rel:l}" in
    *.pdf) pdftotext -layout -q "$src" "$dst" ;;
    *.docx) textutil -convert txt -output "$dst" "$src" 2>/dev/null ;;
    *.pptx|*.xlsx) unzip -p "$src" 'ppt/slides/*.xml' 'xl/sharedStrings.xml' 2>/dev/null \
                     | sed -e 's/<[^>]*>/ /g' -e 's/  */ /g' > "$dst" ;;
    *.md|*.celtx) cp "$src" "$dst" 2>/dev/null ;;
  esac
  [[ -s "$dst" ]] || { rm -f "$dst"; print -r -- "$rel" >> brain-inbox/failed.txt; }
done < brain-inbox/manifest.txt
print "done: $(find $OUT -name '*.txt' | wc -l) converted, $(wc -l < brain-inbox/failed.txt 2>/dev/null || echo 0) failed"
