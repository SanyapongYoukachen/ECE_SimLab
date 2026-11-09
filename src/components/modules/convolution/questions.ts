import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'length',
    question: {
      en: 'x has 5 samples and h has 3 samples. How many samples will y = x * h have?',
      th: 'x มี 5 แซมเปิล และ h มี 3 แซมเปิล y = x * h จะมีกี่แซมเปิล?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: '5 — output matches the input length',
          th: '5 — เอาต์พุตยาวเท่ากับอินพุต',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: '8 — output is the sum of both lengths',
          th: '8 — เอาต์พุตยาวเท่ากับผลรวมของความยาวทั้งสอง',
        },
        correct: false,
      },
      {
        id: 'c',
        label: { en: '7 — output is N + M − 1', th: '7 — เอาต์พุตยาว N + M − 1' },
        correct: true,
      },
      {
        id: 'd',
        label: {
          en: '3 — output matches the shorter kernel',
          th: '3 — เอาต์พุตยาวเท่ากับเคอร์เนลที่สั้นกว่า',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'commutative',
    question: {
      en: 'Does it matter which signal you call x and which you call h?',
      th: 'การเลือกว่าสัญญาณไหนเป็น x และสัญญาณไหนเป็น h มีผลหรือไม่?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Yes — swapping them changes the result',
          th: 'มี — สลับกันแล้วผลลัพธ์เปลี่ยน',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'No — x * h = h * x, convolution is commutative',
          th: 'ไม่มี — x * h = h * x เพราะคอนโวลูชันมีสมบัติการสลับที่',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'Only if both signals are the same length',
          th: 'มีผลเฉพาะเมื่อสัญญาณทั้งสองยาวเท่ากัน',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Only for the rectangular kernel',
          th: 'มีผลเฉพาะกับเคอร์เนลสี่เหลี่ยม',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'flip',
    question: {
      en: 'In y[n] = Σ x[k]·h[n−k], what happens to the kernel as n increases?',
      th: 'ใน y[n] = Σ x[k]·h[n−k] เมื่อ n เพิ่มขึ้น เคอร์เนลเป็นอย่างไร?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: "It's flipped once, then slid across the input",
          th: 'ถูกพลิกกลับครั้งเดียว แล้วเลื่อนผ่านอินพุต',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: "It's slid across the input, never flipped",
          th: 'ถูกเลื่อนผ่านอินพุตโดยไม่มีการพลิกกลับ',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: "It's flipped at every step but stays in place",
          th: 'ถูกพลิกกลับทุกขั้น แต่อยู่กับที่',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Nothing — only the input moves',
          th: 'ไม่เปลี่ยน — มีแต่อินพุตที่เคลื่อนที่',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'rect-kernel',
    question: {
      en: 'What does the rectangular kernel [0.33, 0.33, 0.33] compute at each shift?',
      th: 'เคอร์เนลสี่เหลี่ยม [0.33, 0.33, 0.33] คำนวณอะไรในแต่ละการเลื่อน?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A weighted average favouring the center sample',
          th: 'ค่าเฉลี่ยถ่วงน้ำหนักที่ให้ความสำคัญกับแซมเปิลตรงกลาง',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'An unweighted moving average of 3 samples',
          th: 'ค่าเฉลี่ยเคลื่อนที่แบบไม่ถ่วงน้ำหนักของ 3 แซมเปิล',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'The derivative of the input', th: 'อนุพันธ์ของอินพุต' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'The maximum of 3 neighbouring samples',
          th: 'ค่าสูงสุดของ 3 แซมเปิลที่อยู่ติดกัน',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'diff-kernel',
    question: {
      en: 'The difference kernel [1, −1] is convolved with a signal. What does the output show?',
      th: 'นำเคอร์เนลผลต่าง [1, −1] ไปคอนโวลูชันกับสัญญาณ เอาต์พุตแสดงอะไร?',
    },
    options: [
      {
        id: 'a',
        label: { en: 'A smoothed version of the input', th: 'อินพุตที่ถูกทำให้เรียบขึ้น' },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'A discrete derivative — it highlights changes between neighbouring samples',
          th: 'อนุพันธ์แบบไม่ต่อเนื่อง — เน้นการเปลี่ยนแปลงระหว่างแซมเปิลที่อยู่ติดกัน',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'The running sum of the input', th: 'ผลรวมสะสมของอินพุต' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'An exact copy of the input, shifted by one',
          th: 'สำเนาของอินพุตที่เลื่อนไปหนึ่งตำแหน่ง',
        },
        correct: false,
      },
    ],
  },
];
