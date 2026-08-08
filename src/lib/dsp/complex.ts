/**
 * Minimal complex number arithmetic used by tests, spectrum analysis, and
 * anywhere a single complex value (rather than a bulk re/im array pair) is
 * convenient. The FFT itself operates on parallel Float64Arrays for speed
 * and does not use this type.
 */
export interface Complex {
  readonly re: number;
  readonly im: number;
}

export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function div(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function conjugate(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

export function magnitude(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function phase(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function fromPolar(r: number, theta: number): Complex {
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}
