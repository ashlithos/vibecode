#!/usr/bin/env bash
# One-time setup: clone the mg-styles-15 harness + audio toolkit next to this folder and link this folder into it,
# because harness/render.mjs serves pages from its own repository root.
set -euo pipefail
DUX=$(cd "$(dirname "$0")/.." && pwd)
MG_ROOT=${MG_ROOT:-$(dirname "$DUX")/../mg-styles-15}
[ -d "$MG_ROOT" ] || git clone https://github.com/Vincentwei1021/mg-styles-15 "$MG_ROOT"
MG_ROOT=$(cd "$MG_ROOT" && pwd)
(cd "$MG_ROOT" && npm install --no-audit --no-fund)
pip install numpy scipy soundfile numba pedalboard pyloudnorm matplotlib pillow fonttools
ln -sfn "$DUX" "$MG_ROOT/dux"
echo "linked $DUX -> $MG_ROOT/dux ; now: export MG_ROOT=$MG_ROOT && source tools/env.sh"
