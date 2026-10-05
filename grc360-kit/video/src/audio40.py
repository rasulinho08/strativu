"""Synthesises the 40 s soundtrack for the GRC360 film from timeline40.json.

Music bed (pad + plucks + soft kick), and sound effects placed on the same
timeline the video uses: clicks, page transitions, modals, scrolls, highlights,
logo hits. Output: soundtrack40.wav (48 kHz stereo).
"""
import json, pathlib, wave
import numpy as np

D = pathlib.Path(__file__).parent
TL = json.loads((D / "timeline40.json").read_text())
SR = 48000
DUR = TL["dur"]
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.005, r=None, curve=6.0):
    t = tt(d)
    e = np.minimum(1, t / max(a, 1e-4))
    if r is None:
        e *= np.exp(-curve * t / d)
    else:
        e *= np.clip((d - t) / r, 0, 1)
    return e


def lowpass(x, cutoff):
    # one-pole low-pass, cutoff may be an array
    a = np.exp(-2 * np.pi * np.asarray(cutoff) / SR) * np.ones(len(x))
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def hp(x):
    return np.diff(x, prepend=0.0)


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# ---------------- sound effects ----------------
def click():
    d = 0.06; t = tt(d)
    body = np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 140)
    tick = rng.standard_normal(len(t)) * np.exp(-t * 900)
    low = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * 0.5
    return (body * 0.5 + hp(tick) * 0.6 + low) * 0.9


def whoosh(d=0.45, lo=300, hi=4500):
    t = tt(d); n = rng.standard_normal(len(t))
    cut = lo + (hi - lo) * np.sin(np.pi * t / d) ** 2
    y = lowpass(n, cut)
    y = hp(y) * 0.6 + y * 0.4
    e = np.sin(np.pi * t / d) ** 2
    return y * e * 0.55


def pop():
    d = 0.18; t = tt(d)
    f = 520 + 380 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 22) * 0.55


def tick_hl():
    d = 0.35; t = tt(d)
    return (np.sin(2 * np.pi * 1568 * t) + 0.4 * np.sin(2 * np.pi * 2352 * t)) * np.exp(-t * 14) * 0.22


def scroll_sfx():
    d = 0.3; t = tt(d); y = np.zeros(len(t))
    for k in range(5):
        i = int((0.02 + k * 0.045) * SR)
        b = rng.standard_normal(int(0.012 * SR)) * np.exp(-np.arange(int(0.012 * SR)) / SR * 400)
        y[i:i + len(b)] += hp(b) * (0.5 - k * 0.07)
    return y * 0.7


def boom(d=1.8):
    t = tt(d)
    f = 38 + 70 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 2.6)
    n = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 7) * 0.6
    return (s + n) * 0.9


def chime(root=74, d=3.0):
    t = tt(d); y = np.zeros(len(t))
    for k, m in enumerate([0, 7, 12, 16, 19]):
        f = note(root + m)
        y += np.sin(2 * np.pi * f * t + k) * np.exp(-t * (1.2 + k * 0.25)) * (0.5 / (1 + k * 0.4))
        y += np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 4) * 0.06
    return y * 0.55


def riser(d=1.2):
    t = tt(d); n = rng.standard_normal(len(t))
    y = lowpass(n, 200 + 5000 * (t / d) ** 2)
    return y * (t / d) ** 2 * 0.5


def blip(f):
    d = 0.14; t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 30) * 0.25


def glitch():
    d = 0.12; t = tt(d)
    sq = np.sign(np.sin(2 * np.pi * 220 * t)) * 0.15
    return (sq + hp(rng.standard_normal(len(t))) * 0.2) * np.exp(-t * 25)


# ---------------- music bed ----------------
BPM = 100
BEAT = 60 / BPM
# D major family: Dmaj9 | Bm7 | Gmaj7 | A(add9)
CHORDS = [[50, 57, 62, 66, 69, 76], [47, 54, 62, 66, 69, 74], [43, 50, 59, 62, 66, 71], [45, 52, 57, 61, 64, 71]]


def pad(notes, t0, d, gain):
    t = tt(d); y = np.zeros(len(t))
    for m in notes:
        f = note(m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            y += (np.sin(2 * np.pi * ff * t) + 0.25 * np.sin(2 * np.pi * 2 * ff * t) + 0.1 * np.sin(2 * np.pi * 3 * ff * t))
    a = 0.6; r = 0.8
    e = np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1)
    y = lowpass(y * e, 1800)
    add(y / len(notes) * gain, t0, 1.0, -0.2)
    add(y / len(notes) * gain, t0 + 0.012, 1.0, 0.2)


