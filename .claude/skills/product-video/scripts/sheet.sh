#!/usr/bin/env bash
# Contact sheet of a video with timestamps, for reading what happens when (and for reviewing a render).
#   sheet.sh VIDEO OUT.png [START] [DUR] [FPS] [COLS]
#   sheet.sh rec.mp4 sheet.png 0 8 2 4     # every 0.5s for 8s, 4 columns
set -euo pipefail
V=$1; OUT=$2; START=${3:-0}; DUR=${4:-8}; FPS=${5:-2}; COLS=${6:-4}
TMP=$(mktemp -d)
ffmpeg -v error -y -ss "$START" -t "$DUR" -i "$V" \
  -vf "fps=$FPS,scale=600:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=20:fontcolor=red:box=1:boxcolor=white" \
  "$TMP/f%03d.png"
N=$(ls "$TMP" | wc -l)
ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -framerate 1 -i "$TMP/f%03d.png" -vf "tile=${COLS}x${ROWS}" -frames:v 1 "$OUT"
rm -rf "$TMP"
echo "wrote $OUT ($N frames; times are relative to START=$START)"
