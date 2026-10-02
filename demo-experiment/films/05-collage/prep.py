"""Collage scraps for 05-collage (run once: python3 films/05-collage/prep.py).

Inputs (copied from mg-styles-15/demos/06-collage/assets/gen, all public domain / CC0):
  manicule.png — public-domain engraved pointing hand
Everything else is generated here (own work, CC0): stock-table newsprint, graph paper, ruler, the giant eye cut.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assets')
FONTS = os.path.join(HERE, '..', '..', 'fonts')
R = np.random.default_rng(1)


def torn_mask(w, h, poly, rough=7.0, seed=0):
    """Polygon → alpha mask with a torn/scissored edge (jittered, slightly blurred)."""
    rng = np.random.default_rng(seed)
    pts = []
    for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1]):
        n = max(2, int(np.hypot(x1 - x0, y1 - y0) / 6))
        for k in range(n):
            u = k / n
            pts.append((x0 + (x1 - x0) * u + rng.normal(0, rough * 0.5), y0 + (y1 - y0) * u + rng.normal(0, rough * 0.5)))
    m = Image.new('L', (w * 2, h * 2), 0)
    ImageDraw.Draw(m).polygon([(x * 2, y * 2) for x, y in pts], fill=255)
    return m.resize((w, h), Image.LANCZOS)


def with_rim(rgb, mask, rim=5, rim_col=(246, 242, 232), seed=0):
    """Paper scrap: the image inside, a fibrous white rim (torn paper core) around it."""
    big = mask.filter(ImageFilter.MaxFilter(rim * 2 + 1)).filter(ImageFilter.GaussianBlur(0.8))
    rng = np.random.default_rng(seed)
    fib = (rng.random((mask.height, mask.width)) * 255).astype(np.uint8)
    bigA = np.minimum(np.asarray(big, np.float32), 140 + 0.6 * fib.astype(np.float32))
    bigA = np.maximum(bigA, np.asarray(mask, np.float32))
    out = Image.new('RGBA', rgb.size, rim_col + (0,))
    out.putalpha(Image.fromarray(bigA.clip(0, 255).astype(np.uint8)))
    inner = rgb.convert('RGBA'); inner.putalpha(mask)
    out.alpha_composite(inner)
    return out


def halftone(gray, period=7, angle=45):
    """Mono halftone of a 0..1 gray array (1 = paper)."""
    h, w = gray.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (xx * np.cos(a) + yy * np.sin(a)) / period
    v = (-xx * np.sin(a) + yy * np.cos(a)) / period
    d = np.hypot(u - np.round(u), v - np.round(v)) * 2   # 0 at dot centre .. ~1.4
    ink = 1 - gray
    r = np.sqrt(np.clip(ink, 0, 1)) * 0.95
    return np.clip((d - r) * 6 + 0.5, 0, 1)                # 1 paper, 0 ink


# ---------------------------------------------------------------- 1 · the eye (drawn here as a grey-scale study, then halftoned)
W, H = 560, 380
S2 = 3
im = Image.new('L', (W * S2, H * S2), 236)
d = ImageDraw.Draw(im)
cx, cy = W * S2 / 2, H * S2 / 2 + 20 * S2
def almond(k):
    up = [(cx + (u - 0.5) * 430 * S2 * k, cy - np.sin(u * np.pi) * 128 * S2 * k) for u in np.linspace(0, 1, 60)]
    lo = [(cx + (0.5 - u) * 430 * S2 * k, cy + np.sin(u * np.pi) * 96 * S2 * k) for u in np.linspace(0, 1, 60)]
    return up + lo
d.polygon(almond(1.0), fill=226)                                   # eyeball
ir, pr = 108 * S2, 46 * S2
icx, icy = cx + 28 * S2, cy - 4 * S2                                # looking slightly right (at the chart)
d.ellipse([icx - ir, icy - ir, icx + ir, icy + ir], fill=120)
for k in range(90):                                                 # iris striations
    ang = k / 90 * 2 * np.pi
    r0, r1 = pr * 1.05, ir * (0.92 + 0.08 * np.random.default_rng(k).random())
    d.line([(icx + np.cos(ang) * r0, icy + np.sin(ang) * r0), (icx + np.cos(ang) * r1, icy + np.sin(ang) * r1)], fill=70 if k % 2 else 160, width=3 * S2)
d.ellipse([icx - ir, icy - ir, icx + ir, icy + ir], outline=30, width=7 * S2)
d.ellipse([icx - pr, icy - pr, icx + pr, icy + pr], fill=12)
d.ellipse([icx - 58 * S2, icy - 62 * S2, icx - 22 * S2, icy - 28 * S2], fill=250)   # catch-light
mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).polygon(almond(1.0), fill=255)
im = Image.composite(im, Image.new('L', im.size, 236), mask)
d = ImageDraw.Draw(im)
up = almond(1.0)[:60]
d.line(up, fill=20, width=14 * S2)                                   # upper lid line
lid2 = [(x, y - 34 * S2 + 0.10 * abs(x - cx)) for x, y in up[6:54]]
d.line(lid2, fill=70, width=6 * S2)                                  # lid crease
d.line(almond(1.0)[60:], fill=60, width=6 * S2)                      # lower lid
for k in range(14):                                                 # lashes
    u = 0.12 + 0.76 * k / 13; x, y = up[int(u * 59)]
    ang = -np.pi / 2 + (u - 0.5) * 1.6
    d.line([(x, y), (x + np.cos(ang) * 40 * S2, y + np.sin(ang) * 40 * S2)], fill=25, width=5 * S2)
brow = [(cx + (u - 0.5) * 470 * S2, cy - 190 * S2 - np.sin(u * np.pi) * 46 * S2 + u * 10 * S2) for u in np.linspace(0, 1, 40)]
d.line(brow, fill=40, width=26 * S2)
im = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
g = np.asarray(im, np.float32) / 255
ht = halftone(g, period=7, angle=45)
paper = np.array([238, 230, 208], np.float32); ink = np.array([22, 18, 16], np.float32)
rgb = Image.fromarray((ink + (paper - ink) * ht[..., None]).astype(np.uint8))
ell = [(W / 2 + np.cos(a) * W * 0.48, H / 2 + np.sin(a) * H * 0.47) for a in np.linspace(0, 2 * np.pi, 60, endpoint=False)]
with_rim(rgb, torn_mask(W, H, ell, rough=4, seed=3), rim=6, seed=3).save(os.path.join(A, 'eye.png'))

# ---------------------------------------------------------------- 2 · stock-table newsprint (digits only), torn into a torso
f_num = ImageFont.truetype(os.path.join(FONTS, 'OldStandard-Regular.ttf'), 21)
f_big = ImageFont.truetype(os.path.join(FONTS, 'PlayfairDisplay-Black.ttf'), 30)
TW, TH = 620, 760
sheet = Image.new('RGB', (TW, TH), (226, 218, 196))
d = ImageDraw.Draw(sheet)
cols = [18, 168, 268, 368, 468]
for c in range(2):
    x0 = 10 + c * 305
    d.line([(x0, 8), (x0 + 290, 8)], fill=(40, 36, 32), width=3)
    y = 18
    while y < TH - 20:
        if R.random() < 0.08:                              # section rule
            d.line([(x0, y + 6), (x0 + 290, y + 6)], fill=(60, 55, 50), width=1); y += 12; continue
        vals = [f'{R.integers(10, 999)}', f'{R.integers(10, 99)}.{R.integers(0, 99):02d}', f'{R.integers(1, 99)}.{R.integers(0, 9)}',
                ('+' if R.random() < 0.5 else '−') + f'{R.random() * 4:.2f}']
        xs = [x0 + 4, x0 + 96, x0 + 178, x0 + 236]
        for xx, v in zip(xs, vals):
            d.text((xx, y), v, font=f_num, fill=(30, 27, 24))
        y += 24
    d.line([(x0 + 296, 8), (x0 + 296, TH - 8)], fill=(80, 75, 68), width=1)
arr = np.asarray(sheet, np.float32) / 255
arr = arr * (0.94 + 0.06 * R.random(arr.shape[:2]))[..., None]           # newsprint mottle
arr = np.asarray(Image.fromarray((arr * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.45)))
torso = [(110, 40), (250, 0), (370, 0), (510, 40), (600, 140), (620, 760), (0, 760), (20, 140)]
with_rim(Image.fromarray(arr), torn_mask(TW, TH, torso, rough=9, seed=5), rim=5, seed=5).save(os.path.join(A, 'torso.png'))

# ---------------------------------------------------------------- 3 · graph paper sheet
GW, GH = 1000, 720
gp = np.ones((GH, GW, 3), np.float32) * np.array([0.95, 0.94, 0.89], np.float32)
yy, xx = np.mgrid[0:GH, 0:GW]
fine = ((xx % 20) < 1) | ((yy % 20) < 1)
bold = ((xx % 100) < 2) | ((yy % 100) < 2)
blue = np.array([0.45, 0.68, 0.74], np.float32)
gp[fine] = gp[fine] * 0.55 + blue * 0.45
gp[bold] = gp[bold] * 0.25 + blue * 0.75
gp *= (0.97 + 0.03 * R.random((GH, GW)))[..., None]
gimg = Image.fromarray((gp * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.35))
cut = [(6, 10), (GW - 12, 0), (GW, GH - 16), (14, GH)]
with_rim(gimg, torn_mask(GW, GH, cut, rough=2.5, seed=8), rim=3, seed=8).save(os.path.join(A, 'graph.png'))

# ---------------------------------------------------------------- 4 · a ruler (engraved catalogue look, ticks only)
RW, RH = 560, 78
ru = Image.new('RGB', (RW, RH), (226, 196, 128))
d = ImageDraw.Draw(ru)
for i in range(0, RW - 20, 9):
    L = 30 if (i // 9) % 10 == 0 else 20 if (i // 9) % 5 == 0 else 12
    d.line([(i + 12, 0), (i + 12, L)], fill=(40, 30, 20), width=2)
for yv in range(RH):                                   # engraved shading lines
    if yv % 4 == 0 and yv > 44:
        d.line([(0, yv), (RW, yv)], fill=(190, 156, 92), width=1)
d.rectangle([0, 0, RW - 1, RH - 1], outline=(40, 30, 20), width=3)
with_rim(ru, torn_mask(RW, RH, [(2, 2), (RW - 3, 2), (RW - 3, RH - 3), (2, RH - 3)], rough=1.5, seed=9), rim=6, seed=9).save(os.path.join(A, 'ruler.png'))
print('ok')
