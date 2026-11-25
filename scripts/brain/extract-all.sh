#!/bin/zsh
# Draft evidence for every bundle in brain-inbox/bundles with agy (read-only plan mode), N at a time.
# Skips bundles that already have a valid draft. Log: brain-inbox/drafts/extract.log
set -u
zmodload zsh/parameter
cd "${0:A:h}/../.."
N=${1:-4}
mkdir -p brain-inbox/drafts
LOG=brain-inbox/drafts/extract.log
: > "$LOG"

one() {
  local b=$1 f=brain-inbox/drafts/$1.json
  [[ -s $f ]] && return 0
  agy -p "Read scripts/brain/extract-prompt.md and follow it exactly. The taxonomy file is content/brain/taxonomy.ts. The bundle file is brain-inbox/bundles/$b.txt. Do not edit or create any files. Print only the JSON object the prompt asks for." \
    --mode plan --print-timeout 900s > "$f.tmp" 2>> "$LOG.err"
  if python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$f.tmp" 2>/dev/null; then
    mv "$f.tmp" "$f"; print "ok $b" >> "$LOG"
  else
    print "FAIL $b" >> "$LOG"
  fi
}

for p in brain-inbox/bundles/*.txt; do
  one "${${p:t}%.txt}" &
  # ${jobstates} lives in the current shell; $(jobs -r) would run in a subshell and always see 0.
  while (( ${#jobstates} >= N )); do sleep 2; done
done
wait
print "done: $(grep -c '^ok' "$LOG") ok, $(grep -c '^FAIL' "$LOG") failed, $(ls brain-inbox/drafts/*.json | wc -l) drafts total" | tee -a "$LOG"
