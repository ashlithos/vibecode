"""Data UX sonic logo, shared by all seven intros.

One rising 3-note motif in D: root, fifth, ninth (D4 -> A4 -> E5). The two pickups sit on the eighth-note grid
before the landing; the landing note is the single big accent and hits on the exact frame where "Data UX" resolves
(RESOLVE = 4.0 s = frame 120 at 30 fps). Each film re-orchestrates the same three notes in its own sound world.
"""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MG_ROOT = os.environ.get('MG_ROOT', os.path.normpath(os.path.join(HERE, '..', '..', '..', 'mg-styles-15')))
sys.path.insert(0, os.path.join(MG_ROOT, 'lib', 'audio'))

import mgaudio as mg  # noqa: E402
from mgaudio.core import Sound  # noqa: E402
from mgaudio import samples as _samples  # noqa: E402

# The public mg-styles-15 repo ships only the samples its 15 films use, but its index lists the full VCSL set.
# Keep only files that exist, so Instrument.pick() never chooses a missing file.
_idx = _samples._index()
for _k in list(_idx):
    _idx[_k] = [i for i in _idx[_k] if os.path.exists(os.path.join(_samples.ROOT, i['file']))]
_samples._index = lambda: _idx

SR = 48000
DURATION = 7.0
RESOLVE = 4.0                     # "Data UX" resolves on this frame (frame 120 @ 30 fps)
MOTIF_NOTES = ['D4', 'A4', 'E5']  # root, fifth, ninth
MOTIF_TIMES = [3.5, 3.75, 4.0]    # two eighth-note pickups at 120 bpm, then the landing
SILENT_BY = 6.8                   # tail must be gone by here


def motif(m, play, track='motif', level=-19, sends=None, vels=(0.62, 0.72, 1.0), durs=(0.3, 0.3, 2.4),
          times=MOTIF_TIMES, notes=MOTIF_NOTES, pan=(-0.12, 0.08, 0.0), gain_last=0.0):
    """Place the three motif notes. `play(note, dur, vel, i)` returns a Sound (sync = onset)."""
    tr = m.track(track, level=level, sends=sends or {})
    for i, (t, n, d, v) in enumerate(zip(times, notes, durs, vels)):
        s = play(n, d, v, i)
        tr.add(s, at=t, gain=gain_last if i == 2 else 0.0, pan=pan[i])
    return tr


def finish(path, silent_by=SILENT_BY, fade=0.45, expected=DURATION):
    """Fade the master to digital silence by `silent_by` (cosine), zero the remainder, rewrite 24-bit, re-analyse."""
    import soundfile as sf
    y, sr = sf.read(path, always_2d=True)
    n0, n1 = int((silent_by - fade) * sr), int(silent_by * sr)
    g = np.ones(len(y))
    g[n0:n1] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n1 - n0))
    g[n1:] = 0.0
    y = y * g[:, None]
    sf.write(path, y, sr, subtype='PCM_24')
    res = mg.analyze(path, expected=expected)
    tail = np.max(np.abs(y[int(silent_by * sr):])) if len(y) > n1 else 0.0
    print(f"[sonic] {os.path.basename(os.path.dirname(os.path.dirname(path)))}: {res['duration']:.3f}s "
          f"LUFS {res['lufs']:.2f} TP {res['true_peak']:.2f} corr {res['stereo_corr']:.2f} tail>{silent_by}s peak={tail:.1e}"
          + (f" WARN {res['warnings']}" if res['warnings'] else ''))
    return res


def landing_check(path, t=RESOLVE):
    """Onsets near the motif + where the loudest 50 ms window sits (should be the landing)."""
    import soundfile as sf
    res = mg.analyze(path, expected=DURATION)
    near = [round(o, 3) for o in res['onsets'] if 3.3 <= o <= 4.2]
    y, sr = sf.read(path, always_2d=True); w = int(0.05 * sr)
    e = np.array([np.sqrt(np.mean(y[i:i + w] ** 2)) for i in range(0, len(y) - w, w // 2)])
    ts = np.arange(len(e)) * (w // 2) / sr
    top = ts[np.argsort(e)[::-1][:3]]
    db = 20 * np.log10(e + 1e-9)
    print(f"[sonic] onsets 3.3-4.2s: {near} | loudest 50ms windows at {np.round(top, 2).tolist()} | "
          f"level @4.0 {db[int(4.0 / ts[1])]:.1f} dB vs median(0.3-3.4) {np.median(db[int(0.3 / ts[1]):int(3.4 / ts[1])]):.1f} dB")
    return near, top
