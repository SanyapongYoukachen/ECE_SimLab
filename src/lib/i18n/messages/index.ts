import type { Lang } from '../lang';
import { en, type Messages } from './en';
import { th } from './th';

export type { Messages };

export const MESSAGES: Readonly<Record<Lang, Messages>> = { en, th };
