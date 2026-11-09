import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'off-bin',
    question: {
      en: "You slide component 3's frequency so it lands exactly between two FFT bins. What happens in the spectrum?",
      th: 'คุณเลื่อนความถี่ขององค์ประกอบที่ 3 ให้ไปอยู่กึ่งกลางระหว่างสองบินของ FFT พอดี สเปกตรัมจะเป็นอย่างไร?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A single peak, just shifted to the nearest bin',
          th: 'มียอดเดียว แค่ย้ายไปอยู่ที่บินที่ใกล้ที่สุด',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'Energy spreads across several neighbouring bins',
          th: 'พลังงานกระจายไปยังหลายบินที่อยู่ใกล้เคียง',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'The peak disappears entirely', th: 'ยอดหายไปทั้งหมด' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Nothing changes — bins are continuous',
          th: 'ไม่มีอะไรเปลี่ยน — บินมีความต่อเนื่อง',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'on-bin',
    question: {
      en: 'A sinusoid whose frequency lands exactly on an FFT bin centre produces:',
      th: 'สัญญาณไซน์ที่มีความถี่ตรงกับกึ่งกลางบินของ FFT พอดี จะให้ผลเป็น:',
    },
    options: [
      {
        id: 'a',
        label: { en: 'A single, clean spectral peak', th: 'ยอดสเปกตรัมเดียวที่คมชัด' },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'Energy smeared across many bins', th: 'พลังงานกระจายไปทั่วหลายบิน' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'No peak at all', th: 'ไม่มียอดเลย' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'A peak that drifts on every redraw',
          th: 'ยอดที่เลื่อนตำแหน่งทุกครั้งที่วาดใหม่',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'window-tradeoff',
    question: {
      en: 'Why apply a window (Hann, Hamming, Blackman) before the FFT instead of leaving the signal rectangular?',
      th: 'ทำไมจึงใช้ฟังก์ชันหน้าต่าง (Hann, Hamming, Blackman) ก่อนทำ FFT แทนที่จะปล่อยสัญญาณเป็นหน้าต่างสี่เหลี่ยม?',
    },
    options: [
      {
        id: 'a',
        label: { en: 'It removes leakage completely', th: 'กำจัดการรั่วไหลได้หมด' },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'It reduces sidelobe leakage, at the cost of a slightly wider main lobe',
          th: 'ลดการรั่วไหลในไซด์โลบ แลกกับโลบหลักที่กว้างขึ้นเล็กน้อย',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'It increases the effective sample rate',
          th: 'เพิ่มอัตราการสุ่มตัวอย่างที่ได้ผลจริง',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'It forces every frequency to land exactly on a bin',
          th: 'บังคับให้ทุกความถี่ตกตรงบินพอดี',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'nyquist',
    question: {
      en: 'The sample rate is 8000 Hz. What is the highest frequency the spectrum can represent (the Nyquist limit)?',
      th: 'อัตราการสุ่มตัวอย่างคือ 8000 Hz ความถี่สูงสุดที่สเปกตรัมแสดงได้ (ขีดจำกัดไนควิสต์) คือเท่าใด?',
    },
    options: [
      { id: 'a', label: { en: '8000 Hz', th: '8000 Hz' }, correct: false },
      { id: 'b', label: { en: '4000 Hz', th: '4000 Hz' }, correct: true },
      { id: 'c', label: { en: '2000 Hz', th: '2000 Hz' }, correct: false },
      { id: 'd', label: { en: '16000 Hz', th: '16000 Hz' }, correct: false },
    ],
  },
  {
    id: 'rect-window',
    question: {
      en: 'What is the "rectangular window" actually doing to the signal?',
      th: '"หน้าต่างสี่เหลี่ยม" ทำอะไรกับสัญญาณจริง ๆ?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A special taper that eliminates leakage',
          th: 'เป็นการลดขอบแบบพิเศษที่กำจัดการรั่วไหล',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'Nothing — it is no window at all, just a hard cutoff at the edges of the observation, which is what causes leakage in the first place',
          th: 'ไม่ได้ทำอะไร — มันคือการไม่ใช้หน้าต่างเลย เป็นแค่การตัดสัญญาณทันทีที่ขอบของช่วงสังเกต ซึ่งเป็นต้นเหตุของการรั่วไหลตั้งแต่แรก',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'It only affects amplitude 1’s component',
          th: 'มีผลเฉพาะกับองค์ประกอบของแอมพลิจูด 1',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'It is mathematically identical to the Hann window',
          th: 'ในทางคณิตศาสตร์เหมือนกับหน้าต่าง Hann ทุกประการ',
        },
        correct: false,
      },
    ],
  },
];
