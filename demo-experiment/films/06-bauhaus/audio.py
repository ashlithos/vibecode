"""06 Bauhaus — soundtrack. Minimal techno / click at 120 BPM without a four-on-the-floor kick: every landing is a pitched
click or blip, dub stabs mark the sections, and the sonic logo is a clean FM bell-blip with a dub-delay tail, landing
on DATA UX with a Dadd9 dub stab + sub."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, synth, fm, drums

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20

# --- clicks & blips: each geometric landing is a pitched click (D minor-ish pentatonic: D E F# A B)
clk = m.track('clicks', level=-23, sends={'delay': -16})
SC = {'c1': 'D5', 'c4': 'A4', 'c2': 'B4', 'c7': 'D5', 'c5': 'E5', 'c6': 'F#5', 'c8': 'E5', 'c3': 'A5'}
for k, t in C['circles'].items():
    clk.add(sfx.blip(SC[k], 'sine', dur=0.06, glide=0.0), at=t, pan=-0.5 + 0.12 * list(SC).index(k))
for k, t in enumerate(C['stack']):                                    # each stacked row: woody clicks cascading across the columns
    for i in range(4 if k < 2 else (2 if k == 2 else 1)):
        col = 3 - i
        clk.add(drums.rim(0.55 + 0.1 * k), at=t + 0.0625 * (col - 3), pan=0.2 + 0.1 * col)
    clk.add(sfx.blip(['D4', 'F#4', 'A4', 'B4'][k], 'square', dur=0.05, glide=0.0), at=t, gain=-6, pan=0.5)
clk.add(sfx.blip('E5', 'tri', dur=0.08, glide=1.0), at=C['head'], pan=0.5)
hat = m.track('hat', level=-32, pan=0.15)                             # a ticking 16th hat only while the poster builds
t = 0.5
while t < 2.99:
    hat.add(drums.hat('closed', 0.5 if (t * 4) % 2 else 0.8), at=t); t += 0.25

# --- dub stabs on the section downbeats (not a beat: three hits in three seconds)
stab = m.track('stab', level=-24, sends={'delay': -10, 'hall': -14})
for t, ch in [(0.5, ['D3', 'F#3', 'A3']), (1.5, ['B2', 'D3', 'F#3']), (2.5, ['G2', 'B2', 'D3'])]:
    stab.add(synth.stab(ch, 0.22, 0.75, 'dub'), at=t)
bass = m.track('bass', level=-25)
for t, n in [(0.5, 'D2'), (1.5, 'B1'), (2.5, 'G1')]:
    bass.add(synth.bass(n, 0.35, 0.8, 'sub'), at=t)

# --- sonic logo: FM bell-blip; landing = Dadd9 dub stab + sub + the delay tail
def play(n, d, v, i):
    return mg.layer([(fm.bell(n, 0.5 if i < 2 else 1.8, v, 'glock'), 0, 0, 0), (sfx.blip(n, 'sine', dur=0.08, glide=0.0), 0, -8, 0)])
sonic.motif(m, play, level=-17, sends={'delay': -11, 'hall': -14}, vels=(0.55, 0.65, 1.0), gain_last=3.0)
land = m.track('landing', level=-18, sends={'delay': -9, 'hall': -12})
land.add(synth.stab(['D3', 'A3', 'E4', 'F#4'], 0.6, 0.95, 'dub'), at=RESOLVE)
land.add(synth.b808('D2', 1.4, 0.9), at=RESOLVE, gain=-2)
land.add(drums.rim(1.0), at=RESOLVE, gain=-4)

# --- SFX: the grid drawing on, the shaft, and the quarter-turn cascade (a rotating click per letter group)
S = m.sfx
S(sfx.hud_scan(0.45, direction=1, seed=1), at=0.0, gain=-16)
S(sfx.tick('hi'), at=C['axes'][1], gain=-10)
S(sfx.whoosh(0.3, 'sci', direction=1, peak=0.9, seed=2), at=C['shaft'][1], gain=-14, pan=0.4)
for g, (a, b) in C['groups'].items():
    if g in ('D', 'T', 'U'):
        S(sfx.toggle(on=True), at=b, gain=-13, pan={'D': -0.6, 'T': -0.1, 'U': 0.5}[g])
    S(sfx.whoosh(b - a, 'swish', direction=1, peak=0.85, seed=len(g) * 7), at=b - 0.05, gain=-19, pan={'D': -0.6, 'A1': -0.4, 'T': -0.1, 'A2': 0.1, 'U': 0.45, 'X': 0.65}[g])
m.group('sfx').gain = -3

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
