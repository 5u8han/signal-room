#!/usr/bin/env python3
"""Render the original After Hours Radio track with Python and FFmpeg."""

from array import array
from math import cos, exp, pi, sin, sqrt, tau
from pathlib import Path
from random import Random
from subprocess import run
from tempfile import TemporaryDirectory
import sys
import wave


RATE = 44100
BEAT = .75
BARS = 16
DURATION = int(BARS * 4 * BEAT)
FRAMES = RATE * DURATION
ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "dist/assets/music/late-shift.mp3"


def frequency(note):
    return 440 * 2 ** ((note - 69) / 12)


def voice(note, length, instrument):
    count = round(length * RATE)
    increment = tau * frequency(note) / RATE
    attack = {"pad": .65, "bass": .018, "glass": .011}[instrument]
    release = {"pad": 1.2, "bass": .12, "glass": .15}[instrument]
    for index in range(count):
        seconds = index / RATE
        phase = increment * index
        envelope = min(1, seconds / attack, (length - seconds) / release)
        if instrument == "pad":
            color = .65 * sin(phase) + .22 * sin(phase * 1.0028) + .10 * sin(phase * 2) + .035 * sin(phase * 3)
            envelope *= envelope * (.86 + .14 * sin(tau * .19 * seconds + note))
        elif instrument == "glass":
            color = sin(phase + .72 * sin(phase * 2.006)) + .16 * sin(phase * 3)
            envelope *= exp(-4.2 * seconds)
        else:
            color = sin(phase) + .19 * sin(phase * 2) + .055 * sin(phase * 3)
            envelope *= exp(-1.5 * seconds)
        yield color * envelope


def percussion(length, instrument, noise):
    previous = 0
    for index in range(round(length * RATE)):
        seconds = index / RATE
        attack = min(1, seconds / .005)
        if instrument == "kick":
            pitch = 47 * seconds + 1.18 * (1 - exp(-seconds * 42))
            value = sin(tau * pitch) * exp(-seconds * 12)
        else:
            sample = noise.uniform(-1, 1)
            value = (sample - previous * .88) * exp(-seconds * 30)
            previous = sample
        yield value * attack


def render():
    left = array("f", [0]) * FRAMES
    right = array("f", [0]) * FRAMES
    noise = Random(315)

    def mix(samples, start, level, pan):
        cursor = round(start * RATE) % FRAMES
        gain_left = level * cos((pan + 1) * pi / 4)
        gain_right = level * sin((pan + 1) * pi / 4)
        for value in samples:
            left[cursor] += value * gain_left
            right[cursor] += value * gain_right
            cursor += 1
            if cursor == FRAMES:
                cursor = 0

    chords = (
        (38, (53, 57, 60, 64), (69, 72, 76, 74)),
        (34, (53, 57, 60, 65), (72, 69, 65, 67)),
        (41, (52, 55, 57, 60), (72, 76, 79, 76)),
        (36, (52, 55, 62, 67), (67, 74, 72, 69)),
    )

    for phrase in range(BARS // 2):
        bass, chord, melody = chords[phrase % len(chords)]
        start = phrase * 8 * BEAT
        for index, note in enumerate(chord):
            mix(voice(note, 7.3, "pad"), start - .55 + .07 * index, .075, -.62 + .41 * index)
        for offset, note in ((0, bass), (2.5, bass + 12), (4, bass), (6, bass + 7)):
            mix(voice(note, .80, "bass"), start + offset * BEAT, .15, 0)
        for index, (offset, note) in enumerate(zip((.5, 2.25, 4.75, 6.5), melody)):
            if phrase == 0 and index == 3:
                continue
            pluck = tuple(voice(note, .95, "glass"))
            level = .105 if phrase < 4 else .13
            mix(pluck, start + offset * BEAT, level, -.28)
            mix(pluck, start + (offset + .75) * BEAT, level * .22, .64)
            mix(pluck, start + (offset + 1.5) * BEAT, level * .10, -.55)

    for bar in range(BARS):
        start = bar * 4 * BEAT
        for offset in ((0, 2.5) if bar % 4 != 3 else (0, 2.5, 3.5)):
            mix(percussion(.35, "kick", noise), start + offset * BEAT, .16, 0)
        for index, offset in enumerate((.5, 1.5, 2.5, 3.5)):
            mix(percussion(.11, "hat", noise), start + offset * BEAT, .028 - (index % 2) * .009, -.34 + .22 * index)

    peak = max(max(abs(value) for value in left), max(abs(value) for value in right))
    gain = .72 / peak
    samples = array("h")
    for l, r in zip(left, right):
        samples.extend((round(l * gain * 32767), round(r * gain * 32767)))
    if sys.byteorder == "big":
        samples.byteswap()

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix="portfolio-radio-") as temporary:
        source = Path(temporary) / "late-shift.wav"
        with wave.open(str(source), "wb") as audio:
            audio.setparams((2, 2, RATE, 0, "NONE", "not compressed"))
            audio.writeframes(samples.tobytes())
        run([
            "ffmpeg", "-v", "error", "-y", "-i", str(source), "-c:a", "libmp3lame", "-b:a", "128k",
            "-map_metadata", "-1", "-metadata", "title=Late Shift", "-metadata", "artist=5u8han Radio",
            "-metadata", "album=After Hours Radio", str(DESTINATION),
        ], check=True)
    print(f"Rendered {DURATION}s of original stereo audio to {DESTINATION.name}")


if __name__ == "__main__":
    render()
