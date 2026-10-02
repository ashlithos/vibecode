"""Contact sheet of a film's stills: python3 tools/sheet.py <film> [cols] [out.jpg]"""
import sys, glob, os
from PIL import Image, ImageDraw
film = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
d = os.path.join(os.path.dirname(__file__), '..', 'films', film, 'out', 'stills')
fs = sorted(glob.glob(os.path.join(d, 't*.png')))
W = 640; ims = []
for f in fs:
    im = Image.open(f).convert('RGB'); im = im.resize((W, int(W * im.height / im.width)))
    ImageDraw.Draw(im).text((8, 6), os.path.basename(f)[1:-4] + 's', fill=(255, 0, 255)); ims.append(im)
H = ims[0].height; rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (cols * W, rows * H), 'gray')
for i, im in enumerate(ims): sh.paste(im, ((i % cols) * W, (i // cols) * H))
out = sys.argv[3] if len(sys.argv) > 3 else f'/tmp/claude-0/-home-user-vibecode/e14ec304-9f0e-5357-b357-430793b78186/scratchpad/sheet_{film}.jpg'
sh.save(out, quality=85); print(out)
