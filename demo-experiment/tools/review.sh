#!/usr/bin/env bash
# Spec check + contact sheet (every 0.5 s) of a rendered film: tools/review.sh <mp4> <out.jpg>
set -e
f=$1; o=${2:-/tmp/sheet.jpg}
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -show_entries format=duration -of compact "$f"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of compact "$f"
ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' '
[ "$o" = /dev/null ] || ffmpeg -hide_banner -loglevel error -y -i "$f" -vf "fps=2,scale=480:-1,tile=5x3" -frames:v 1 "$o"
echo "$o"
