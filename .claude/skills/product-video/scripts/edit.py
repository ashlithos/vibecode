"""Render a product video from a screen recording and a small JSON edit spec.

Every output frame is a sub-pixel crop of the source (bicubic), so camera moves are smooth, and each
move follows a real easing curve (CSS cubic-bezier). Zoom is interpolated in log space around the
move's fixed point, so it reads as one continuous zoom at an even perceived speed.

  python3 edit.py spec.json            # writes spec["out"]

Spec (all times in seconds; frames are [zoom, center_x, center_y] in source pixels):

{
  "source": "recording.mp4",
  "out": "public/videos/feature.mp4",
  "size": [1600, 1014],                 # keep the source aspect ratio
  "fps": 30,
  "clean_corners": 12,                  # optional: paint the recording's black bottom window corners white
  "frames": {"WIDE": [1, 899, 570], "HERO": [2.4, 900, 1000]},
  "takes": [
    {"start": 2.2, "dur": 4.7, "frame": "WIDE",
     "moves": [{"to": "HERO", "at": 2.55, "dur": 0.8, "curve": "emphasized"}],
     "spotlight": {"box": [0, 0, 1600, 780], "at": 3.45, "dur": 0.45, "alpha": 0.6},
     "hold": 0.6},                      # freeze the last frame this long
    {"start": 9.4, "dur": 5.2, "frame": "HERO", "length": 7.0,   # length > dur: keep the last frame
     "moves": [{"to": "MENU", "at": 0.5, "dur": 0.9}, {"to": "WIDE", "at": 5.8, "dur": 0.9}]}
  ],
  "dissolve": 0.4,                      # eased cross-dissolve between takes
  "crf": 20
}

Curves: "emphasized" (0.2, 0, 0, 1) for camera moves, "decelerate" (0.05, 0.7, 0.1, 1) for things
arriving (the spotlight), "accelerate" (0.3, 0, 0.8, 0.15) for things leaving, "linear", or any
[x1, y1, x2, y2].
"""
import json
import math
import subprocess
import sys

from PIL import Image, ImageDraw

CURVES = {
    "emphasized": (0.2, 0.0, 0.0, 1.0),   # Material 3 emphasized: brisk start, long soft settle
    "decelerate": (0.05, 0.7, 0.1, 1.0),  # Material 3 emphasized decelerate: arriving elements
    "accelerate": (0.3, 0.0, 0.8, 0.15),  # Material 3 emphasized accelerate: leaving elements
    "linear": (0.0, 0.0, 1.0, 1.0),
}


def bezier(p, x):
    """y for a CSS cubic-bezier(p) at progress x (clamped to 0..1)."""
    if x <= 0 or x >= 1:
        return min(max(x, 0.0), 1.0)
    x1, y1, x2, y2 = p
    cx, bx = 3 * x1, 3 * (x2 - x1) - 3 * x1
    ax = 1 - cx - bx
    cy, by = 3 * y1, 3 * (y2 - y1) - 3 * y1
    ay = 1 - cy - by
    t = x
    for _ in range(12):  # Newton steps for t where X(t) = x
        xt = ((ax * t + bx) * t + cx) * t - x
        d = (3 * ax * t + 2 * bx) * t + cx
        if abs(xt) < 1e-7 or d == 0:
            break
        t -= xt / d
    t = min(max(t, 0.0), 1.0)
    return ((ay * t + by) * t + cy) * t


def curve(name):
    return CURVES[name] if isinstance(name, str) else tuple(name)


def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height", "-of", "csv=p=0", path], text=True)
    w, h = out.strip().split(",")[:2]
    return int(w), int(h)


