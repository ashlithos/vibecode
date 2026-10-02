"""05 Collage — soundtrack. Vinyl crackle, a lazy lo-fi jazz bed (Rhodes + upright), paper slaps / scissors / tape /
marker on every pasted scrap, and the sonic logo on Rhodes + vibes landing with the X (plus a rubber-stamp thump)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, synth, fm, pluck, drums, samples

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=96, anchor=0.0, swing=0.12)
m.group('music').level = -20

# --- Rhodes comping (Dmaj9 → Bm9 → Gmaj9 → A13sus), upright bass walking under it; it stops for the legend
rh = m.track('rhodes', level=-25, sends={'room': -10})
for t, notes in [(0.25, ['F#3', 'A3', 'C#4', 'E4']), (1.25, ['D3', 'F#3', 'A3', 'C#4']), (2.083, ['F#3', 'A3', 'B3', 'D4']), (2.75, ['G3', 'B3', 'D4', 'E4'])]:
    for k, n in enumerate(notes):
        rh.add(fm.epiano(n, 0.9, 0.55, bright=0.35), at=t + 0.012 * k)
bass = m.track('upright', level=-29, sends={'room': -14})
for t, n in [(0.25, 'D2'), (0.75, 'F#2'), (1.25, 'B1'), (1.75, 'A1'), (2.083, 'G1'), (2.5, 'B1'), (2.75, 'A1')]:
    bass.add(pluck.ks(n, 0.5, 0.8, decay=0.7, bright=0.35, exc='finger'), at=t)
brush = m.track('brush', level=-31, pan=0.2)
for t in (0.5, 1.0, 1.5, 2.083, 2.75):
    brush.add(drums.snare('brush', 0.5), at=t)

# --- sonic logo: Rhodes, doubled by vibes on the landing; Dadd9 Rhodes chord under it
def play(n, d, v, i):
    s = fm.epiano(n, 0.6 if i < 2 else 2.2, v, bright=0.45)
    if i == 2:
        s = mg.layer([(s, 0, 0, 0), (fm.mallet('E5', 2.2, 0.8, 'vibes'), 0, -4, 0)])
    return s
sonic.motif(m, play, level=-17, sends={'room': -9, 'plate': -15}, vels=(0.5, 0.6, 1.0), gain_last=3.0)
land = m.track('landing', level=-19, sends={'room': -10})
for k, n in enumerate(('D2', 'A2', 'E3', 'F#3', 'A3')):
    land.add(fm.epiano(n, 2.2, 0.75, bright=0.3) if k else pluck.ks('D2', 1.6, 0.9, decay=1.6, bright=0.35, exc='finger'), at=RESOLVE + 0.01 * k)

# --- SFX on every visible action (12 fps stop-motion: they sit on the slap frame)
S = m.sfx
S(sfx.vinyl(6.8, crackle=0.8), at=0.0, gain=-7)
S(sfx.whoosh(0.3, 'cloth', direction=1, peak=0.8, seed=1), at=C['band'], gain=-11, pan=-0.4)        # band slides in
for j, (name, pan) in enumerate([('graph', 0.45), ('torso', -0.5), ('eye', -0.45)]):
    S(sfx.scissors(seed=30 + j), at=C[name] - 0.2, gain=-15, pan=pan)
    S(sfx.paper('slide', 0.2, seed=40 + j), at=C[name], gain=-8, pan=pan)
    S(sfx.sticker_slap(seed=50 + j), at=C[name], gain=-9, pan=pan)
S(sfx.tape_rip(0.35), at=C['tape'], gain=-9, pan=-0.4)
S(sfx.sticker_slap(seed=5), at=C['ruler'], gain=-10, pan=-0.3)
S(sfx.whoosh(0.35, 'swish', direction=1, peak=0.6, seed=6), at=(C['armUp'][0] + C['armUp'][1]) / 2, gain=-12, pan=-0.1)
S(sfx.sticker_slap(seed=7), at=C['hand'], gain=-10, pan=0.1)
S(sfx.pen('marker', C['axes'][1] - C['axes'][0], seed=8), at=C['axes'][0], gain=-10, pan=0.3)
S(sfx.pen('marker', C['line'][1] - C['line'][0], seed=9), at=C['line'][0], gain=-8, pan=0.4)
S(sfx.paper('slide', 0.2, seed=10), at=C['label'], gain=-8, pan=0.35)
S(sfx.sticker_slap(seed=11), at=C['label'], gain=-8, pan=0.35)
for i, t in enumerate(C['letters']):
    if t in (3.5, 3.75):
        S(sfx.sticker_slap(seed=20 + i), at=t, gain=-14, pan=-0.1 + 0.1 * i)                     # under the motif
    elif t == RESOLVE:
        S(sfx.stamp('rubber'), at=t, gain=-5, pan=0.4)                                             # the accent
    else:
        S(sfx.sticker_slap(seed=20 + i), at=t, gain=-10, pan=-0.1 + 0.1 * i)
m.group('sfx').gain = -3

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