def pluck(m, t0, gain, pan):
    d = 0.9; t = tt(d); f = note(m)
    y = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 14))
    y *= np.exp(-t * 5.5) * np.minimum(1, t / 0.003)
    add(y * gain, t0, 1.0, pan)


def kick(t0, gain):
    d = 0.35; t = tt(d)
    f = 45 + 90 * np.exp(-t * 35)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    add(y * gain, t0)


def hat(t0, gain, pan):
    d = 0.06; n = hp(hp(rng.standard_normal(int(d * SR)))) * np.exp(-tt(d) * 70)
    add(n * gain, t0, 1.0, pan)


# problem section: tense drone + notification blips + glitches
t = tt(3.6)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 58.3 * t) + 0.3 * np.sin(2 * np.pi * 110.5 * t)) * np.minimum(1, t / 0.4) * np.clip((3.6 - t) / 0.5, 0, 1)
add(lowpass(drone, 400) * 0.18, 0.0)
for i, f in enumerate([880, 988, 784, 1046, 932, 698]):
    add(blip(f), 0.05 + i * 0.14 + 0.12, 1.0, (-0.6 + i * 0.24))
for g in (1.1, 1.75, 2.2, 2.45):
    add(glitch(), g, 0.6, rng.uniform(-0.5, 0.5))
add(riser(1.0), 2.55, 0.9)
add(whoosh(0.7, 200, 6000), 2.9, 0.9)

# logo hit
add(boom(), 3.5, 0.85)
add(chime(74, 3.2), 3.52, 0.7)

# music from 4.4 to ~36.6
m0 = 4.4
bar = 4 * BEAT
cycle_len = 2 * bar
k = 0
tcur = m0
while tcur < 36.4:
    ch = CHORDS[k % 4]
    pad(ch, tcur, min(cycle_len + 0.6, 37.2 - tcur), 0.16)
    # plucked arpeggio, 8th notes
    arp = [ch[2], ch[3], ch[4], ch[5], ch[4], ch[3]]
    for s in range(16):
        ts = tcur + s * BEAT / 2
        if ts > 36.2 or ts < 6.2:
            continue
        pluck(arp[s % len(arp)] + 12, ts, 0.05 if s % 2 else 0.065, -0.35 if s % 4 < 2 else 0.35)
    for b in range(8):
        tb = tcur + b * BEAT
        if 6.2 <= tb < 36.0:
            kick(tb, 0.22 if b % 2 == 0 else 0.12)
            hat(tb + BEAT / 2, 0.05, 0.3)
    tcur += cycle_len
    k += 1

# UI sound effects from the video timeline
for c in TL["clicks"]:
    add(click(), c, 0.55)
prev = None
for key, t0, ty in TL["states"]:
    if t0 < 6:
        continue
    if ty == "modal":
        add(pop(), t0 - 0.02, 0.8)
    elif ty == "scroll":
        pass
    else:
        add(whoosh(0.38, 400, 3500), t0 - 0.12, 0.35, 0.2)
for s in TL["scrolls"]:
    add(scroll_sfx(), s, 0.8)
for h in TL["highlights"]:
    add(tick_hl(), h[0], 0.9)
for st in TL["chain"]["steps"]:
    add(tick_hl(), st[0], 1.0)
for cap in TL["captions"]:
    add(whoosh(0.5, 250, 2500), cap[0] - 0.05, 0.25, -0.3)

# finale
add(riser(1.4), 35.6, 0.8)
add(whoosh(0.8, 200, 5000), 36.2, 0.7)
add(boom(2.4), 37.0, 0.8)
add(chime(74, 3.0), 37.02, 0.85)
pad([50, 57, 62, 66, 69, 74, 78], 37.0, 3.0, 0.2)

# master: gentle limiter + fades
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
peak = np.abs(mix).max()
mix = mix / peak * 0.89
fade = np.ones(N)
fi = int(0.05 * SR); fo = int(0.6 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]
pcm = (mix * 32767).astype(np.int16)
with wave.open(str(D / "soundtrack40.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", DUR, "s")
