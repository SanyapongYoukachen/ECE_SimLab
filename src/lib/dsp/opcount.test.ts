import { describe, it, expect } from 'vitest';
import { directConvOps, fftConvOps } from './opcount';

describe('operation counts', () => {
  it('direct convolution is exactly n * m', () => {
    expect(directConvOps(100, 50)).toBe(5000);
  });

  it('FFT convolution grows far slower than direct as length increases', () => {
    const sizes = [64, 256, 1024, 4096];
    const ratios = sizes.map((n) => fftConvOps(n, n) / directConvOps(n, n));
    // the ratio of FFT cost to direct cost should shrink as N grows
    for (let i = 1; i < ratios.length; i++) {
      expect(ratios[i]).toBeLessThan(ratios[i - 1]);
    }
  });

  it('FFT convolution is cheaper than direct convolution for large signals', () => {
    expect(fftConvOps(4096, 4096)).toBeLessThan(directConvOps(4096, 4096));
  });
});
