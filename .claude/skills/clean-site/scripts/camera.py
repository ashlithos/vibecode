"""Smooth zoom-and-pan "camera" for screen recordings (start wide, zoom in on the action, zoom out).

Writes an ffmpeg filter script, then you render with it:

  python3 camera.py KEYS WIDTH HEIGHT OUT.txt [PREFIX]
  ffmpeg -i in.mp4 -filter_script:v OUT.txt -an -c:v libx264 -preset slow -crf 25 \
         -pix_fmt yuv420p -movflags +faststart out.mp4

KEYS   JSON list of [seconds, zoom, center_x, center_y]; center in source pixels. Values ease
       between keys (cosine). zoom 1 = whole frame; ~1.6 on a 1700px recording = 1:1 sharpness
       in a 1000px output.
WIDTH/HEIGHT  output size; keep the source aspect ratio (e.g. 1000x592 for 1706x1010).
PREFIX optional filters to run first, e.g. "tpad=stop_mode=clone:stop_duration=1.5," to hold
       the last frame (end on the payoff).

Example (wide → chart → claim → hold → wide):
  python3 camera.py '[[0,1,853,505],[0.7,1,853,505],[1.3,1.64,857,600],[2.9,1.64,857,600],
                      [3.3,1.64,857,470],[5,1.64,857,470],[5.5,1.64,857,368],[8,1.64,857,368],
                      [8.7,1,853,505]]' 1000 592 cam.txt "tpad=stop_mode=clone:stop_duration=1.5,"

Tips: keep zoomed-in windows clear of the app header (it should only appear in the wide shots);
check a few frames with  ffmpeg -i out.mp4 -vf "select='eq(n,30)+eq(n,120)',tile=2x1" -frames:v 1 check.png
"""
import sys, json

keys, W, H, out = json.loads(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
pre = sys.argv[5] if len(sys.argv) > 5 else ""
UP = 2  # upscale first so the pan doesn't jitter on whole-pixel steps

def interp(i):
    t = "(in/30)"
    e = str(keys[-1][i])
    for a, b in reversed(list(zip(keys, keys[1:]))):
        t0, v0, t1, v1 = a[0], a[i], b[0], b[i]
        seg = str(v0) if v0 == v1 else f"({v0}+({v1}-{v0})*(1-cos(PI*({t}-{t0})/({t1}-{t0})))/2)"
        e = f"if(lt({t},{t1}),{seg},{e})"
    return e

x = f"max(0,min(iw-iw/zoom,({interp(2)})*{UP}-iw/zoom/2))"
y = f"max(0,min(ih-ih/zoom,({interp(3)})*{UP}-ih/zoom/2))"
graph = (f"{pre}fps=30,scale=iw*{UP}:ih*{UP}:flags=lanczos,"
         f"zoompan=z='{interp(1)}':x='{x}':y='{y}':d=1:s={W}x{H}:fps=30")
open(out, "w").write(graph)
print(f"wrote {out}")
