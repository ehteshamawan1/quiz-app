#!/usr/bin/env python3
"""
Sound Generation Script for Quiz App
Generates 4 WAV sound files using scipy and numpy
"""

import os
import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 44100  # Hz
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "sounds")
RNG = np.random.default_rng(42)

os.makedirs(OUTPUT_DIR, exist_ok=True)


def time_array(duration):
    return np.linspace(0, duration, int(SAMPLE_RATE * duration), False)


def sine(frequency, duration, phase=0.0):
    t = time_array(duration)
    return np.sin(2 * np.pi * frequency * t + phase)


def square(frequency, duration):
    return np.sign(sine(frequency, duration))


def noise(duration):
    return RNG.standard_normal(int(SAMPLE_RATE * duration))


def apply_envelope(signal, attack=0.01, decay=0.01, sustain_level=0.7, release=0.05):
    length = len(signal)
    envelope = np.ones(length)

    attack_samples = int(attack * SAMPLE_RATE)
    decay_samples = int(decay * SAMPLE_RATE)
    release_samples = int(release * SAMPLE_RATE)
    sustain_samples = length - attack_samples - decay_samples - release_samples

    if sustain_samples < 0:
        return signal * np.linspace(0, 1, length)

    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    envelope[attack_samples:attack_samples + decay_samples] = np.linspace(1, sustain_level, decay_samples)
    envelope[attack_samples + decay_samples:attack_samples + decay_samples + sustain_samples] = sustain_level
    envelope[-release_samples:] = np.linspace(sustain_level, 0, release_samples)

    return signal * envelope


def normalize(signal, target_amplitude=0.45):
    max_val = np.max(np.abs(signal))
    if max_val > 0:
        signal = signal * (target_amplitude / max_val)
    return signal


def save_wav(filename, signal):
    signal_int16 = np.int16(signal * 32767)
    filepath = os.path.join(OUTPUT_DIR, filename)
    wavfile.write(filepath, SAMPLE_RATE, signal_int16)
    print(f"[OK] Generated: {filename}")


def highpass(signal, window=101):
    if window < 3:
        return signal
    kernel = np.ones(window) / window
    low = np.convolve(signal, kernel, mode="same")
    return signal - low


def bell_tone(frequency, duration, bright=1.0):
    t = time_array(duration)
    partials = [
        (1.0, 1.8),
        (0.6 * bright, 2.9),
        (0.35 * bright, 4.6),
        (0.2 * bright, 6.8)
    ]
    tone = np.zeros_like(t)
    for amp, decay in partials:
        tone += amp * np.sin(2 * np.pi * frequency * t) * np.exp(-decay * t)
    return tone


def brass_tone(frequency, duration):
    t = time_array(duration)
    tone = np.zeros_like(t)
    for n in range(1, 7):
        tone += (1.0 / n) * np.sin(2 * np.pi * frequency * n * t)
    return tone


def add_signal(base, addition, start_time):
    start = int(start_time * SAMPLE_RATE)
    end = min(len(base), start + len(addition))
    if end <= start:
        return base
    base[start:end] += addition[:end - start]
    return base


def generate_click():
    duration = 0.09
    signal = np.zeros(int(SAMPLE_RATE * duration))

    pop = sine(2200, 0.03)
    pop = apply_envelope(pop, attack=0.001, decay=0.01, sustain_level=0.4, release=0.015)
    add_signal(signal, pop, 0.0)

    thump = sine(180, 0.06)
    thump = apply_envelope(thump, attack=0.002, decay=0.015, sustain_level=0.3, release=0.03)
    add_signal(signal, thump, 0.0)

    burst = noise(0.02)
    burst = highpass(burst, 41)
    burst = apply_envelope(burst, attack=0.001, decay=0.005, sustain_level=0.2, release=0.01)
    add_signal(signal, burst, 0.0)

    signal = normalize(signal, 0.6)
    save_wav("click.wav", signal)


def generate_correct():
    duration = 0.8
    signal = np.zeros(int(SAMPLE_RATE * duration))

    freqs = [523.25, 659.25, 783.99, 1046.5]
    for i, freq in enumerate(freqs):
        note = bell_tone(freq, 0.45, bright=1.1)
        note = apply_envelope(note, attack=0.01, decay=0.05, sustain_level=0.7, release=0.2)
        add_signal(signal, note, i * 0.06)

    ping = bell_tone(1318.5, 0.18, bright=1.3)
    ping = apply_envelope(ping, attack=0.005, decay=0.04, sustain_level=0.4, release=0.12)
    add_signal(signal, ping, 0.42)

    signal = normalize(signal, 0.55)
    save_wav("correct.wav", signal)


def generate_wrong():
    duration = 0.55
    t = time_array(duration)
    start_freq = 190
    end_freq = 120
    sweep = start_freq + (end_freq - start_freq) * (t / duration)
    phase = 2 * np.pi * np.cumsum(sweep) / SAMPLE_RATE

    buzz = np.sign(np.sin(phase))
    tremolo = 0.65 + 0.35 * np.sin(2 * np.pi * 8 * t)
    buzz = buzz * tremolo

    rumble = 0.4 * np.sin(phase * 0.5)
    signal = buzz + rumble
    signal = apply_envelope(signal, attack=0.01, decay=0.08, sustain_level=0.7, release=0.25)
    signal = normalize(signal, 0.55)
    save_wav("wrong.wav", signal)


def generate_celebration():
    duration = 1.6
    signal = np.zeros(int(SAMPLE_RATE * duration))

    fanfare_notes = [523.25, 659.25, 783.99, 1046.5]
    for i, freq in enumerate(fanfare_notes):
        note = brass_tone(freq, 0.35)
        note = apply_envelope(note, attack=0.01, decay=0.05, sustain_level=0.8, release=0.2)
        add_signal(signal, note, i * 0.08)

    sparkle = bell_tone(1568.0, 0.25, bright=1.4)
    sparkle = apply_envelope(sparkle, attack=0.004, decay=0.06, sustain_level=0.4, release=0.18)
    add_signal(signal, sparkle, 0.5)

    applause = np.zeros(int(SAMPLE_RATE * duration))
    for _ in range(50):
        burst_time = RNG.uniform(0.25, 1.55)
        burst = noise(0.05)
        burst = highpass(burst, 61)
        burst = apply_envelope(burst, attack=0.001, decay=0.01, sustain_level=0.3, release=0.03)
        burst *= RNG.uniform(0.15, 0.5)
        add_signal(applause, burst, burst_time)
    signal += applause

    cheer = noise(duration)
    cheer = highpass(cheer, 101)
    cheer_env = apply_envelope(np.ones_like(cheer), attack=0.2, decay=0.2, sustain_level=0.4, release=0.5)
    signal += cheer * cheer_env * 0.08

    signal = normalize(signal, 0.6)
    save_wav("celebration.wav", signal)


if __name__ == "__main__":
    print("Generating sound effects...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    generate_click()
    generate_correct()
    generate_wrong()
    generate_celebration()

    print("\n[OK] All sound effects generated successfully!")
    print("  - click.wav (0.09s)")
    print("  - correct.wav (0.8s)")
    print("  - wrong.wav (0.55s)")
    print("  - celebration.wav (1.6s)")
