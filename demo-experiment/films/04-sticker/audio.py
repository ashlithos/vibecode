"""04 Sticker explainer — soundtrack. Clean tech-explainer marimba bed, a sticker slap per beat, soft whooshes on the
camera moves, the peel, and the sonic logo on marimba + glockenspiel as the Data UX sticker is revealed."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, synth, fm, samples

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20
mar, glock = samples.inst('marimba'), samples.inst('glock')

# --- marimba ostinato (8ths, D – G – Bm – A), muted for the peel so the motif has air
CH = [(0.5, ['D4', 'A4', 'F#4', 'A4']), (1.5, ['D4', 'B4', 'G4', 'B4']), (2.0, ['D4', 'B4', 'F#4', 'B4']), (2.5, ['C#4', 'A4', 'E4', 'A4'])]
ost = m.track('marimba', level=-25, sends={'room': -12})
for i, (t0, notes) in enumerate(CH):
    t1 = CH[i + 1][0] if i + 1 < len(CH) else 3.0
    k, t = 0, t0
    while t < t1 - 1e-6:
        ost.add(mar.play(notes[k % 4], dur=0.35, vel=0.55 + 0.2 * (k % 2 == 0)), at=t, pan=-0.25 + 0.5 * (k % 2))
        k += 1; t += 0.25
bass = m.track('bass', level=-31)
for t, n in [(0.5, 'D2'), (1.5, 'G1'), (2.0, 'B1'), (2.5, 'A1')]:
    bass.add(synth.bass(n, 0.4, 0.75, 'pluck'), at=t)

# --- sonic logo: marimba, the landing doubled by glockenspiel + a soft pad bloom
def play(n, d, v, i):
    s = mar.play(n, dur=0.5 if i < 2 else 2.0, vel=v)
    if i == 2:
        s = mg.layer([(s, 0, 0, 0), (glock.play('E6', dur=2.0, vel=0.8), 0, -4, 0), (mar.play('E4', dur=2.0, vel=0.8), 0, -5, 0)])
    return s
sonic.motif(m, play, level=-17, sends={'room': -10, 'plate': -16}, vels=(0.5, 0.6, 1.0), gain_last=3.0)
land = m.track('landing', level=-19, sends={'hall': -10})
land.add(synth.pad(['D3', 'A3', 'E4', 'F#4'], 2.4, 0.7, 'warm', attack=0.03, release=0.6), at=RESOLVE)
land.add(synth.bass('D2', 1.4, 0.8, 'sub'), at=RESOLVE)

# --- SFX on visible actions
S = m.sfx
for i, t in enumerate(C['slaps']):
    S(sfx.sticker_slap(seed=i), at=t, gain=-5 if i == 4 else -8, pan=[-0.5, 0.5, -0.5, 0.5, 0][i])
for i, (a, b, dr) in enumerate([(0.62, 1.0, 1), (1.12, 1.5, -1), (1.62, 2.0, 1)]):     # camera whip-pans
    S(sfx.whoosh(b - a + 0.1, 'air', direction=dr, peak=0.55, seed=10 + i), at=(a + b) / 2, gain=-13)
S(sfx.whoosh(0.7, 'soft', direction=0, peak=0.6, seed=20), at=2.8, gain=-14)            # the pull-out
S(sfx.sticker_peel(dur=C['peel'][1] - C['peel'][0], seed=3), at=C['peel'][0], gain=-3)
S(sfx.paper('flip', 0.3, seed=4), at=C['peel'][1] + 0.05, gain=-9, pan=-0.5)             # the flap is tossed
S(sfx.whoosh(0.3, 'swish', direction=-1, peak=0.5, seed=21), at=C['peel'][1] + 0.12, gain=-12, pan=-0.6)
m.group('sfx').gain = -3

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
