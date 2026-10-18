"""01 Cel boil — soundtrack. Jazzy pizzicato + xylophone, cartoon SFX on every drawn action, sonic logo on the X landing."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'shared'))
import sonic
from sonic import mg, RESOLVE
from mgaudio import sfx, pluck, fm, samples

C = json.load(open(os.path.join(HERE, 'cues.json')))
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
OUT = os.path.join(HERE, 'out', 'audio.wav')

m = mg.Mix(duration=7.0, bpm=120, anchor=0.0)
m.group('music').level = -20
glock, marim = samples.inst('glock'), samples.inst('marimba')

# --- pizzicato walking bass: quarters from the first bar to the click, then it holds its breath for the leap
bass = m.track('pizz_bass', level=-29, sends={'room': -14})
line = [(1.0, 'D3'), (1.5, 'F#3'), (2.0, 'A3'), (2.25, 'B3')]
for t, n in line:
    bass.add(pluck.pizz(n, 0.45, 0.6 if t < 0.6 else 0.8, seed=int(t * 10)), at=t)
# offbeat pizz chord "chucks" under the bar growth (light swing feel, not a beat)
comp = m.track('pizz_comp', level=-32, pan=0.25, sends={'room': -12})
for t in (1.25, 1.75):
    for k, n in enumerate(('F#4', 'A4', 'D5')):
        comp.add(pluck.pizz(n, 0.25, 0.6, seed=k + int(t * 10)), at=t + 0.008 * k)

# --- xylophone plinks on each bar landing (rising, in D)
xy = m.track('xylo', level=-24, sends={'plate': -14})
for i, (t, n) in enumerate(zip(C['bars'], ['F#4', 'A4', 'B4', 'C#5', 'D5'])):
    xy.add(fm.mallet(n, 0.5, 0.75, 'xylo'), at=t, pan=-0.4 + 0.2 * i)

# --- sonic logo: xylophone + pizz doubling, landing chord + glock on the X
def play(n, d, v, i):
    s = fm.mallet(n, 0.6 if i < 2 else 1.6, v, 'xylo')
    if i == 2:
        s = mg.layer([(s, 0, 0, 0), (marim.play(n, dur=2.2, vel=0.9), 0, -2, 0)])
    return s
sonic.motif(m, play, level=-18, sends={'plate': -12}, vels=(0.4, 0.5, 1.0), gain_last=3.0)
land = m.track('landing', level=-17, sends={'room': -10})
for k, n in enumerate(('D2', 'D3', 'A3', 'E4', 'F#4')):           # Dadd9 pizz chord, strummed fast
    land.add(pluck.pizz(n, 0.9, 0.95, seed=40 + k), at=RESOLVE + 0.006 * k)
land.add(glock.play('E6', dur=2.0, vel=0.8), at=RESOLVE, gain=-3)
land.add(samples.inst('vibraphone').play('D5', dur=2.4, vel=0.6), at=RESOLVE, gain=-6)

# --- cartoon SFX, each on a visible action
S = m.sfx
S(sfx.whoosh(0.25, 'swish', direction=-1, peak=0.5, seed=1), at=C['sfx']['swoosh_in'], gain=-6, pan=0.4)
S(sfx.pen('marker', C['sfx']['pen_y'][1], seed=2), at=C['sfx']['pen_y'][0], gain=-11, pan=-0.3)
S(sfx.pen('marker', C['sfx']['pen_x'][1], seed=3), at=C['sfx']['pen_x'][0], gain=-11, pan=0.1)
S(sfx.swish(0.12, seed=4), at=C['sfx']['cursor_jump'], gain=-12, pan=-0.2)
for i, t in enumerate(C['bars']):                            # each bar: a stretchy rise then a pop on the landing
    S(sfx.stretch(C['grow'], up=True), at=t - C['grow'] / 2, gain=-20, pan=-0.4 + 0.2 * i)
    S(sfx.pop('mouth', pitch=1 + 0.07 * i), at=t, gain=-6, pan=-0.4 + 0.2 * i)
S(sfx.click('mouse'), at=C['click'], gain=-4)
S(sfx.whoosh(0.45, 'soft', direction=0, peak=0.25, seed=5), at=C['sfx']['poof'], gain=-5)
S(sfx.pop('cork', pitch=0.9), at=C['sfx']['poof'] - 0.02, gain=-6)
for i, p in enumerate(C['pieces'][:2]):                      # D and first a land before the motif begins
    S(sfx.pop('soft', pitch=1.1 + 0.1 * i), at=p['land'], gain=-11, pan=-0.35 + 0.1 * i)
S(sfx.sparkle(0.7, density=10, key='D', mode='major', seed=6), at=RESOLVE + 0.05, gain=-12)
S(sfx.swish(0.18, seed=7), at=C['sfx']['exit'], gain=-15, pan=0.5)

m.group('sfx').gain = -5          # cartoon SFX sit under the music; the landing stays the one accent
m.export(OUT, spectrogram=os.path.join(HERE, 'out', 'audio_spec.png'), stems_dir=os.path.join(HERE, 'out', 'stems') if os.environ.get('STEMS') else None)
sonic.finish(OUT)
sonic.landing_check(OUT)
