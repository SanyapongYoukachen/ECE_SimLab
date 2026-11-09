import type { LocalizedQuestion } from '@/lib/i18n';

export const QUESTIONS: readonly LocalizedQuestion[] = [
  {
    id: 'ldr-bright',
    question: {
      en: 'More light falls on an LDR. What happens to its resistance, and why?',
      th: 'แสงตกกระทบ LDR มากขึ้น ความต้านทานของมันเปลี่ยนไปอย่างไร และเพราะอะไร?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'It falls: each absorbed photon frees an electron, and more free electrons carry more current',
          th: 'ลดลง: โฟตอนแต่ละตัวที่ถูกดูดกลืนปลดปล่อยอิเล็กตรอนหนึ่งตัว อิเล็กตรอนอิสระยิ่งมากก็นำกระแสได้มาก',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'It rises: the light heats the film',
          th: 'เพิ่มขึ้น: แสงทำให้ฟิล์มร้อนขึ้น',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'It falls: light pushes the electrons along the wire faster',
          th: 'ลดลง: แสงผลักอิเล็กตรอนให้วิ่งไปตามสายไฟเร็วขึ้น',
        },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'It does not change', th: 'ไม่เปลี่ยนแปลง' },
        correct: false,
      },
    ],
  },
  {
    id: 'ldr-infrared',
    question: {
      en: 'The LDR needs 1.8 eV to free an electron. You shine very bright 940 nm infrared on it (1.32 eV per photon). Its resistance:',
      th: 'LDR ต้องใช้พลังงาน 1.8 eV เพื่อปลดปล่อยอิเล็กตรอน หากส่องแสงอินฟราเรด 940 nm ที่สว่างมาก (โฟตอนละ 1.32 eV) ความต้านทานจะ:',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Stays near its dark value: no single photon has enough energy, however many arrive',
          th: 'ยังคงใกล้ค่าในที่มืด: โฟตอนแต่ละตัวมีพลังงานไม่พอ ไม่ว่าจะมีจำนวนมากเท่าใด',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'Falls a lot, because the light is very bright',
          th: 'ลดลงมาก เพราะแสงสว่างมาก',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'Falls a little: several photons combine to free one electron',
          th: 'ลดลงเล็กน้อย: โฟตอนหลายตัวรวมพลังงานกันปลดปล่อยอิเล็กตรอนหนึ่งตัว',
        },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Rises above the dark value', th: 'สูงกว่าค่าในที่มืด' },
        correct: false,
      },
    ],
  },
  {
    id: 'ntc-heat',
    question: {
      en: 'Why does an NTC thermistor’s resistance fall as it warms up?',
      th: 'ทำไมความต้านทานของเทอร์มิสเตอร์แบบ NTC จึงลดลงเมื่ออุณหภูมิสูงขึ้น?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'More electrons gain enough thermal energy to break free and carry current',
          th: 'อิเล็กตรอนจำนวนมากขึ้นได้รับพลังงานความร้อนมากพอที่จะหลุดเป็นอิสระและนำกระแส',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'The bead expands, so the path gets wider',
          th: 'ลูกปัดขยายตัว ทางเดินของกระแสจึงกว้างขึ้น',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'The atoms vibrate less, so electrons scatter less',
          th: 'อะตอมสั่นน้อยลง อิเล็กตรอนจึงชนน้อยลง',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'Heat brings extra electrons in from the air',
          th: 'ความร้อนนำอิเล็กตรอนจากอากาศเข้ามาเพิ่ม',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'metal-vs-ntc',
    question: {
      en: 'A copper wire’s resistance rises when heated, but an NTC thermistor’s falls. What explains the difference?',
      th: 'ความต้านทานของลวดทองแดงเพิ่มขึ้นเมื่อร้อน แต่ของเทอร์มิสเตอร์ NTC กลับลดลง อะไรอธิบายความแตกต่างนี้?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'A metal already has all its free electrons, so heat only adds scattering; the semiconductor gains far more free electrons than it loses to scattering',
          th: 'โลหะมีอิเล็กตรอนอิสระครบอยู่แล้ว ความร้อนจึงเพิ่มแค่การชน ส่วนสารกึ่งตัวนำได้อิเล็กตรอนอิสระเพิ่มมากกว่าผลของการชนมาก',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'Copper has no free electrons until it is heated',
          th: 'ทองแดงไม่มีอิเล็กตรอนอิสระจนกว่าจะถูกทำให้ร้อน',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'The thermistor is cooled internally',
          th: 'เทอร์มิสเตอร์มีการระบายความร้อนภายใน',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'It is only a difference in size',
          th: 'เป็นเพียงความแตกต่างของขนาด',
        },
        correct: false,
      },
    ],
  },
  {
    id: 'divider-dark',
    question: {
      en: 'In this circuit (LDR on top, 10 kΩ below, 5 V supply) the room gets darker. Vout:',
      th: 'ในวงจรนี้ (LDR อยู่ด้านบน 10 kΩ อยู่ด้านล่าง แหล่งจ่าย 5 V) ห้องมืดลง Vout จะ:',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Falls: the LDR’s resistance rises, so it takes a bigger share of the 5 V',
          th: 'ลดลง: ความต้านทานของ LDR เพิ่มขึ้น จึงแบ่งแรงดันจาก 5 V ไปมากขึ้น',
        },
        correct: true,
      },
      {
        id: 'b',
        label: {
          en: 'Rises: less light means more voltage',
          th: 'เพิ่มขึ้น: แสงน้อยลงหมายถึงแรงดันมากขึ้น',
        },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'Stays at 2.5 V: a divider always halves the supply',
          th: 'คงที่ที่ 2.5 V: วงจรแบ่งแรงดันแบ่งครึ่งเสมอ',
        },
        correct: false,
      },
      {
        id: 'd',
        label: { en: 'Becomes negative', th: 'กลายเป็นค่าลบ' },
        correct: false,
      },
    ],
  },
  {
    id: 'ntc-resolution',
    question: {
      en: 'The thermistor is read by a 10-bit ADC through this divider. Where is one ADC step the smallest change in temperature (the best resolution)?',
      th: 'อ่านค่าเทอร์มิสเตอร์ผ่านวงจรแบ่งแรงดันนี้ด้วย ADC 10 บิต ที่อุณหภูมิใดหนึ่งขั้นของ ADC เท่ากับการเปลี่ยนอุณหภูมิน้อยที่สุด (ความละเอียดดีที่สุด)?',
    },
    options: [
      {
        id: 'a',
        label: {
          en: 'Near room temperature, where the sensor matches the 10 kΩ resistor and Vout changes fastest',
          th: 'ใกล้อุณหภูมิห้อง ที่ความต้านทานของเซนเซอร์ใกล้เคียง 10 kΩ และ Vout เปลี่ยนเร็วที่สุด',
        },
        correct: true,
      },
      {
        id: 'b',
        label: { en: 'At 100 °C', th: 'ที่ 100 °C' },
        correct: false,
      },
      {
        id: 'c',
        label: {
          en: 'The same everywhere, because every ADC step is 4.88 mV',
          th: 'เท่ากันทุกจุด เพราะ ADC ทุกขั้นมีขนาด 4.88 mV',
        },
        correct: false,
      },
      {
        id: 'd',
        label: {
          en: 'At −20 °C, where the resistance is largest',
          th: 'ที่ −20 °C ที่ความต้านทานสูงที่สุด',
        },
        correct: false,
      },
    ],
  },
];
