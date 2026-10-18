#!/usr/bin/env bash
# Copy each film's render into out/data-ux-intro/, re-muxing its final audio.wav (so picture and mix always match),
# cut a poster at 5.0 s for the gallery, and print the spec check.
set -euo pipefail
DUX=$(cd "$(dirname "$0")/.." && pwd); OUT=$DUX/out/data-ux-intro
mkdir -p "$OUT/posters"
for d in "$DUX"/films/*/; do
  f=$(basename "$d"); v=$d/out/video.mp4; a=$d/out/audio.wav
  [ -f "$v" ] || { echo "missing $v"; continue; }
  ffmpeg -hide_banner -loglevel error -y -i "$v" -i "$a" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 \
    -t 7 -movflags +faststart "$OUT/$f.mp4"
  ffmpeg -hide_banner -loglevel error -y -ss 5.0 -i "$OUT/$f.mp4" -frames:v 1 -vf scale=960:-1 -q:v 3 "$OUT/posters/$f.jpg"
  echo "== $f"; "$DUX/tools/review.sh" "$OUT/$f.mp4" /dev/null 2>/dev/null | grep -v "^/dev/null" | tr '\n' ' '; echo
done
