import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'mains-peak',
    question: {
      en: 'Thai household mains is "220 V". What is the peak voltage of that sine wave?',
      th: 'ไฟบ้านในประเทศไทยคือ "220 V" แรงดันยอดของคลื่นไซน์นี้คือเท่าใด?',
    },
    options: [
      { id: 'a', label: { en: '220 V', th: '220 V' }, correct: false },
      {
        id: 'b',
        label: { en: 'About 311 V (220 × √2)', th: 'ประมาณ 311 V (220 × √2)' },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'About 156 V (220 / √2)', th: 'ประมาณ 156 V (220 / √2)' },
        correct: false,
      },
      { id: 'd', label: { en: '440 V', th: '440 V' }, correct: false },
    ],
  },
  {
    id: 'square-rms',
    question: {
      en: 'A square wave swings between +10 V and −10 V. What is its RMS value?',
      th: 'คลื่นสี่เหลี่ยมแกว่งระหว่าง +10 V และ −10 V ค่าอาร์เอ็มเอสคือเท่าใด?',
    },
    options: [
      {
        id: 'a',
        label: { en: '7.07 V, since Vrms = Vp/√2', th: '7.07 V เพราะ Vrms = Vp/√2' },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: '10 V: v² is 100 V² at every instant, so its mean is 100 V²',
          th: '10 V: v² เท่ากับ 100 V² ทุกขณะ ค่าเฉลี่ยจึงเป็น 100 V²',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: '0 V, since its average is zero', th: '0 V เพราะค่าเฉลี่ยเป็นศูนย์' },
        correct: false,
      },
      { id: 'd', label: { en: '5.77 V', th: '5.77 V' }, correct: false },
    ],
  },
  {
    id: 'inductor-lag',
    question: {
      en: 'An ideal inductor is connected across a sine-wave source. The current:',
      th: 'ตัวเหนี่ยวนำอุดมคติต่อคร่อมแหล่งจ่ายคลื่นไซน์ กระแสจะ:',
    },
    options: [
      {
        id: 'a',
        label: { en: 'Is in phase with the voltage', th: 'เฟสตรงกับแรงดัน' },
        correct: false,
      },
      {
        id: 'b',
        label: { en: 'Leads the voltage by 90°', th: 'นำหน้าแรงดัน 90°' },
        correct: false,
      },
      { id: 'c', label: { en: 'Lags the voltage by 90°', th: 'ล้าหลังแรงดัน 90°' }, correct: true },
      { id: 'd', label: { en: 'Is always zero', th: 'เป็นศูนย์เสมอ' }, correct: false },
    ],
  },
  {
    id: 'capacitor-power',
    question: {
      en: 'An ideal capacitor draws 2 A rms from a 220 V supply. What average (real) power does it consume?',
      th: 'ตัวเก็บประจุอุดมคติดึงกระแส 2 A rms จากแหล่งจ่าย 220 V กำลังไฟฟ้าเฉลี่ย (กำลังจริง) ที่ใช้คือเท่าใด?',
    },
    options: [
      { id: 'a', label: { en: '440 W', th: '440 W' }, correct: false },
      {
        id: 'b',
        label: {
          en: '0 W: energy stored each quarter cycle is returned the next; it is all reactive (440 var)',
          th: '0 W: พลังงานที่เก็บไว้ในแต่ละหนึ่งในสี่รอบจะถูกคืนในรอบถัดไป เป็นกำลังรีแอกทีฟทั้งหมด (440 var)',
        },
        correct: true,
      },
      { id: 'c', label: { en: '311 W', th: '311 W' }, correct: false },
      { id: 'd', label: { en: '220 W', th: '220 W' }, correct: false },
    ],
  },
  {
    id: 'resonance',
    question: {
      en: 'A series RLC circuit is driven exactly at its resonant frequency. Which is true?',
      th: 'วงจร RLC อนุกรมถูกขับที่ความถี่เรโซแนนซ์พอดี ข้อใดถูกต้อง?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'X_L = X_C, so Z = R, the current is largest and the power factor is 1',
          th: 'X_L = X_C ดังนั้น Z = R กระแสสูงสุด และตัวประกอบกำลังเท่ากับ 1',
        },
        correct: true,
      },
      { id: 'b', label: { en: 'The current is zero', th: 'กระแสเป็นศูนย์' }, correct: false },
      {
        id: 'c',
        label: { en: 'The current lags by 90°', th: 'กระแสล้าหลัง 90°' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'V_L and V_C can never exceed the source voltage',
          th: 'V_L และ V_C ไม่มีวันสูงกว่าแรงดันแหล่งจ่าย',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'pf-correction',
    question: {
      en: 'A motor (an RL load) runs at power factor 0.6 lagging. To raise its power factor toward 1, you connect:',
      th: 'มอเตอร์ (โหลด RL) ทำงานที่ตัวประกอบกำลัง 0.6 แบบล้าหลัง หากต้องการเพิ่มตัวประกอบกำลังให้เข้าใกล้ 1 ควรต่อ:',
    },
    options: [
      { id: 'a', label: { en: 'Another inductor', th: 'ตัวเหนี่ยวนำเพิ่มอีกตัว' }, correct: false },
      {
        id: 'b',
        label: {
          en: 'A capacitor, whose leading reactive power cancels the motor’s lagging Q',
          th: 'ตัวเก็บประจุ ซึ่งกำลังรีแอกทีฟแบบนำหน้าจะหักล้าง Q แบบล้าหลังของมอเตอร์',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'A larger resistor in series', th: 'ตัวต้านทานค่าสูงขึ้นต่ออนุกรม' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Nothing: power factor cannot change',
          th: 'ไม่มีทาง: ตัวประกอบกำลังเปลี่ยนไม่ได้',
        },
        correct: false,
      },
    ],
  },
];
