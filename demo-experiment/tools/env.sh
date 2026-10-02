# source me: paths + Chrome flags for headless rendering in this container (CPU, SwiftShader)
export MG_ROOT=${MG_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && cd ../../mg-styles-15 2>/dev/null && pwd || echo /home/user/mg-styles-15)}
export DUX=${DUX:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
export MG_CHROME=${MG_CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)}
export MG_GPU_ARGS=${MG_GPU_ARGS:-"--no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader"}
stills() { (cd "$MG_ROOT" && timeout ${STILL_TIMEOUT:-240} node harness/render.mjs "dux/films/$1" --stills "$2" ${3:+--scale $3}); }
render() { (cd "$MG_ROOT" && node harness/render.mjs "dux/films/$1" --workers ${WORKERS:-3} --crf ${CRF:-18} --duration 7); }
