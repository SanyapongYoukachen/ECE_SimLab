import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'balance-current',
    question: {
      en: 'A Wheatstone bridge is balanced when R1·R4 = R2·R3. At balance, the current through the galvanometer is:',
      th: 'บริดจ์วีตสโตนจะสมดุลเมื่อ R1·R4 = R2·R3 ขณะสมดุล กระแสที่ไหลผ่านกัลวานอมิเตอร์มีค่า:',
    },
    options: [
      { id: 'a', label: { en: 'Zero', th: 'ศูนย์' }, correct: true },
      { id: 'b', label: { en: 'Maximum', th: 'สูงสุด' }, correct: false },
      {
        id: 'c',
        label: {
          en: 'Equal to the total supply current',
          th: 'เท่ากับกระแสรวมจากแหล่งจ่าย',
        },
        correct: false,
      },
      { id: 'd', label: { en: 'Undefined', th: 'หาค่าไม่ได้' }, correct: false },
    ],
  },
  {
    id: 'off-balance',
    question: {
      en: 'Starting from balance, you nudge R4 slightly higher (R1, R2, R3 unchanged). What happens to the galvanometer current?',
      th: 'เริ่มจากจุดสมดุล แล้วเพิ่ม R4 ขึ้นเล็กน้อย (R1, R2, R3 คงเดิม) กระแสผ่านกัลวานอมิเตอร์จะเป็นอย่างไร?',
    },
    options: [
      { id: 'a', label: { en: 'It stays zero', th: 'ยังคงเป็นศูนย์' }, correct: false },
      {
        id: 'b',
        label: {
          en: 'A small nonzero current appears, in one direction',
          th: 'มีกระแสเล็กน้อยที่ไม่เป็นศูนย์เกิดขึ้น ไหลไปในทิศทางหนึ่ง',
        },
        correct: true,
      },
      { id: 'c', label: { en: 'It becomes infinite', th: 'มีค่าเป็นอนันต์' }, correct: false },
      {
        id: 'd',
        label: {
          en: 'The bridge stops conducting entirely',
          th: 'บริดจ์หยุดนำไฟฟ้าทั้งหมด',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'rg-independence',
    question: {
      en: "Does the galvanometer's own resistance Rg affect where the balance point is?",
      th: 'ความต้านทานภายในของกัลวานอมิเตอร์ Rg มีผลต่อตำแหน่งจุดสมดุลหรือไม่?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Yes — a smaller Rg needs different resistor ratios',
          th: 'มี — Rg ที่เล็กลงต้องใช้อัตราส่วนตัวต้านทานที่ต่างออกไป',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: "No — the balance condition R1·R4 = R2·R3 doesn't depend on Rg at all",
          th: 'ไม่มี — เงื่อนไขสมดุล R1·R4 = R2·R3 ไม่ขึ้นกับ Rg เลย',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'Only if Rg exceeds 1 kΩ', th: 'มีผลเฉพาะเมื่อ Rg เกิน 1 kΩ' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Only for AC sources', th: 'มีผลเฉพาะกับแหล่งจ่ายไฟกระแสสลับ' },
        correct: false,
      },
    ],
  },
];
