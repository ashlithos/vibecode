"""03 Morph — soundtrack. Rhythmic plucky arpeggio in D, a pitched morph-whoosh landing on every shape change,
and the sonic logo on a bright pluck, landing with the X."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, synth, fm, seq, drums
from mgaudio.theory import midi

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20
g = m.grid

# --- harmony: D | Bm7 | Gmaj7 | A(sus) — one chord per beat-pair, under the morph chain; silence for the motif pickups
CH = [(0.5, ['D4', 'F#4', 'A4', 'D5']), (1.5, ['B3', 'D4', 'F#4', 'A4']), (2.25, ['G3', 'B3', 'D4', 'F#4']), (3.0, ['A3', 'D4', 'E4', 'A4'])]
def chord_at(t):
    cur = CH[0][1]
    for t0, c in CH:
        if t >= t0: cur = c
    return [midi(n) for n in cur]
arp = m.track('arp', level=-31, sends={'delay': -14})
for t, n, d, v in seq.arp(g, lambda t: chord_at(t), 0.5, 3.375, div=16, pattern='updown', gate=0.5):
    arp.add(synth.pluck(n, d, v * (0.75 + 0.25 * ((t * 4) % 2 < 1)), 'future'), at=t)
arp.automate('lpf', [(0.5, 1400), (2.0, 4200), (3.3, 7000), (3.4, 2000)])
pad = m.track('pad', level=-34, sends={'hall': -10})
for i, (t0, c) in enumerate(CH):
    t1 = CH[i + 1][0] if i + 1 < len(CH) else 3.45
    pad.add(synth.pad(c[:3], t1 - t0, 0.6, 'glass'), at=t0)
bass = m.track('bass', level=-31)
for t, n in [(0.5, 'D2'), (1.5, 'B1'), (2.25, 'G1'), (3.0, 'A1')]:
    bass.add(synth.bass(n, 0.45, 0.8, 'sub'), at=t)

# --- sonic logo: bright pluck (future) doubled with a bell; landing adds a pluck chord + 808 sub
def play(n, d, v, i):
    s = mg.layer([(synth.pluck(n, 0.35 if i < 2 else 1.6, v, 'future'), 0, 0, 0), (fm.bell(n, 1.2 if i < 2 else 2.4, 0.5, 'bell'), 0, -9, 0)])
    return s
sonic.motif(m, play, level=-17, sends={'hall': -10, 'delay': -18}, vels=(0.55, 0.65, 1.0), gain_last=3.0)
land = m.track('landing', level=-19, sends={'hall': -9})
land.add(synth.poly(['D3', 'A3', 'E4', 'F#4', 'A4'], 2.2, synth.pluck, vel=0.8, kind='future'), at=RESOLVE)
land.add(synth.pad(['D3', 'A3', 'E4', 'F#4'], 2.4, 0.7, 'glass', attack=0.02, release=0.6), at=RESOLVE, gain=-6)
land.add(synth.b808('D2', 1.6, 0.9), at=RESOLVE, gain=-2)

# --- one pitched morph-whoosh per shape change, landing on the visual landing frame
S = m.sfx
S(sfx.pop('bubble', pitch=0.8), at=C['split'], gain=-6)                                  # the split
S(sfx.morph(0.5, up=True, note='D4'), at=C['split'] + 0.5, gain=-10)                     # dots arrive in the cloud
for i, (a, b) in enumerate(C['snap']):                                                    # each bar snaps in
    S(sfx.blip(['F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i], 'tri', glide=0.5), at=b + 0.09, gain=-13, pan=-0.5 + 0.2 * i)
S(sfx.morph(0.35, up=False, note='A3'), at=C['merge'][1], gain=-11)                      # segments merge into bars
S(sfx.whoosh(0.6, 'swish', direction=1, peak=0.8, seed=3), at=C['rows'][5][1] - 0.1, gain=-10)   # bars swing into rows
S(sfx.click('soft'), at=C['rows'][5][1], gain=-12)
for i, (a, b) in enumerate(C['letters']):                                                 # rows fold into letters
    if b in (3.5, 3.75, 4.0):
        continue                                                                          # the motif notes carry these
    S(sfx.morph(0.45, up=True, note=['D4', 'F#4', 'A4', 'B4', 'D5', 'E5'][i]), at=b, gain=-14, pan=-0.4 + 0.16 * i)
S(sfx.morph(0.7, up=True, note='E5'), at=RESOLVE, gain=-9)
m.group('sfx').gain = -8

m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'))
sonic.finish(OUT)
sonic.landing_check(OUT)
