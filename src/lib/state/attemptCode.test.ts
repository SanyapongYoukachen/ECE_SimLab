import { describe, it, expect } from 'vitest';
import { decodeAttempt, encodeAttempt, normalizeName, type AttemptResult } from './attemptCode';

const R: AttemptResult = {
  moduleId: 'electronics',
  score: 7,
  total: 8,
  finishedAt: Date.UTC(2026, 9, 8, 7, 9, 0),
  durationS: 401,
};

describe('attempt codes', () => {
  it('round-trips the result and verifies with the same name', () => {
    const code = encodeAttempt(R, 'Somchai 6510001', 12345);
    expect(code).toMatch(/^[0-9A-Z]{6}-[0-9A-Z]{6}-[0-9A-Z]{6}$/);
    const d = decodeAttempt(code, 'Somchai 6510001');
    expect(d).toEqual({ ...R, valid: true });
  });

  it('ignores case, spacing and dashes, and reads O/I/L as 0/1', () => {
    const code = encodeAttempt(R, 'Somchai  6510001', 999);
    expect(decodeAttempt(code.toLowerCase().replace(/-/g, ' '), ' somchai 6510001 ')?.valid).toBe(
      true
    );
    expect(normalizeName('  A  b ')).toBe('a b');
  });

  it('fails verification for a different name', () => {
    const code = encodeAttempt(R, 'Somchai', 1);
    expect(decodeAttempt(code, 'Somsak')?.valid).toBe(false);
  });

  it('detects any single edited character', () => {
    const code = encodeAttempt(R, 'Somchai', 4242).replace(/-/g, '');
    const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let caught = 0;
    let tried = 0;
    for (let i = 0; i < code.length; i++) {
      for (const ch of ['0', 'Z', 'M']) {
        if (code[i] === ch) continue;
        tried++;
        const edited = code.slice(0, i) + ch + code.slice(i + 1);
        if (!decodeAttempt(edited, 'Somchai')?.valid) caught++;
      }
    }
    expect(alphabet).toHaveLength(32);
    expect(caught).toBe(tried);
  });

  it('gives different codes to identical results (fresh nonce each attempt)', () => {
    expect(encodeAttempt(R, '', 1)).not.toBe(encodeAttempt(R, '', 2));
  });

  it('rejects things that are not codes', () => {
    expect(decodeAttempt('hello', '')).toBeNull();
    expect(decodeAttempt('UUUUUU-UUUUUU-UUUUUU', '')).toBeNull();
  });
});
