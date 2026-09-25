import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'doubling-n',
    question: {
      en: 'You double the signal length N. How does the operation count change for each method?',
      th: 'ถ้าเพิ่มความยาวสัญญาณ N เป็นสองเท่า จำนวนการดำเนินการของแต่ละวิธีจะเปลี่ยนไปอย่างไร?',
    },
    options: [
      {
        id: 'a',
        label: { en: 'Both roughly double', th: 'ทั้งสองวิธีเพิ่มขึ้นประมาณสองเท่า' },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'Direct roughly quadruples; FFT barely more than doubles',
          th: 'วิธีตรงเพิ่มขึ้นประมาณสี่เท่า ส่วน FFT เพิ่มขึ้นมากกว่าสองเท่าเพียงเล็กน้อย',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'Direct doubles; FFT quadruples', th: 'วิธีตรงเพิ่มสองเท่า FFT เพิ่มสี่เท่า' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Neither changes', th: 'ไม่เปลี่ยนทั้งคู่' },
        correct: false,
      },
    ],
  },
  {
    id: 'complexity-class',
    question: {
      en: 'Direct convolution of two length-N signals costs O(N²). FFT-based convolution costs approximately:',
      th: 'คอนโวลูชันแบบตรงของสัญญาณยาว N สองตัวใช้ O(N²) คอนโวลูชันแบบใช้ FFT ใช้ประมาณ:',
    },
    options: [
      {
        id: 'a',
        label: { en: 'O(N²) also — the same order', th: 'O(N²) เช่นกัน — อันดับเดียวกัน' },
        correct: false,
      },
      { id: 'b', label: { en: 'O(N log N)', th: 'O(N log N)' }, correct: true },
      { id: 'c', label: { en: 'O(N)', th: 'O(N)' }, correct: false },
      { id: 'd', label: { en: 'O(log N)', th: 'O(log N)' }, correct: false },
    ],
  },
  {
    id: 'why-they-agree',
    question: {
      en: 'Why do the direct and FFT-based paths produce (almost) identical output?',
      th: 'ทำไมเส้นทางแบบตรงและแบบใช้ FFT จึงให้ผลลัพธ์ที่ (แทบ) เหมือนกัน?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: "They don't — the FFT path is only an approximation",
          th: 'ไม่เหมือนกัน — เส้นทาง FFT เป็นแค่ค่าประมาณ',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'Multiplying spectra and taking the inverse FFT is mathematically equivalent to convolving in time; floating-point error is the only difference',
          th: 'การคูณสเปกตรัมแล้วทำ FFT ผกผัน สมมูลทางคณิตศาสตร์กับการคอนโวลูชันในโดเมนเวลา ความต่างมีเพียงค่าคลาดเคลื่อนจากเลขทศนิยมลอยตัว',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'The FFT path secretly falls back to direct convolution',
          th: 'เส้นทาง FFT แอบกลับไปใช้คอนโวลูชันแบบตรง',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'They only agree when N is a power of two',
          th: 'จะตรงกันเฉพาะเมื่อ N เป็นกำลังของสอง',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'crossover',
    question: {
      en: 'As N grows very large, which method eventually wins on operation count?',
      th: 'เมื่อ N มีค่ามากขึ้นเรื่อย ๆ วิธีใดใช้จำนวนการดำเนินการน้อยกว่าในที่สุด?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Direct convolution — fewer steps per element',
          th: 'คอนโวลูชันแบบตรง — ใช้ขั้นตอนต่อสมาชิกน้อยกว่า',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'FFT-based convolution, because O(N log N) grows far slower than O(N²)',
          th: 'คอนโวลูชันแบบใช้ FFT เพราะ O(N log N) เพิ่มขึ้นช้ากว่า O(N²) มาก',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'They stay tied forever', th: 'เท่ากันตลอดไป' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Neither — cost is independent of N',
          th: 'ไม่มี — ต้นทุนไม่ขึ้นกับ N',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'output-length',
    question: {
      en: 'Both paths convolve two length-N signals (x and h are the same length here). What is the length of the result?',
      th: 'ทั้งสองเส้นทางคอนโวลูชันสัญญาณยาว N สองตัว (ในที่นี้ x และ h ยาวเท่ากัน) ผลลัพธ์ยาวเท่าใด?',
    },
    options: [
      { id: 'a', label: { en: 'N', th: 'N' }, correct: false },
      { id: 'b', label: { en: '2N − 1', th: '2N − 1' }, correct: true },
      { id: 'c', label: { en: 'N²', th: 'N²' }, correct: false },
      { id: 'd', label: { en: 'N / 2', th: 'N / 2' }, correct: false },
    ],
  },
];
