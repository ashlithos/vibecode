"""07 Synthwave — soundtrack. VHS hiss + CRT on, an arpeggiated saw bass and lush 80s pads in D minor (i VI III VII),
a sparse gated-reverb snare on the sun's beats (no four-on-the-floor), the sonic logo on an 80s lead, and the ONE
accent on the title hit: big Dm(add9) chord + crash + gated snare + tape glitch."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, synth, drums, seq
from mgaudio.theory import midi

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20
g = m.grid
CH = [(0.5, 'D', ['D3', 'F3', 'A3', 'C4']), (1.5, 'Bb', ['D3', 'F3', 'Bb3', 'D4']), (2.25, 'F', ['C3', 'F3', 'A3', 'C4']), (3.0, 'C', ['C3', 'E3', 'G3', 'C4'])]
ROOT = {'D': 'D2', 'Bb': 'Bb1', 'F': 'F1', 'C': 'C2'}
def at(t):
    cur = CH[0]
    for c in CH:
        if t >= c[0]: cur = c
    return cur

# --- saw bass arpeggio: 16ths root/octave, filter opening as the camera flies (muffled under the tape at the open)
bass = m.track('bass', level=-26)
t = 0.5
while t < 3.4 - 1e-6:
    _, ch, _ = at(t); r = midi(ROOT[ch]); k = int(round(t * 4)) % 4
    bass.add(synth.bass(r + (12 if k == 2 else 0), 0.11, 0.85 if k == 0 else 0.6, 'saw80s'), at=t)
    t += 0.125
bass.automate('lpf', [(0.45, 500), (1.5, 1600), (3.3, 3200), (3.4, 900)])
pad = m.track('pad', level=-24, sends={'hall': -8})
for i, (t0, ch, notes) in enumerate(CH):
    t1 = CH[i + 1][0] if i + 1 < len(CH) else 3.5
    pad.add(synth.pad(notes, t1 - t0 + 0.1, 0.7, '80s'), at=t0)
arp = m.track('arp', level=-28, pan=0.2, sends={'delay': -10})
for tt, n, d, v in seq.arp(g, lambda tt: [midi(x) + 12 for x in at(tt)[2]], 1.0, 3.375, div=16, pattern='up', gate=0.4):
    arp.add(synth.pluck(n, d, v * 0.8, 'saw'), at=tt)
sn = m.track('snare', level=-27, sends={'gated': -6})
for tt in (1.0, 2.0, 3.0):                                          # the sun's beats (2.0 = the pie slices part)
    sn.add(drums.snare('synthwave', 0.85), at=tt)

# --- sonic logo on an 80s brass-ish lead
def play(n, d, v, i):
    return synth.lead(n, 0.24 if i < 2 else 2.0, v, '80s')
sonic.motif(m, play, level=-17, sends={'hall': -10, 'delay': -14}, vels=(0.7, 0.78, 1.0), gain_last=2.0)
land = m.track('landing', level=-17, sends={'hall': -7})
land.add(synth.pad(['D3', 'A3', 'E4', 'F4', 'A4'], 2.4, 0.95, '80s', attack=0.01, release=0.6), at=RESOLVE)
land.add(synth.supersaw(['D4', 'A4', 'E5'], 0.6, 0.8), at=RESOLVE, gain=-4)
land.add(synth.bass('D1', 1.2, 0.95, 'saw80s'), at=RESOLVE, gain=-3)
land.add(drums.snare('synthwave', 1.0), at=RESOLVE, gain=-2)
land.add(drums.crash(), at=RESOLVE, gain=-4)

# --- SFX on what the eye sees
S = m.sfx
S(sfx.vhs_noise(0.7), at=0.0, gain=-4)
S(sfx.crt_on(), at=0.0, gain=-10)
S(sfx.head_switch(), at=C['trackLock'], gain=-6)
S(sfx.whoosh(1.0, 'soft', direction=0, peak=0.85, seed=3), at=C['rise'][1] - 0.15, gain=-15)     # title rising
S(sfx.glitch(C['glitchDur'], 'stutter', seed=4), at=RESOLVE, gain=-8)                           # VHS tracking glitch
S(sfx.sparkle(0.6, density=12, key='D', mode='minor', seed=5), at=RESOLVE + 0.1, gain=-14, pan=-0.5)   # star glint
m.group('sfx').gain = -3

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
