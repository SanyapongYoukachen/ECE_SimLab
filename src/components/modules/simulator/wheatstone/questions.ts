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
  {
    id: 'sensor-arm-polarity',
    question: {
      en: 'In sensing mode, you move the sensor from R4 to R3 without changing its reading. What happens to the bridge output VB − VC?',
      th: 'ในโหมดตรวจวัด ถ้าย้ายเซนเซอร์จาก R4 ไปที่ R3 โดยค่าที่อ่านได้ไม่เปลี่ยน เอาต์พุตบริดจ์ VB − VC จะเป็นอย่างไร?',
    },
    options: [
      {
        id: 'a',
        label: { en: 'Nothing — the sensor is the same', th: 'ไม่เปลี่ยน — เป็นเซนเซอร์ตัวเดิม' },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'It flips sign: R3 sits on the opposite side of the balance condition from R4',
          th: 'กลับเครื่องหมาย: R3 อยู่คนละฝั่งของเงื่อนไขสมดุลกับ R4',
        },
        correct: true,
      },
      {
        id: 'c',
        label: { en: 'It doubles', th: 'เพิ่มเป็นสองเท่า' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'It drops to zero', th: 'ลดลงเป็นศูนย์' },
        correct: false,
      },
    ],
  },
  {
    id: 'why-bridge-strain',
    question: {
      en: 'A strain gauge changes resistance by only 0.2 % at 1000 µε. Why read it with a bridge rather than measuring its resistance directly?',
      th: 'สเตรนเกจเปลี่ยนความต้านทานเพียง 0.2 % ที่ 1000 µε ทำไมจึงอ่านค่าด้วยวงจรบริดจ์ แทนที่จะวัดความต้านทานโดยตรง?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'The bridge amplifies the resistance change',
          th: 'บริดจ์ขยายการเปลี่ยนแปลงของความต้านทาน',
        },
        correct: false,
      },
      {
        id: 'b',
        label: {
          en: 'The bridge cancels the large unchanging part, so its output starts at zero and carries only the small change',
          th: 'บริดจ์หักล้างส่วนที่คงที่ซึ่งมีค่ามาก เอาต์พุตจึงเริ่มจากศูนย์และมีเฉพาะส่วนที่เปลี่ยนแปลงเล็กน้อย',
        },
        correct: true,
      },
      {
        id: 'c',
        label: {
          en: 'A bridge makes the strain gauge more sensitive to strain',
          th: 'บริดจ์ทำให้สเตรนเกจไวต่อความเครียดมากขึ้น',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Ohmmeters cannot measure metals',
          th: 'โอห์มมิเตอร์วัดความต้านทานของโลหะไม่ได้',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'config-sensitivity',
    question: {
      en: 'Same strain gauges, same strain, same supply. You rebuild a quarter bridge as a full bridge (four active gauges, two in tension, two in compression). The output becomes about:',
      th: 'ใช้สเตรนเกจชนิดเดิม ความเครียดเท่าเดิม แหล่งจ่ายเดิม ถ้าเปลี่ยนจากควอเตอร์บริดจ์เป็นฟูลบริดจ์ (สเตรนเกจทำงานสี่ตัว ถูกดึงสองตัว ถูกอัดสองตัว) เอาต์พุตจะเป็นประมาณ:',
    },
    options: [
      { id: 'a', label: { en: 'The same', th: 'เท่าเดิม' }, correct: false },
      { id: 'b', label: { en: 'Twice as large', th: 'ใหญ่ขึ้นสองเท่า' }, correct: false },
      {
        id: 'c',
        label: {
          en: 'Four times as large, and more linear',
          th: 'ใหญ่ขึ้นสี่เท่า และเป็นเชิงเส้นมากขึ้น',
        },
        correct: true,
      },
      {
        id: 'd',
        label: {
          en: 'Zero: tension and compression cancel',
          th: 'เป็นศูนย์: แรงดึงและแรงอัดหักล้างกัน',
        },
        correct: false,
      },
    ],
  },
];
