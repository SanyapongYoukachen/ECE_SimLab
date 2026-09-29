import type { Phase } from '@/lib/circuits/generator';

/**
 * Fixed phase colours, the classic red–yellow–blue marking, darkened enough
 * to read on light and dark surfaces. Phases are identities, not data roles,
 * so they don't use the input/active/output tokens.
 */
export const PHASE_COLOR: Readonly<Record<Phase, string>> = {
  a: '#d64532',
  b: '#c98a0c',
  c: '#2f6fd6',
};

export const PHASE_LABEL: Readonly<Record<Phase, string>> = { a: 'A', b: 'B', c: 'C' };
