/**
 * Attempt codes for the "check your understanding" quizzes: a short code
 * shown with a finished result that carries the result itself — module,
 * score, finish time and duration — sealed by a checksum that also covers
 * the student's name or ID. Paste it into /verify and the true result comes
 * back; if a screenshot's score, time or name was edited, they won't match.
 *
 * Everything runs in the browser, with no server keeping records, so this
 * is tamper-evident rather than tamper-proof: it catches edited screenshots
 * and borrowed results, not someone who reverse-engineers this file.
 *
 * Layout (90 bits → 18 Crockford base-32 characters, XXXXXX-XXXXXX-XXXXXX):
 *   nonce 16 | module 3 | score 5 | total 5 | finished (min since 2025) 24 |
 *   duration (s) 17 | checksum 20
 * Everything after the nonce is XOR-scrambled with a stream seeded by it,
 * so two attempts never share visible patterns.
 */

/** Quiz module IDs (the ModuleTabs `moduleId`s), by their 3-bit code. */
export const ATTEMPT_MODULES = [
  'convolution',
  'fourier',
  'ac',
  'circuits',
  'sensors',
  'simulator-wheatstone',
  'electronics',
] as const;

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
/** 2025-01-01T00:00:00Z, the zero of the finish-time field. */
const EPOCH_MS = Date.UTC(2025, 0, 1);
const SALT = 'ece-labsim/attempt/v1';

const FIELDS = { nonce: 16, module: 3, score: 5, total: 5, finished: 24, duration: 17, check: 20 };
const MAX_DURATION = 2 ** FIELDS.duration - 1;

export interface AttemptResult {
  readonly moduleId: string;
  readonly score: number;
  readonly total: number;
  /** Finish time, ms since the Unix epoch (stored to the minute). */
  readonly finishedAt: number;
  /** Seconds from the first answer to the last (capped at about 36 h). */
  readonly durationS: number;
}

export interface DecodedAttempt extends AttemptResult {
  /** True when the checksum matches the given name. */
  readonly valid: boolean;
}

/** Names compare loosely: case, spacing and surrounding whitespace don't matter. */
export function normalizeName(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** FNV-1a over UTF-16 code units, 32-bit. */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32: a tiny deterministic PRNG for the scrambling stream. */
function stream(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pushBits(bits: number[], value: number, width: number): void {
  for (let i = width - 1; i >= 0; i--) bits.push(Math.floor(value / 2 ** i) % 2);
}

function readBits(bits: readonly number[], start: number, width: number): number {
  let v = 0;
  for (let i = 0; i < width; i++) v = v * 2 + bits[start + i];
  return v;
}

function checksum(fields: readonly number[], name: string): number {
  return fnv1a(`${SALT}|${fields.join('.')}|${normalizeName(name)}`) % 2 ** FIELDS.check;
}

function scramble(bits: number[], nonce: number): void {
  const next = stream(nonce ^ 0x5bd1e995);
  for (let i = FIELDS.nonce; i < bits.length; i++) if (next() < 0.5) bits[i] ^= 1;
}

export function encodeAttempt(r: AttemptResult, name: string, nonce: number): string {
  const moduleCode = Math.max(
    0,
    ATTEMPT_MODULES.indexOf(r.moduleId as (typeof ATTEMPT_MODULES)[number])
  );
  const finished = Math.max(0, Math.round((r.finishedAt - EPOCH_MS) / 60000));
  const duration = Math.min(MAX_DURATION, Math.max(0, Math.round(r.durationS)));
  const fields = [nonce & 0xffff, moduleCode, r.score, r.total, finished, duration];
  const bits: number[] = [];
  pushBits(bits, fields[0], FIELDS.nonce);
  pushBits(bits, fields[1], FIELDS.module);
  pushBits(bits, Math.min(31, r.score), FIELDS.score);
  pushBits(bits, Math.min(31, r.total), FIELDS.total);
  pushBits(bits, finished % 2 ** FIELDS.finished, FIELDS.finished);
  pushBits(bits, duration, FIELDS.duration);
  pushBits(bits, checksum(fields, name), FIELDS.check);
  scramble(bits, fields[0]);
  let out = '';
  for (let i = 0; i < bits.length; i += 5) out += ALPHABET[readBits(bits, i, 5)];
  return `${out.slice(0, 6)}-${out.slice(6, 12)}-${out.slice(12)}`;
}

/** Decodes a code (case- and dash-insensitive; O→0, I/L→1). Null if it isn't an attempt code at all. */
export function decodeAttempt(code: string, name: string): DecodedAttempt | null {
  const clean = code.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (clean.length !== 18) return null;
  const bits: number[] = [];
  for (const ch of clean) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    pushBits(bits, v, 5);
  }
  const nonce = readBits(bits, 0, FIELDS.nonce);
  scramble(bits, nonce);
  let at = FIELDS.nonce;
  const take = (w: number): number => {
    const v = readBits(bits, at, w);
    at += w;
    return v;
  };
  const moduleCode = take(FIELDS.module);
  const score = take(FIELDS.score);
  const total = take(FIELDS.total);
  const finished = take(FIELDS.finished);
  const duration = take(FIELDS.duration);
  const check = take(FIELDS.check);
  const fields = [nonce, moduleCode, score, total, finished, duration];
  return {
    moduleId: ATTEMPT_MODULES[moduleCode] ?? 'unknown',
    score,
    total,
    finishedAt: EPOCH_MS + finished * 60000,
    durationS: duration,
    valid: check === checksum(fields, name) && score <= total && total > 0,
  };
}

/** A fresh 16-bit nonce for a new attempt. */
export function newNonce(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint16Array(1))[0];
  }
  return Math.floor(Math.random() * 65536);
}
