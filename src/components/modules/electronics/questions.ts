import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'depletion-forward',
    question: {
      en: 'What happens to a P/N junction’s depletion region under forward bias?',
      th: 'บริเวณปลอดพาหะ (depletion region) ของรอยต่อ P/N เป็นอย่างไรเมื่อได้รับไบแอสตรง?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'It narrows and the barrier drops, so carriers can diffuse across',
          th: 'แคบลงและกำแพงศักย์ลดลง พาหะจึงแพร่ข้ามรอยต่อได้',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'It widens and blocks the current', th: 'กว้างขึ้นและกั้นกระแส' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'It does not change', th: 'ไม่เปลี่ยนแปลง' },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'It fills with fixed ions that carry the current',
          th: 'เต็มไปด้วยไอออนที่อยู่กับที่ซึ่งนำกระแส',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'depletion-side',
    question: {
      en: 'A junction has Na = 10¹⁷ cm⁻³ on the P side and Nd = 10¹⁵ cm⁻³ on the N side. Where does the depletion region mostly lie?',
      th: 'รอยต่อมี Na = 10¹⁷ cm⁻³ ด้าน P และ Nd = 10¹⁵ cm⁻³ ด้าน N บริเวณปลอดพาหะอยู่ด้านใดเป็นส่วนใหญ่?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'In the lightly doped N side, since xp·Na = xn·Nd',
          th: 'ในด้าน N ที่โด๊ปเบา เพราะ xp·Na = xn·Nd',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'In the heavily doped P side', th: 'ในด้าน P ที่โด๊ปหนัก' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'Equally on both sides', th: 'เท่ากันทั้งสองด้าน' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Outside the junction', th: 'นอกรอยต่อ' },
        correct: false,
      },
    ],
  },
  {
    id: 'diode-drop',
    question: {
      en: 'A silicon diode and a 1 kΩ resistor are in series across 5 V, forward biased. Using the constant-drop model, the current is about:',
      th: 'ไดโอดซิลิคอนต่ออนุกรมกับตัวต้านทาน 1 kΩ คร่อม 5 V ในทิศไบแอสตรง ใช้แบบจำลองแรงดันตกคงที่ กระแสประมาณเท่าใด?',
    },
    options: [
      { id: 'a', label: { en: '4.3 mA', th: '4.3 mA' }, correct: true },
      { id: 'b', label: { en: '5.0 mA', th: '5.0 mA' }, correct: false },
      { id: 'c', label: { en: '0.7 mA', th: '0.7 mA' }, correct: false },
      { id: 'd', label: { en: '5.7 mA', th: '5.7 mA' }, correct: false },
    ],
  },
  {
    id: 'led-color',
    question: {
      en: 'Why does a blue LED need a higher forward voltage than a red one?',
      th: 'ทำไม LED สีน้ำเงินจึงต้องใช้แรงดันไบแอสตรงสูงกว่า LED สีแดง?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Its band gap is wider, so each emitted photon carries more energy',
          th: 'แถบช่องว่างพลังงานกว้างกว่า โฟตอนที่ปล่อยออกมาแต่ละตัวจึงมีพลังงานมากกว่า',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'Blue light is brighter', th: 'แสงสีน้ำเงินสว่างกว่า' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'Its resistor is larger', th: 'ตัวต้านทานของมันมีค่ามากกว่า' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'It is made of germanium', th: 'ทำจากเจอร์เมเนียม' },
        correct: false,
      },
    ],
  },
  {
    id: 'bjt-saturation',
    question: {
      en: 'An NPN transistor has β = 100 and IB = 100 µA, but RC and VCC only allow 5 mA. What is IC?',
      th: 'ทรานซิสเตอร์ NPN มี β = 100 และ IB = 100 µA แต่ RC และ VCC ยอมให้กระแสได้เพียง 5 mA กระแส IC เท่ากับเท่าใด?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'About 5 mA: it is saturated, VCE ≈ 0.2 V',
          th: 'ประมาณ 5 mA: ทรานซิสเตอร์อิ่มตัว VCE ≈ 0.2 V',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: '10 mA, since IC = β·IB', th: '10 mA เพราะ IC = β·IB' },
        correct: false,
      },
      { id: 'c', label: { en: '100 µA', th: '100 µA' }, correct: false },
      {
        id: 'd',
        label: { en: '0 A: it is cut off', th: '0 A: ทรานซิสเตอร์คัตออฟ' },
        correct: false,
      },
    ],
  },
  {
    id: 'bjt-switch',
    question: {
      en: 'To use a transistor as a switch that turns a load fully on, which regions do you drive it between?',
      th: 'ถ้าใช้ทรานซิสเตอร์เป็นสวิตช์เปิดปิดโหลด ต้องขับให้ทำงานระหว่างย่านใด?',
    },
    options: [
      {
        id: 'a',
        label: { en: 'Cutoff (off) and saturation (on)', th: 'คัตออฟ (ปิด) และอิ่มตัว (เปิด)' },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'Active region only', th: 'ย่านแอกทีฟเท่านั้น' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'Cutoff and active', th: 'คัตออฟและแอกทีฟ' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Reverse breakdown', th: 'การพังทลายย้อนกลับ' },
        correct: false,
      },
    ],
  },
  {
    id: 'amp-bypass',
    question: {
      en: 'In a common-emitter amplifier, removing the emitter bypass capacitor:',
      th: 'ในวงจรขยายแบบอิมิตเตอร์ร่วม การถอดตัวเก็บประจุบายพาสที่อิมิตเตอร์ออกจะ:',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Cuts the gain to about −RC/RE but makes it stable and less distorted',
          th: 'ลดอัตราขยายเหลือประมาณ −RC/RE แต่ทำให้เสถียรและผิดเพี้ยนน้อยลง',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'Raises the gain', th: 'เพิ่มอัตราขยาย' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'Changes the DC bias point', th: 'เปลี่ยนจุดไบแอสไฟตรง' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Stops the circuit from inverting', th: 'ทำให้วงจรไม่กลับเฟส' },
        correct: false,
      },
    ],
  },
  {
    id: 'amp-clipping',
    question: {
      en: 'An amplifier is biased with VCE = 9 V on a 12 V supply. As the input grows, which side of the output clips first?',
      th: 'วงจรขยายไบแอสไว้ที่ VCE = 9 V จากแหล่งจ่าย 12 V เมื่อเพิ่มสัญญาณอินพุต เอาต์พุตด้านใดจะถูกตัดยอดก่อน?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'The top, at cutoff: Q sits near cutoff, with little collector current to lose',
          th: 'ด้านบน ที่คัตออฟ: จุด Q อยู่ใกล้คัตออฟ มีกระแสคอลเลกเตอร์ให้ลดลงได้น้อย',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'The bottom, at saturation', th: 'ด้านล่าง ที่อิ่มตัว' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'Both at once, always', th: 'ทั้งสองด้านพร้อมกันเสมอ' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Neither: amplifiers never clip', th: 'ไม่มีด้านใด: วงจรขยายไม่เคยตัดยอด' },
        correct: false,
      },
    ],
  },
];
