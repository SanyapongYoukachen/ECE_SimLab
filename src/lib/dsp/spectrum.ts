import { fft, nextPow2, zeroPad } from './fft';
import { coherentGain, makeWindow, type WindowType } from './window';

export interface MagnitudeSpectrum {
  /** One-sided frequency bins, in Hz, length = nfft/2 + 1 */
  readonly freqs: Float64Array;
  /** Amplitude-calibrated magnitude at each bin */
  readonly mag: Float64Array;
  /** FFT length actually used (signal zero-padded up to this) */
  readonly nfft: number;
  /** Frequency spacing between bins, in Hz (== freqs[1]) */
  readonly binSpacing: number;
  /** Nyquist frequency, in Hz */
  readonly nyquist: number;
}

/**
 * Windowed, amplitude-calibrated one-sided magnitude spectrum.
 *
 * The window is applied to the original (unpadded) signal, then the result
 * is zero-padded to the next power of two for the FFT. Magnitudes are
 * divided by the window's coherent gain and scaled by 2/N (1/N at DC and
 * Nyquist) so that, for the default rectangular window, a sinusoid sitting
 * exactly on a bin reads back at its true input amplitude.
 */
export function magnitudeSpectrum(
  signal: readonly number[],
  sampleRate: number,
  window: WindowType = 'rect'
): MagnitudeSpectrum {
  const n = signal.length;
  const nfft = nextPow2(Math.max(n, 1));
  const w = makeWindow(window, n);
  const gain = coherentGain(w) || 1;

  const windowed = new Array<number>(n);
  for (let i = 0; i < n; i++) windowed[i] = signal[i] * w[i];

  const re = zeroPad(windowed, nfft);
  const im = new Float64Array(nfft);
  fft(re, im);

  const half = nfft / 2;
  const freqs = new Float64Array(half + 1);
  const mag = new Float64Array(half + 1);
  const binSpacing = sampleRate / nfft;

  for (let k = 0; k <= half; k++) {
    freqs[k] = k * binSpacing;
    const m = Math.hypot(re[k], im[k]);
    const scale = k === 0 || k === half ? 1 / (nfft * gain) : 2 / (nfft * gain);
    mag[k] = m * scale;
  }

  return { freqs, mag, nfft, binSpacing, nyquist: sampleRate / 2 };
}
