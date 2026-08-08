import { describe, it, expect } from 'vitest';
import { magnitudeSpectrum } from './spectrum';

describe('magnitudeSpectrum', () => {
  it('reports correct bin spacing and Nyquist', () => {
    const n = 128;
    const sampleRate = 1000;
    const signal = new Array(n).fill(0);
    const { binSpacing, nyquist, nfft } = magnitudeSpectrum(signal, sampleRate);
    expect(nfft).toBe(128);
    expect(binSpacing).toBeCloseTo(sampleRate / 128, 9);
    expect(nyquist).toBeCloseTo(sampleRate / 2, 9);
  });

  it('recovers the amplitude of a sinusoid sitting exactly on a bin (rectangular window)', () => {
    const n = 128;
    const sampleRate = 128;
    const amplitude = 2.5;
    const binIndex = 10;
    const signal = Array.from(
      { length: n },
      (_, i) => amplitude * Math.cos((2 * Math.PI * binIndex * i) / n)
    );

    const { freqs, mag } = magnitudeSpectrum(signal, sampleRate, 'rect');

    expect(freqs[binIndex]).toBeCloseTo(binIndex, 6);
    expect(mag[binIndex]).toBeCloseTo(amplitude, 6);

    // energy should be concentrated at the bin, not smeared into neighbours
    expect(mag[binIndex - 1]).toBeLessThan(1e-6);
    expect(mag[binIndex + 1]).toBeLessThan(1e-6);
  });

  it('shows leakage into neighbouring bins for an off-bin sinusoid, reduced by windowing', () => {
    const n = 128;
    const sampleRate = 128;
    // 10.5 cycles over the observation window: exactly between two bins
    const signal = Array.from({ length: n }, (_, i) => Math.cos((2 * Math.PI * 10.5 * i) / n));

    const rect = magnitudeSpectrum(signal, sampleRate, 'rect');
    const blackman = magnitudeSpectrum(signal, sampleRate, 'blackman');

    // neighbouring bin (far from the peak) should leak less energy under Blackman than rectangular
    const farBin = 20;
    expect(blackman.mag[farBin]).toBeLessThan(rect.mag[farBin]);
  });
});
