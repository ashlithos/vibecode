"""Find the exact moments things change in a screen recording, so camera moves can land on them.

  python3 beats.py recording.mp4 START DUR NAME=X,Y [NAME=X,Y ...] [--fps 25]

Samples each watched pixel (source coordinates) every frame and prints the time whenever its color
changes noticeably, e.g. when a banner appears, a toast shows, or a new tab lands:

  python3 beats.py rec.mp4 4.6 1.4 banner=300,76 newtab=1030,1119 toast=760,1062
  5.36  newtab  (255,255,255) -> (26,96,219)
"""
import subprocess
import sys

from PIL import Image


def main(argv):
    fps = 25
    if "--fps" in argv:
        i = argv.index("--fps")
        fps = int(argv[i + 1])
        argv = argv[:i] + argv[i + 2:]
    path, start, dur, *points = argv
    watch = {}
    for p in points:
        name, xy = p.split("=")
        x, y = xy.split(",")
        watch[name] = (int(x), int(y))
    w, h = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                    "stream=width,height", "-of", "csv=p=0", path], text=True).strip().split(",")[:2]
    w, h = int(w), int(h)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", start, "-t", dur, "-i", path, "-vf", f"fps={fps}",
                             "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    prev, n = {}, 0
    while True:
        buf = proc.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        im = Image.frombytes("RGB", (w, h), buf)
        t = float(start) + n / fps
        for name, xy in watch.items():
            c = im.getpixel(xy)
            if name in prev and sum(abs(a - b) for a, b in zip(c, prev[name])) > 60:
                print(f"{t:6.2f}  {name:10s} {prev[name]} -> {c}")
            prev[name] = c
        n += 1
    proc.wait()


if __name__ == "__main__":
    main(sys.argv[1:])
