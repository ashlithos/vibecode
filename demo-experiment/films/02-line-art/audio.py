"""02 Line art — soundtrack. Felt piano + soft strings, a pen-on-paper whisper that follows the tip speed,
a glass chime on the line-to-fill, and the sonic logo on felt piano landing as the pen finishes "Data UX"."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE, SR
from mgaudio import sfx, synth, fm, samples, filters as F
from mgaudio.core import Sound

C = json.load(open(os.path.join(HERE, 'cues.json')))
SPEED = np.array(json.load(open(os.path.join(HERE, 'dump.json')))['tip_speed'])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20
piano = samples.inst('piano')
def felt(n, d, v):                                   # felt piano: soft hammer = low-passed, slow-ish attack
    return piano.play(n, dur=d, vel=v, attack=0.004).lpf(2600)

# --- sparse felt piano: one soft open fifth per drawn "chapter" (chart, grid, circle)
pno = m.track('piano', level=-27, sends={'hall': -8})
for t, notes, v in [(0.02, ('D3', 'A3'), 0.3), (1.3, ('B3', 'F#4'), 0.26), (2.15, ('G3', 'D4'), 0.26)]:
    for k, n in enumerate(notes):
        pno.add(felt(n, 1.4, v), at=t + 0.03 * k)

# --- strings: a soft swell under the writing that opens into the landing chord (Dadd9)
st = m.track('strings', level=-25, sends={'hall': -6})
st.add(synth.pad(['D3', 'A3', 'F#4'], 1.6, 0.6, 'strings', attack=1.0, release=0.4), at=2.5)
st.add(synth.pad(['D2', 'A2', 'E3', 'F#3', 'A3'], 3.2, 0.75, 'strings', attack=0.06, release=0.5), at=RESOLVE)
st.automate('lpf', [(2.4, 900), (3.9, 2600), (4.0, 5200), (6.8, 900)])
st.automate('gain', [(0, 0), (4.3, 0), (6.8, -14)])

# --- sonic logo on felt piano; the landing doubled an octave below and with a glass bell
def play(n, d, v, i):
    s = felt(n, 0.9 if i < 2 else 2.4, v)
    if i == 2:
        s = mg.layer([(s, 0, 0, 0), (felt('E4', 2.4, 0.55), 0, -6, 0), (fm.bell('E6', 2.0, 0.5, 'celesta'), 0, -14, 0)])
    return s
sonic.motif(m, play, level=-17, sends={'hall': -9}, vels=(0.52, 0.6, 0.95), gain_last=3.0)

# --- pen-on-paper whisper, loudness and brightness follow the tip speed (dumped from the picture)
n = int(7.0 * SR); tt = np.arange(n) / SR
sp = np.interp(tt, np.arange(len(SPEED)) / 30.0, SPEED)
drawing = (tt < C['sections']['title']['t1'] + 0.02).astype(float)
amt = np.clip(np.log1p(sp / 300.0) / np.log1p(30.0), 0, 1) * drawing
amt = np.convolve(amt, np.ones(480) / 480, mode='same')
noise = np.random.default_rng(2).standard_normal(n)
scratch = F.bpf(noise, 1800, 7000) * (0.6 + 0.4 * np.random.default_rng(3).random(n) ** 3)
pen = scratch * amt ** 1.3
penS = Sound(np.stack([pen, pen]))
m.track('pen', level=-33, pan=0.0, width=0.4).add(penS, at=0.0)

# --- SFX on visible actions
S = m.sfx
S(sfx.chime(('A5', 'D6', 'E6'), step=0.05, kind='celesta'), at=C['fill'], gain=-9, pan=0.45)     # line-to-fill
S(sfx.whoosh(0.6, 'air', direction=-1, peak=0.5, seed=4), at=C['sections']['sweep']['t0'] + 0.2, gain=-14, pan=-0.2)
S(sfx.whoosh(0.9, 'soft', direction=0, peak=0.7, seed=5), at=C['dolly'][0] + 0.55, gain=-16)    # the dolly-out
m.group('sfx').gain = -3

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