def main(spec_path):
    spec = json.load(open(spec_path))
    src = spec["source"]
    SW, SH = probe(src)
    OW, OH = spec.get("size", [1600, round(1600 * SH / SW / 2) * 2])
    FPS = spec.get("fps", 30)
    corner = spec.get("clean_corners", 0)

    def rect(z, cx, cy):
        w, h = SW / z, SH / z
        return (min(max(cx - w / 2, 0), SW - w), min(max(cy - h / 2, 0), SH - h), w, h)

    frames = {k: rect(*v) for k, v in spec["frames"].items()}

    def zoom_between(r0, r1, e):
        x0, y0, w0, h0 = r0
        x1, y1, w1, h1 = r1
        w = math.exp(math.log(w0) + (math.log(w1) - math.log(w0)) * e)
        h = w * h0 / w0
        if abs(w0 - w1) < 1e-6:  # pure pan
            x, y = x0 + (x1 - x0) * e, y0 + (y1 - y0) * e
        else:  # zoom about the point both boxes share
            px = (x1 * w0 - x0 * w1) / (w0 - w1)
            py = (y1 * h0 - y0 * h1) / (h0 - h1)
            x, y = px - (px - x0) * w / w0, py - (py - y0) * h / h0
        return (min(max(x, 0), SW - w), min(max(y, 0), SH - h), w, h)

    def read(start, dur):
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", src,
                              "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                             stdout=subprocess.PIPE)
        size = SW * SH * 3
        while True:
            buf = p.stdout.read(size)
            if len(buf) < size:
                break
            im = Image.frombytes("RGB", (SW, SH), buf)
            if corner:
                d = ImageDraw.Draw(im)
                d.rectangle([0, SH - corner, corner - 1, SH - 1], fill="white")
                d.rectangle([SW - corner, SH - corner, SW - 1, SH - 1], fill="white")
            yield im
        p.wait()

    def shot(im, r):
        x, y, w, h = r
        return im.transform((OW, OH), Image.Transform.EXTENT, (x, y, x + w, y + h), Image.Resampling.BICUBIC)

    def spotlight(im, s, a):
        if a <= 0:
            return im
        x0, y0, x1, y1 = s["box"]
        region = im.crop((x0, y0, x1, y1))
        im = im.copy()
        im.paste(Image.blend(region, Image.new("RGB", region.size, s.get("color", "white")), a), (x0, y0))
        return im

    def ramp(t, at, dur, c):
        return bezier(curve(c), (t - at) / dur)

    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{OW}x{OH}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
                            "-preset", "slow", "-crf", str(spec.get("crf", 20)), "-pix_fmt", "yuv420p",
                            "-movflags", "+faststart", spec["out"]], stdin=subprocess.PIPE)
    X = int(spec.get("dissolve", 0.4) * FPS)
    tail = []  # last X frames of the previous take, for the dissolve

    for n, take in enumerate(spec["takes"]):
        length = take.get("length", take["dur"])
        source = read(take["start"], take["dur"])
        im, f, out = None, None, []
        for i in range(int(length * FPS)):
            im = next(source, im)  # past the end of the take, keep the last frame
            if im is None:
                break
            t = i / FPS
            r = frames[take["frame"]]
            for m in take.get("moves", []):
                r = zoom_between(r, frames[m["to"]], ramp(t, m["at"], m["dur"], m.get("curve", "emphasized")))
            f = shot(im, r)
            if "spotlight" in take:
                s = take["spotlight"]
                f = spotlight(f, s, s.get("alpha", 0.6) * ramp(t, s["at"], s["dur"], s.get("curve", "decelerate")))
            if n > 0 and i < len(tail):  # ease in from the previous take
                f = Image.blend(tail[i], f, bezier(CURVES["emphasized"], (i + 1) / (len(tail) + 1)))
            out.append(f)
            if len(out) > X:
                enc.stdin.write(out.pop(0).tobytes())
        out += [f] * int(take.get("hold", 0) * FPS)
        last = n == len(spec["takes"]) - 1
        while len(out) > (0 if last else X):
            enc.stdin.write(out.pop(0).tobytes())
        tail = out  # the next take dissolves over these, so they're written there

    enc.stdin.close()
    enc.wait()


if __name__ == "__main__":
    main(sys.argv[1])
