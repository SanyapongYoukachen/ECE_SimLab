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
  {
    id: 'thevenin-rth',
    question: {
      en: 'To find Rth, you "switch off" the independent voltage source. What do you replace it with?',
      th: 'เมื่อหา Rth ต้อง "ปิด" แหล่งจ่ายแรงดันอิสระ ต้องแทนแหล่งจ่ายนั้นด้วยอะไร?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A wire (short circuit): a switched-off voltage source holds 0 V',
          th: 'สายไฟ (ลัดวงจร): แหล่งจ่ายแรงดันที่ปิดแล้วมีแรงดัน 0 V',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'An open circuit', th: 'วงจรเปิด' },
        correct: false,
      },
      {
        id: 'c',
        label: { en: 'A resistor equal to RL', th: 'ตัวต้านทานที่มีค่าเท่ากับ RL' },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Leave it in place', th: 'ปล่อยไว้ตามเดิม' },
        correct: false,
      },
    ],
  },
  {
    id: 'max-power',
    question: {
      en: 'A source has Vth = 10 V and Rth = 50 Ω. Which load draws the most power, and how much?',
      th: 'แหล่งจ่ายมี Vth = 10 V และ Rth = 50 Ω โหลดค่าใดรับกำลังได้มากที่สุด และเท่าใด?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'RL = 50 Ω, drawing 10²/(4·50) = 0.5 W',
          th: 'RL = 50 Ω รับกำลัง 10²/(4·50) = 0.5 W',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'RL = 0 Ω, drawing 2 W', th: 'RL = 0 Ω รับกำลัง 2 W' },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'The largest RL possible, drawing 1 W',
          th: 'RL ที่มากที่สุดเท่าที่เป็นไปได้ รับกำลัง 1 W',
        },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'RL = 25 Ω, drawing 1 W', th: 'RL = 25 Ω รับกำลัง 1 W' },
        correct: false,
      },
    ],
  },
  {
    id: 'mesh-negative',
    question: {
      en: 'You assume both mesh currents clockwise and solve to get I2 = −3 mA. What does that mean?',
      th: 'สมมติให้กระแสเมชทั้งสองไหลตามเข็มนาฬิกา แก้สมการได้ I2 = −3 mA หมายความว่าอย่างไร?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A 3 mA loop current actually flows anticlockwise; the working is still correct',
          th: 'กระแสลูป 3 mA ไหลทวนเข็มนาฬิกาจริง การคำนวณยังถูกต้อง',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'A mistake: currents cannot be negative',
          th: 'คำนวณผิด: กระแสเป็นลบไม่ได้',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'The source in that loop is broken',
          th: 'แหล่งจ่ายในลูปนั้นเสีย',
        },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'No current flows in that loop', th: 'ไม่มีกระแสไหลในลูปนั้น' },
        correct: false,
      },
    ],
  },
  {
    id: 'mesh-or-node',
    question: {
      en: 'A circuit has 4 windows (meshes) but only 2 nodes apart from ground. Which method needs fewer equations?',
      th: 'วงจรหนึ่งมี 4 ช่อง (เมช) แต่มีโนดที่ไม่ใช่กราวด์เพียง 2 โนด วิธีใดใช้สมการน้อยกว่า?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Nodal analysis: 2 equations instead of 4',
          th: 'การวิเคราะห์โนด: 2 สมการแทนที่จะเป็น 4',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'Mesh analysis: 4 equations are more accurate',
          th: 'การวิเคราะห์เมช: 4 สมการแม่นยำกว่า',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'Both need 6 equations',
          th: 'ทั้งสองวิธีต้องใช้ 6 สมการ',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Neither: only series–parallel rules work',
          th: 'ไม่มีวิธีใดใช้ได้: ต้องใช้กฎอนุกรม–ขนานเท่านั้น',
        },
        correct: false,
      },
    ],
  },
];
