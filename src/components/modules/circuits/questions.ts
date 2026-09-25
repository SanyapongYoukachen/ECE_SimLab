import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'ohm-double-r',
    question: {
      en: 'A resistor sits across a fixed voltage V. You double R without changing V. What happens to the current I = V/R?',
      th: 'ตัวต้านทานต่อคร่อมแรงดันคงที่ V ถ้าเพิ่ม R เป็นสองเท่าโดยไม่เปลี่ยน V กระแส I = V/R จะเป็นอย่างไร?',
    },
    options: [
      { id: 'a', label: { en: 'It doubles', th: 'เพิ่มเป็นสองเท่า' }, correct: false },
      { id: 'b', label: { en: 'It stays the same', th: 'เท่าเดิม' }, correct: false },
      { id: 'c', label: { en: "It's cut in half", th: 'ลดลงครึ่งหนึ่ง' }, correct: true },
      { id: 'd', label: { en: 'It quadruples', th: 'เพิ่มเป็นสี่เท่า' }, correct: false },
    ],
  },
  {
    id: 'power-double-v',
    question: {
      en: 'You double the voltage V across a fixed resistor R. What happens to the power P = VI = V²/R?',
      th: 'ถ้าเพิ่มแรงดัน V ที่คร่อมตัวต้านทาน R ค่าคงที่เป็นสองเท่า กำลัง P = VI = V²/R จะเป็นอย่างไร?',
    },
    options: [
      { id: 'a', label: { en: 'It doubles', th: 'เพิ่มเป็นสองเท่า' }, correct: false },
      { id: 'b', label: { en: 'It quadruples', th: 'เพิ่มเป็นสี่เท่า' }, correct: true },
      { id: 'c', label: { en: 'It stays the same', th: 'เท่าเดิม' }, correct: false },
      { id: 'd', label: { en: "It's cut in half", th: 'ลดลงครึ่งหนึ่ง' }, correct: false },
    ],
  },
  {
    id: 'series-current',
    question: {
      en: 'Two resistors are in series across a battery. Which quantity is the SAME through both of them?',
      th: 'ตัวต้านทานสองตัวต่ออนุกรมกับแบตเตอรี่ ปริมาณใดที่ผ่านทั้งสองตัว "เท่ากัน"?',
    },
    options: [
      { id: 'a', label: { en: 'Voltage', th: 'แรงดัน' }, correct: false },
      { id: 'b', label: { en: 'Current', th: 'กระแส' }, correct: true },
      { id: 'c', label: { en: 'Power', th: 'กำลัง' }, correct: false },
      { id: 'd', label: { en: 'Resistance', th: 'ความต้านทาน' }, correct: false },
    ],
  },
  {
    id: 'parallel-voltage',
    question: {
      en: 'Two resistors are in parallel across a battery. Which quantity is the SAME across both of them?',
      th: 'ตัวต้านทานสองตัวต่อขนานกับแบตเตอรี่ ปริมาณใดที่คร่อมทั้งสองตัว "เท่ากัน"?',
    },
    options: [
      { id: 'a', label: { en: 'Current', th: 'กระแส' }, correct: false },
      { id: 'b', label: { en: 'Voltage', th: 'แรงดัน' }, correct: true },
      { id: 'c', label: { en: 'Power', th: 'กำลัง' }, correct: false },
      {
        id: 'd',
        label: { en: 'Equivalent resistance', th: 'ความต้านทานสมมูล' },
        correct: false,
      },
    ],
  },
  {
    id: 'divider-ratio',
    question: {
      en: 'In a voltage divider (R1 on top, R2 on bottom, Vout tapped between them), if R2 is much larger than R1, Vout is:',
      th: 'ในวงจรแบ่งแรงดัน (R1 อยู่บน R2 อยู่ล่าง และแยก Vout ออกระหว่างทั้งสอง) ถ้า R2 มีค่ามากกว่า R1 มาก Vout จะมีค่า:',
    },
    options: [
      { id: 'a', label: { en: 'Close to 0 V', th: 'ใกล้ 0 V' }, correct: false },
      {
        id: 'b',
        label: {
          en: 'Close to the full source voltage V',
          th: 'ใกล้เคียงแรงดันแหล่งจ่าย V ทั้งหมด',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'Always exactly V/2, regardless of R1 and R2',
          th: 'เท่ากับ V/2 พอดีเสมอ ไม่ว่า R1 และ R2 จะเป็นเท่าใด',
        },
        correct: false,
      },
      { id: 'd', label: { en: 'Undefined', th: 'หาค่าไม่ได้' }, correct: false },
    ],
  },
];
