import type { CircuitMode } from '@/lib/state/schemas';
import type { Topic } from './types';

/**
 * DC circuits module topics. Worked examples use the simulator's default
 * values (9 V, R1 = 220 Ω, R2 = 470 Ω, R3 = 330 Ω, RL = 1 kΩ, V2 = 5 V).
 */
export const CIRCUIT_TOPICS: readonly Topic<CircuitMode>[] = [
  {
    module: 'circuits',
    slug: 'ohms-law',
    mode: 'ohm',
    seo: {
      title: "Ohm's Law Calculator & Simulator — V = I·R, I-V Graph",
      description:
        "Drag voltage and resistance and watch Ohm's law work: current I = V/R, power P = V·I, and the I-V graph with its operating point, on a live schematic.",
      keywords: [
        "Ohm's law calculator",
        "Ohm's law simulator",
        'V = IR',
        'I-V graph',
        'electrical power P = VI',
        'กฎของโอห์ม',
        'คำนวณกฎของโอห์ม',
      ],
      teaches: ["Ohm's law", 'Electrical power', 'I-V characteristic'],
    },
    text: {
      en: {
        nav: "Ohm's law",
        h1: "Ohm's law: V = I·R on a live circuit",
        lead: 'Set a source voltage and a resistance, and read the current and power straight off the schematic and the I-V graph.',
        card: 'V = I·R and P = V·I on a live schematic, with the resistor’s I-V line and operating point.',
        sections: [
          {
            heading: 'The law',
            body: [
              'For a resistor, the current is proportional to the voltage across it, and the constant of proportionality is the resistance. Rearranged, it answers any of three questions: the current a voltage drives, the voltage a current needs, or the resistance a measurement implies.',
            ],
            formulas: ['V = I·R', 'I = V / R', 'R = V / I'],
          },
          {
            heading: 'Power',
            body: [
              'The power a resistor turns into heat is the voltage times the current. Substituting Ohm’s law gives two more forms; pick the one that uses the quantities you know.',
            ],
            formulas: ['P = V·I = I²·R = V² / R'],
          },
          {
            heading: 'Reading the I-V graph',
            body: [
              'Plot current against voltage for a resistor and you get a straight line through the origin with slope 1/R: a steeper line is a smaller resistance. The operating point is where the present voltage sits on that line. Components whose I-V curve is not straight, such as diodes and lamps, are non-ohmic.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V = 9 V across R = 220 Ω.',
            'I = 9/220 = 40.9 mA.',
            'P = 9 × 0.0409 = 0.368 W: a standard ¼ W resistor would overheat, so use a ½ W part.',
          ],
        },
        mistakes: [
          'Mixing units: 9 V / 220 kΩ is 40.9 µA, not 40.9 mA. Convert kΩ and mA before dividing.',
          'Forgetting the power rating. The value can be right and the resistor still burn out.',
          'Applying Ohm’s law to a whole circuit with the wrong R: use the voltage across, and the current through, the same component.',
        ],
        faq: [
          {
            q: "What is Ohm's law?",
            a: 'V = I·R: the voltage across a resistor equals the current through it times its resistance. Doubling the voltage doubles the current; doubling the resistance halves it.',
          },
          {
            q: 'How do you calculate power in a resistor?',
            a: 'P = V·I, or equivalently I²·R or V²/R. A 220 Ω resistor on 9 V dissipates 0.368 W.',
          },
        ],
      },
      th: {
        nav: 'กฎของโอห์ม',
        h1: 'กฎของโอห์ม: V = I·R บนวงจรจริง',
        lead: 'ตั้งค่าแรงดันแหล่งจ่ายและความต้านทาน แล้วอ่านค่ากระแสและกำลังได้ทันทีจากแผนภาพวงจรและกราฟ I-V',
        card: 'V = I·R และ P = V·I บนแผนภาพวงจรแบบสด พร้อมเส้น I-V ของตัวต้านทานและจุดทำงาน',
        sections: [
          {
            heading: 'กฎ',
            body: [
              'สำหรับตัวต้านทาน กระแสแปรผันตรงกับแรงดันที่ตกคร่อม และค่าคงที่ของการแปรผันคือความต้านทาน เมื่อจัดรูปใหม่จะตอบได้สามคำถาม: แรงดันขับกระแสได้เท่าใด กระแสต้องการแรงดันเท่าใด หรือการวัดบอกค่าความต้านทานเท่าใด',
            ],
            formulas: ['V = I·R', 'I = V / R', 'R = V / I'],
          },
          {
            heading: 'กำลังไฟฟ้า',
            body: [
              'กำลังที่ตัวต้านทานเปลี่ยนเป็นความร้อนคือแรงดันคูณกระแส เมื่อแทนกฎของโอห์มจะได้อีกสองรูปแบบ เลือกรูปที่ใช้ปริมาณที่รู้ค่า',
            ],
            formulas: ['P = V·I = I²·R = V² / R'],
          },
          {
            heading: 'การอ่านกราฟ I-V',
            body: [
              'เมื่อพล็อตกระแสเทียบกับแรงดันของตัวต้านทาน จะได้เส้นตรงผ่านจุดกำเนิดที่มีความชัน 1/R เส้นที่ชันกว่าคือความต้านทานที่น้อยกว่า จุดทำงานคือตำแหน่งของแรงดันปัจจุบันบนเส้นนั้น อุปกรณ์ที่กราฟ I-V ไม่เป็นเส้นตรง เช่น ไดโอดและหลอดไฟ เรียกว่าไม่เป็นไปตามกฎของโอห์ม',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V = 9 V คร่อม R = 220 Ω',
            'I = 9/220 = 40.9 mA',
            'P = 9 × 0.0409 = 0.368 W ตัวต้านทานขนาด ¼ W ทั่วไปจะร้อนเกิน ควรใช้ขนาด ½ W',
          ],
        },
        mistakes: [
          'ใช้หน่วยปนกัน: 9 V / 220 kΩ คือ 40.9 µA ไม่ใช่ 40.9 mA แปลง kΩ และ mA ก่อนหาร',
          'ลืมพิกัดกำลัง ค่าความต้านทานถูกต้องแต่ตัวต้านทานก็ยังไหม้ได้',
          'ใช้กฎของโอห์มกับทั้งวงจรด้วย R ที่ผิดตัว: ต้องใช้แรงดันคร่อมและกระแสผ่านอุปกรณ์ตัวเดียวกัน',
        ],
        faq: [
          {
            q: 'กฎของโอห์มคืออะไร?',
            a: 'V = I·R: แรงดันคร่อมตัวต้านทานเท่ากับกระแสที่ผ่านคูณด้วยความต้านทาน เพิ่มแรงดันเป็นสองเท่า กระแสเพิ่มเป็นสองเท่า เพิ่มความต้านทานเป็นสองเท่า กระแสลดลงครึ่งหนึ่ง',
          },
          {
            q: 'คำนวณกำลังในตัวต้านทานอย่างไร?',
            a: 'P = V·I หรือเท่ากับ I²·R หรือ V²/R ตัวต้านทาน 220 Ω ที่ต่อกับ 9 V ใช้กำลัง 0.368 W',
          },
        ],
      },
    },
  },
  {
    module: 'circuits',
    slug: 'series-parallel',
    mode: 'network',
    seo: {
      title: 'Series and Parallel Resistor Calculator & Simulator',
      description:
        'Compare series and parallel resistors on a live circuit: equivalent resistance, total current, how voltage and current split, and the power each resistor dissipates.',
      keywords: [
        'series and parallel resistors',
        'parallel resistor calculator',
        'equivalent resistance',
        'series resistance',
        'current divider',
        'ตัวต้านทานอนุกรม ขนาน',
        'ความต้านทานรวม',
      ],
      teaches: ['Series resistance', 'Parallel resistance', 'Current divider', 'Power dissipation'],
    },
    text: {
      en: {
        nav: 'Series & parallel',
        h1: 'Series and parallel resistors: equivalent resistance',
        lead: 'Put two resistors in series, then in parallel, and see what stays the same, what splits, and which one gets hot.',
        card: 'Equivalent resistance, how voltage and current split, and the power in each resistor.',
        sections: [
          {
            heading: 'Series: same current, voltages add',
            body: [
              'Resistors in series form one path, so the same current flows through each. Their voltages add up to the source voltage, and the larger resistor takes the larger share. The equivalent resistance is the sum, always more than the largest.',
            ],
            formulas: ['R_eq = R1 + R2', 'I = V / R_eq', 'V1 = I·R1,   V2 = I·R2'],
          },
          {
            heading: 'Parallel: same voltage, currents add',
            body: [
              'Resistors in parallel each sit across the source, so each sees the full voltage. Their currents add up to the total, and the smaller resistor takes the larger share. The equivalent resistance is always less than the smallest.',
            ],
            formulas: [
              '1/R_eq = 1/R1 + 1/R2',
              'two resistors: R_eq = R1·R2 / (R1 + R2)',
              'I1 = V/R1,   I2 = V/R2',
            ],
          },
          {
            heading: 'Which resistor gets hot?',
            body: [
              'In series the larger resistor dissipates more (P = I²R, same I). In parallel the smaller one does (P = V²/R, same V). The power bars in the simulator flip when you switch topology.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω.',
            'Series: R_eq = 690 Ω, I = 13.0 mA, V1 = 2.87 V, V2 = 6.13 V.',
            'Parallel: R_eq = 220·470/690 = 149.9 Ω, I = 60.1 mA, I1 = 40.9 mA, I2 = 19.1 mA.',
          ],
        },
        mistakes: [
          'Adding parallel resistances like series ones. Add conductances (1/R), not resistances.',
          'Expecting the parallel combination to be between the two values. It is always below the smallest.',
          'Assuming the bigger resistor always takes more power: true in series, false in parallel.',
        ],
        faq: [
          {
            q: 'How do you calculate resistors in parallel?',
            a: 'Add the reciprocals: 1/R_eq = 1/R1 + 1/R2 + … For two resistors, R_eq = R1·R2/(R1 + R2). 220 Ω and 470 Ω in parallel make 149.9 Ω.',
          },
          {
            q: 'What is the same in series and in parallel?',
            a: 'Series resistors carry the same current; parallel resistors have the same voltage across them.',
          },
        ],
      },
      th: {
        nav: 'อนุกรมและขนาน',
        h1: 'ตัวต้านทานแบบอนุกรมและขนาน: ความต้านทานสมมูล',
        lead: 'ต่อตัวต้านทานสองตัวแบบอนุกรม แล้วเปลี่ยนเป็นขนาน ดูว่าอะไรเท่าเดิม อะไรถูกแบ่ง และตัวไหนร้อน',
        card: 'ความต้านทานสมมูล การแบ่งแรงดันและกระแส และกำลังในตัวต้านทานแต่ละตัว',
        sections: [
          {
            heading: 'อนุกรม: กระแสเท่ากัน แรงดันรวมกัน',
            body: [
              'ตัวต้านทานแบบอนุกรมเป็นทางเดินเดียว กระแสเดียวกันจึงไหลผ่านทุกตัว แรงดันของแต่ละตัวรวมกันเท่ากับแรงดันแหล่งจ่าย และตัวที่มีความต้านทานมากได้ส่วนแบ่งมาก ความต้านทานสมมูลคือผลรวม ซึ่งมากกว่าตัวที่มากที่สุดเสมอ',
            ],
            formulas: ['R_eq = R1 + R2', 'I = V / R_eq', 'V1 = I·R1,   V2 = I·R2'],
          },
          {
            heading: 'ขนาน: แรงดันเท่ากัน กระแสรวมกัน',
            body: [
              'ตัวต้านทานแบบขนานแต่ละตัวต่อคร่อมแหล่งจ่าย จึงได้แรงดันเต็มเท่ากัน กระแสของแต่ละตัวรวมกันเป็นกระแสทั้งหมด และตัวที่มีความต้านทานน้อยได้ส่วนแบ่งมาก ความต้านทานสมมูลน้อยกว่าตัวที่น้อยที่สุดเสมอ',
            ],
            formulas: [
              '1/R_eq = 1/R1 + 1/R2',
              'สองตัว: R_eq = R1·R2 / (R1 + R2)',
              'I1 = V/R1,   I2 = V/R2',
            ],
          },
          {
            heading: 'ตัวต้านทานตัวไหนร้อน?',
            body: [
              'แบบอนุกรม ตัวที่มีความต้านทานมากใช้กำลังมากกว่า (P = I²R กระแสเท่ากัน) แบบขนาน ตัวที่มีความต้านทานน้อยใช้กำลังมากกว่า (P = V²/R แรงดันเท่ากัน) แท่งกำลังในโปรแกรมจำลองจะสลับเมื่อเปลี่ยนรูปแบบการต่อ',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω',
            'อนุกรม: R_eq = 690 Ω, I = 13.0 mA, V1 = 2.87 V, V2 = 6.13 V',
            'ขนาน: R_eq = 220·470/690 = 149.9 Ω, I = 60.1 mA, I1 = 40.9 mA, I2 = 19.1 mA',
          ],
        },
        mistakes: [
          'บวกความต้านทานแบบขนานเหมือนแบบอนุกรม ต้องบวกค่าความนำ (1/R) ไม่ใช่ความต้านทาน',
          'คาดว่าความต้านทานขนานจะอยู่ระหว่างสองค่า ที่จริงน้อยกว่าค่าที่น้อยที่สุดเสมอ',
          'คิดว่าตัวต้านทานที่ใหญ่กว่าใช้กำลังมากกว่าเสมอ จริงสำหรับอนุกรม แต่ไม่จริงสำหรับขนาน',
        ],
        faq: [
          {
            q: 'คำนวณตัวต้านทานแบบขนานอย่างไร?',
            a: 'บวกส่วนกลับ: 1/R_eq = 1/R1 + 1/R2 + … สำหรับสองตัว R_eq = R1·R2/(R1 + R2) 220 Ω ขนานกับ 470 Ω ได้ 149.9 Ω',
          },
          {
            q: 'อะไรเท่ากันในวงจรอนุกรมและวงจรขนาน?',
            a: 'ตัวต้านทานที่ต่ออนุกรมมีกระแสเท่ากัน ส่วนตัวต้านทานที่ต่อขนานมีแรงดันตกคร่อมเท่ากัน',
          },
        ],
      },
    },
  },
  {
    module: 'circuits',
    slug: 'voltage-divider',
    mode: 'divider',
    seo: {
      title: 'Voltage Divider Calculator & Simulator — Vout = V·R2/(R1+R2)',
      description:
        'Build a voltage divider and watch Vout follow the resistor ratio, with the voltage ladder, the divider current and the loading effect explained step by step.',
      keywords: [
        'voltage divider calculator',
        'voltage divider formula',
        'Vout = Vin R2/(R1+R2)',
        'potential divider',
        'loading effect',
        'วงจรแบ่งแรงดัน',
      ],
      teaches: ['Voltage divider', 'Loading effect', 'Kirchhoff’s voltage law'],
    },
    text: {
      en: {
        nav: 'Voltage divider',
        h1: 'Voltage divider: Vout = V·R2/(R1 + R2)',
        lead: 'Two resistors in series split a voltage in proportion to their values. Move R1 and R2 and watch the tap voltage follow the ratio.',
        card: 'Two resistors split a voltage by their ratio: the formula, the voltage ladder and the loading effect.',
        sections: [
          {
            heading: 'The formula',
            body: [
              'R1 and R2 in series carry one current, I = V/(R1 + R2). The output is taken across R2, so it is that current times R2. Only the ratio of the resistors matters, not their size.',
            ],
            formulas: ['I = V / (R1 + R2)', 'Vout = V · R2 / (R1 + R2)'],
          },
          {
            heading: 'Where dividers are used',
            body: [
              'Dividers scale a voltage down to what an input can read: a battery monitor feeding a microcontroller’s ADC, a potentiometer as a volume control, or a sensor such as an LDR or thermistor in place of one resistor, so the output voltage tracks light or temperature (see the Sensors module).',
            ],
          },
          {
            heading: 'The loading effect',
            body: [
              'Connect a load across the output and it sits in parallel with R2, lowering the effective R2 and pulling Vout down. Keep the load much larger than R2 (as a rule of thumb, ten times or more) or the divider no longer gives the voltage you designed. This is exactly the problem the Thévenin equivalent solves.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω.',
            'I = 9/690 = 13.0 mA; Vout = 9 × 470/690 = 6.13 V; V across R1 = 2.87 V.',
            'Add a 1 kΩ load: R2 ∥ 1 kΩ = 319.7 Ω, so Vout drops to 9 × 319.7/539.7 = 5.33 V.',
          ],
        },
        mistakes: [
          'Putting R1 in the numerator. The output is across R2, so R2 goes on top.',
          'Ignoring the load. A divider’s output changes as soon as something draws current from it.',
          'Using huge resistor values to save current, then reading the output with a meter whose input resistance is comparable.',
        ],
        faq: [
          {
            q: 'What is the voltage divider formula?',
            a: 'Vout = Vin × R2/(R1 + R2), with the output taken across R2. 9 V with 220 Ω and 470 Ω gives 6.13 V.',
          },
          {
            q: 'Why does a voltage divider’s output drop under load?',
            a: 'The load sits in parallel with R2, which lowers the effective bottom resistance and so the ratio. Keep the load at least about ten times R2.',
          },
        ],
      },
      th: {
        nav: 'วงจรแบ่งแรงดัน',
        h1: 'วงจรแบ่งแรงดัน: Vout = V·R2/(R1 + R2)',
        lead: 'ตัวต้านทานสองตัวที่ต่ออนุกรมแบ่งแรงดันตามสัดส่วนของค่า ปรับ R1 และ R2 แล้วดูแรงดันที่จุดแยกเปลี่ยนตามอัตราส่วน',
        card: 'ตัวต้านทานสองตัวแบ่งแรงดันตามอัตราส่วน: สูตร บันไดแรงดัน และผลของการต่อโหลด',
        sections: [
          {
            heading: 'สูตร',
            body: [
              'R1 และ R2 ที่ต่ออนุกรมมีกระแสเดียวกัน I = V/(R1 + R2) เอาต์พุตวัดคร่อม R2 จึงเท่ากับกระแสนั้นคูณ R2 สิ่งที่สำคัญคืออัตราส่วนของตัวต้านทาน ไม่ใช่ขนาด',
            ],
            formulas: ['I = V / (R1 + R2)', 'Vout = V · R2 / (R1 + R2)'],
          },
          {
            heading: 'การใช้งานวงจรแบ่งแรงดัน',
            body: [
              'วงจรแบ่งแรงดันลดแรงดันลงให้อยู่ในช่วงที่อินพุตอ่านได้: วัดแรงดันแบตเตอรี่ผ่าน ADC ของไมโครคอนโทรลเลอร์ ใช้โพเทนชิออมิเตอร์เป็นตัวปรับเสียง หรือใช้เซนเซอร์อย่าง LDR หรือเทอร์มิสเตอร์แทนตัวต้านทานหนึ่งตัว เพื่อให้แรงดันเอาต์พุตเปลี่ยนตามแสงหรืออุณหภูมิ (ดูโมดูลเซนเซอร์)',
            ],
          },
          {
            heading: 'ผลของการต่อโหลด',
            body: [
              'เมื่อต่อโหลดคร่อมเอาต์พุต โหลดจะขนานกับ R2 ทำให้ R2 ที่มีผลลดลงและดึง Vout ลง ควรให้โหลดมีค่ามากกว่า R2 มาก (หลักง่าย ๆ คือสิบเท่าขึ้นไป) ไม่เช่นนั้นวงจรจะไม่ให้แรงดันตามที่ออกแบบ ปัญหานี้คือสิ่งที่วงจรสมมูลเทวินินช่วยแก้',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω',
            'I = 9/690 = 13.0 mA; Vout = 9 × 470/690 = 6.13 V; แรงดันคร่อม R1 = 2.87 V',
            'ต่อโหลด 1 kΩ: R2 ∥ 1 kΩ = 319.7 Ω ดังนั้น Vout ลดลงเหลือ 9 × 319.7/539.7 = 5.33 V',
          ],
        },
        mistakes: [
          'ใส่ R1 ไว้ในตัวเศษ เอาต์พุตวัดคร่อม R2 จึงต้องใช้ R2 เป็นตัวเศษ',
          'ไม่คิดผลของโหลด แรงดันเอาต์พุตเปลี่ยนทันทีที่มีอะไรดึงกระแสจากมัน',
          'ใช้ตัวต้านทานค่าสูงมากเพื่อประหยัดกระแส แล้ววัดเอาต์พุตด้วยมิเตอร์ที่มีความต้านทานอินพุตใกล้เคียงกัน',
        ],
        faq: [
          {
            q: 'สูตรวงจรแบ่งแรงดันคืออะไร?',
            a: 'Vout = Vin × R2/(R1 + R2) โดยวัดเอาต์พุตคร่อม R2 แหล่งจ่าย 9 V กับ 220 Ω และ 470 Ω ให้ 6.13 V',
          },
          {
            q: 'ทำไมแรงดันเอาต์พุตของวงจรแบ่งแรงดันจึงลดลงเมื่อต่อโหลด?',
            a: 'โหลดขนานกับ R2 ทำให้ความต้านทานด้านล่างที่มีผลลดลง อัตราส่วนจึงเปลี่ยน ควรให้โหลดมีค่าอย่างน้อยประมาณสิบเท่าของ R2',
          },
        ],
      },
    },
  },
  {
    module: 'circuits',
    slug: 'thevenin-norton',
    mode: 'thevenin',
    seo: {
      title: 'Thévenin & Norton Equivalent Calculator — Step by Step',
      description:
        'Find a Thévenin and Norton equivalent step by step: open-circuit Vth, Rth with the source off, short-circuit IN, the same load current, and maximum power transfer.',
      keywords: [
        'Thevenin equivalent calculator',
        'Thevenin theorem',
        'Norton equivalent',
        'Thevenin resistance',
        'maximum power transfer',
        'วงจรสมมูลเทวินิน',
        'ทฤษฎีของเทวินิน',
        'วงจรสมมูลนอร์ตัน',
      ],
      teaches: ['Thévenin equivalent', 'Norton equivalent', 'Maximum power transfer'],
    },
    text: {
      en: {
        nav: 'Thévenin & Norton',
        h1: 'Thévenin and Norton equivalents, step by step',
        lead: 'Reduce a network of sources and resistors to one source and one resistor, check that the load cannot tell the difference, and find the load that draws the most power.',
        card: 'Find Vth, Rth and IN step by step; the load current is the same in all three circuits; maximum power at RL = Rth.',
        sections: [
          {
            heading: 'The theorem',
            body: [
              'Seen from two terminals a–b, any linear network of sources and resistors behaves exactly like one voltage source Vth in series with one resistor Rth (Thévenin), or one current source IN in parallel with the same Rth (Norton). Analyse the network once, and any load is a one-line calculation.',
            ],
            formulas: ['IL = Vth / (Rth + RL)', 'IN = Vth / Rth'],
          },
          {
            heading: 'Finding Vth, Rth and IN',
            body: ['For the simulator’s network (V, R1, R2 divider, then R3 to terminal a):'],
            bullets: [
              'Vth: remove the load and find the open-circuit voltage. No current flows in R3, so Vth is the R1–R2 divider: Vth = V·R2/(R1 + R2).',
              'Rth: switch off independent sources (a voltage source becomes a wire, a current source an open circuit) and find the resistance seen into a–b: Rth = R1∥R2 + R3.',
              'IN: short a–b and find the current, or simply IN = Vth/Rth.',
            ],
          },
          {
            heading: 'Maximum power transfer',
            body: [
              'The power in the load, PL = Vth²·RL/(Rth + RL)², peaks when the load matches the source: RL = Rth. The maximum is Vth²/(4·Rth), and at that point the efficiency is only 50%: as much power is lost in Rth as reaches the load. Matched loads suit signals (antennas, audio); power systems run far from matched, for efficiency.',
            ],
            formulas: ['PL,max = Vth² / (4·Rth)  at  RL = Rth'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω, R3 = 330 Ω, RL = 1 kΩ.',
            'Vth = 9 × 470/690 = 6.13 V.',
            'Rth = (220 × 470/690) + 330 = 149.9 + 330 = 479.9 Ω.',
            'IN = 6.13/479.9 = 12.78 mA.',
            'IL = 6.13/(479.9 + 1000) = 4.14 mA in the original, Thévenin and Norton circuits alike; matched (RL = 480 Ω) it would draw Pmax = 19.6 mW.',
          ],
        },
        mistakes: [
          'Leaving the source in when finding Rth. Replace voltage sources with wires and current sources with open circuits.',
          'Forgetting R3 (or any series resistor) when combining: Rth here is R1∥R2 + R3, not just R1∥R2.',
          'Expecting maximum power to mean maximum efficiency. At RL = Rth the efficiency is 50%.',
        ],
        faq: [
          {
            q: 'How do you find the Thévenin equivalent of a circuit?',
            a: 'Vth is the open-circuit voltage at the terminals. Rth is the resistance seen into the terminals with independent sources switched off (voltage sources shorted, current sources opened). Then the circuit is Vth in series with Rth.',
          },
          {
            q: 'What is the relation between Thévenin and Norton equivalents?',
            a: 'They share Rth, and IN = Vth/Rth. A voltage source in series with a resistor and a current source in parallel with the same resistor look identical from the terminals.',
          },
          {
            q: 'When is maximum power transferred to a load?',
            a: 'When the load resistance equals the Thévenin resistance. The load then receives Vth²/(4·Rth), with 50% efficiency.',
          },
        ],
      },
      th: {
        nav: 'เทวินินและนอร์ตัน',
        h1: 'วงจรสมมูลเทวินินและนอร์ตัน ทีละขั้นตอน',
        lead: 'ลดรูปวงจรที่มีแหล่งจ่ายและตัวต้านทานให้เหลือแหล่งจ่ายหนึ่งตัวกับตัวต้านทานหนึ่งตัว ตรวจสอบว่าโหลดแยกไม่ออก และหาโหลดที่รับกำลังได้มากที่สุด',
        card: 'หา Vth, Rth และ IN ทีละขั้น กระแสโหลดเท่ากันทั้งสามวงจร กำลังสูงสุดที่ RL = Rth',
        sections: [
          {
            heading: 'ทฤษฎีบท',
            body: [
              'เมื่อมองจากขั้ว a–b วงจรเชิงเส้นใด ๆ ที่มีแหล่งจ่ายและตัวต้านทานทำตัวเหมือนแหล่งจ่ายแรงดัน Vth หนึ่งตัวต่ออนุกรมกับตัวต้านทาน Rth หนึ่งตัว (เทวินิน) หรือแหล่งจ่ายกระแส IN หนึ่งตัวต่อขนานกับ Rth ตัวเดิม (นอร์ตัน) วิเคราะห์วงจรเพียงครั้งเดียว แล้วโหลดใดก็คำนวณได้ในบรรทัดเดียว',
            ],
            formulas: ['IL = Vth / (Rth + RL)', 'IN = Vth / Rth'],
          },
          {
            heading: 'การหา Vth, Rth และ IN',
            body: ['สำหรับวงจรในโปรแกรมจำลอง (V, วงจรแบ่งแรงดัน R1–R2 แล้วต่อ R3 ไปยังขั้ว a):'],
            bullets: [
              'Vth: ถอดโหลดออกแล้วหาแรงดันขณะเปิดวงจร ไม่มีกระแสใน R3 ดังนั้น Vth คือแรงดันจากวงจรแบ่งแรงดัน R1–R2: Vth = V·R2/(R1 + R2)',
              'Rth: ปิดแหล่งจ่ายอิสระ (แหล่งจ่ายแรงดันแทนด้วยสายไฟ แหล่งจ่ายกระแสแทนด้วยวงจรเปิด) แล้วหาความต้านทานที่มองเข้าไปที่ a–b: Rth = R1∥R2 + R3',
              'IN: ลัดวงจร a–b แล้วหากระแส หรือใช้ IN = Vth/Rth',
            ],
          },
          {
            heading: 'การถ่ายโอนกำลังสูงสุด',
            body: [
              'กำลังที่โหลด PL = Vth²·RL/(Rth + RL)² มีค่าสูงสุดเมื่อโหลดเท่ากับแหล่งจ่าย: RL = Rth กำลังสูงสุดคือ Vth²/(4·Rth) และที่จุดนั้นประสิทธิภาพเพียง 50%: กำลังสูญเสียใน Rth เท่ากับกำลังที่ถึงโหลด การจับคู่โหลดเหมาะกับงานสัญญาณ (สายอากาศ เครื่องเสียง) ส่วนระบบไฟฟ้ากำลังทำงานห่างจากจุดนั้นมากเพื่อประสิทธิภาพ',
            ],
            formulas: ['PL,max = Vth² / (4·Rth)  เมื่อ  RL = Rth'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V = 9 V, R1 = 220 Ω, R2 = 470 Ω, R3 = 330 Ω, RL = 1 kΩ',
            'Vth = 9 × 470/690 = 6.13 V',
            'Rth = (220 × 470/690) + 330 = 149.9 + 330 = 479.9 Ω',
            'IN = 6.13/479.9 = 12.78 mA',
            'IL = 6.13/(479.9 + 1000) = 4.14 mA เท่ากันทั้งในวงจรเดิม วงจรเทวินิน และวงจรนอร์ตัน ถ้าจับคู่โหลด (RL = 480 Ω) จะได้ Pmax = 19.6 mW',
          ],
        },
        mistakes: [
          'ไม่ปิดแหล่งจ่ายขณะหา Rth ต้องแทนแหล่งจ่ายแรงดันด้วยสายไฟ และแหล่งจ่ายกระแสด้วยวงจรเปิด',
          'ลืม R3 (หรือตัวต้านทานอนุกรมใด ๆ) ขณะรวมค่า: Rth ในที่นี้คือ R1∥R2 + R3 ไม่ใช่แค่ R1∥R2',
          'คิดว่ากำลังสูงสุดหมายถึงประสิทธิภาพสูงสุด ที่ RL = Rth ประสิทธิภาพเพียง 50%',
        ],
        faq: [
          {
            q: 'หาวงจรสมมูลเทวินินของวงจรอย่างไร?',
            a: 'Vth คือแรงดันขณะเปิดวงจรที่ขั้ว Rth คือความต้านทานที่มองเข้าไปที่ขั้วเมื่อปิดแหล่งจ่ายอิสระ (ลัดวงจรแหล่งจ่ายแรงดัน เปิดวงจรแหล่งจ่ายกระแส) จากนั้นวงจรคือ Vth ต่ออนุกรมกับ Rth',
          },
          {
            q: 'วงจรสมมูลเทวินินกับนอร์ตันสัมพันธ์กันอย่างไร?',
            a: 'ใช้ Rth ตัวเดียวกัน และ IN = Vth/Rth แหล่งจ่ายแรงดันต่ออนุกรมกับตัวต้านทาน และแหล่งจ่ายกระแสต่อขนานกับตัวต้านทานตัวเดียวกัน ดูเหมือนกันทุกประการเมื่อมองจากขั้ว',
          },
          {
            q: 'โหลดจะได้รับกำลังสูงสุดเมื่อใด?',
            a: 'เมื่อความต้านทานโหลดเท่ากับความต้านทานเทวินิน โหลดจะได้รับ Vth²/(4·Rth) ด้วยประสิทธิภาพ 50%',
          },
        ],
      },
    },
  },
  {
    module: 'circuits',
    slug: 'mesh-nodal-analysis',
    mode: 'mesh',
    seo: {
      title: 'Mesh & Nodal Analysis — Solved Step by Step (KVL, KCL)',
      description:
        'Solve one two-source circuit by mesh analysis (KVL, a 2×2 matrix) and by nodal analysis (KCL, one equation), with every number filled in, and compare.',
      keywords: [
        'mesh analysis',
        'nodal analysis',
        'mesh analysis example',
        'KVL KCL',
        'node voltage method',
        'mesh current method',
        'การวิเคราะห์เมช',
        'การวิเคราะห์โนด',
      ],
      teaches: [
        'Mesh analysis',
        'Nodal analysis',
        'Kirchhoff’s voltage law',
        'Kirchhoff’s current law',
      ],
    },
    text: {
      en: {
        nav: 'Mesh & node analysis',
        h1: 'Mesh and nodal analysis, solved step by step',
        lead: 'Two sources and three resistors: too many for series–parallel rules. Solve the same circuit with loop currents (KVL) and with a node voltage (KCL), and see why one method is shorter.',
        card: 'One two-source circuit solved by KVL loop currents and by KCL at a node, with every number filled in.',
        sections: [
          {
            heading: 'The circuit',
            body: [
              'V1 feeds node A through R1; R2 runs from A to ground; R3 connects A to a second source V2. Neither source alone explains the currents, so the circuit needs a systematic method.',
            ],
          },
          {
            heading: 'Mesh analysis (KVL)',
            body: [
              'Give each window of the circuit a loop current, both clockwise. Walk round each loop adding voltage drops (Kirchhoff’s voltage law). R2 is shared, so it carries the difference of the two loop currents. Two loops give two equations in I1 and I2:',
              'A negative answer just means that loop current flows anticlockwise.',
            ],
            formulas: [
              '(R1 + R2)·I1 − R2·I2 = V1',
              '−R2·I1 + (R2 + R3)·I2 = −V2',
              'I_R2 = I1 − I2',
            ],
          },
          {
            heading: 'Nodal analysis (KCL)',
            body: [
              'Pick ground as 0 V. Only node A is unknown. Write every current leaving A in terms of VA (Kirchhoff’s current law says they sum to zero), and solve one equation:',
            ],
            formulas: [
              '(VA − V1)/R1 + VA/R2 + (VA − V2)/R3 = 0',
              'VA = (V1/R1 + V2/R3) / (1/R1 + 1/R2 + 1/R3)',
            ],
          },
          {
            heading: 'Which method to choose',
            body: [
              'Both give the same currents. Count the unknowns: mesh needs one equation per window, nodal one per node apart from ground. Here that is two against one, so nodal is shorter. Circuits with many parallel branches favour nodal; long ladders with few nodes but many current sources can favour mesh.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V1 = 9 V, V2 = 5 V, R1 = 220 Ω, R2 = 470 Ω, R3 = 330 Ω.',
            'Mesh: 690·I1 − 470·I2 = 9 and −470·I1 + 800·I2 = −5; Δ = 690·800 − 470² = 331 100 Ω².',
            'I1 = 14.65 mA, I2 = 2.36 mA, so I_R2 = I1 − I2 = 12.29 mA.',
            'Node: VA·(4.545 + 2.128 + 3.030) mS = 40.909 + 15.152 mA, so VA = 56.06/9.703 = 5.78 V.',
            'Check: I_R1 = (9 − 5.78)/220 = 14.65 mA = I1, and I_R3 = (5.78 − 5)/330 = 2.36 mA = I2. The 5 V source absorbs power: it is being charged.',
          ],
        },
        mistakes: [
          'Forgetting that a shared resistor carries both loop currents: its drop is R2·(I1 − I2), not R2·I1.',
          'Mixing current directions in KCL. Write every current as leaving the node, and let the signs come out of the algebra.',
          'Reading a negative mesh current as an error. It only means the current flows opposite to the assumed direction.',
        ],
        faq: [
          {
            q: 'What is the difference between mesh and nodal analysis?',
            a: 'Mesh analysis uses loop currents and Kirchhoff’s voltage law, one equation per window. Nodal analysis uses node voltages and Kirchhoff’s current law, one equation per non-ground node. Both give the same answer.',
          },
          {
            q: 'When should I use nodal analysis instead of mesh analysis?',
            a: 'When the circuit has fewer non-ground nodes than windows, as with many parallel branches. Pick whichever gives fewer unknowns.',
          },
          {
            q: 'What does a negative mesh current mean?',
            a: 'That the loop current actually flows opposite to the direction you assumed, usually anticlockwise if you assumed clockwise. The working is still correct.',
          },
        ],
      },
      th: {
        nav: 'วิเคราะห์เมชและโนด',
        h1: 'การวิเคราะห์เมชและโนด แก้ทีละขั้นตอน',
        lead: 'แหล่งจ่ายสองตัว ตัวต้านทานสามตัว: ใช้กฎอนุกรม–ขนานอย่างเดียวไม่ได้ แก้วงจรเดียวกันด้วยกระแสลูป (KVL) และด้วยแรงดันโนด (KCL) แล้วดูว่าทำไมวิธีหนึ่งจึงสั้นกว่า',
        card: 'แก้วงจรที่มีแหล่งจ่ายสองตัวด้วยกระแสลูป KVL และด้วย KCL ที่โนด พร้อมแทนค่าทุกตัว',
        sections: [
          {
            heading: 'วงจร',
            body: [
              'V1 จ่ายไปยังโนด A ผ่าน R1, R2 ต่อจาก A ลงกราวด์ และ R3 ต่อ A ไปยังแหล่งจ่ายตัวที่สอง V2 แหล่งจ่ายตัวใดตัวหนึ่งอธิบายกระแสทั้งหมดไม่ได้ วงจรนี้จึงต้องใช้วิธีที่เป็นระบบ',
            ],
          },
          {
            heading: 'การวิเคราะห์เมช (KVL)',
            body: [
              'กำหนดกระแสลูปให้แต่ละช่องของวงจร ทั้งสองไหลตามเข็มนาฬิกา เดินรอบแต่ละลูปและรวมแรงดันตก (กฎแรงดันของเคอร์ชอฟฟ์) R2 อยู่ร่วมกันสองลูป จึงมีกระแสเป็นผลต่างของกระแสลูปทั้งสอง สองลูปให้สองสมการใน I1 และ I2:',
              'ถ้าได้คำตอบเป็นลบ แปลว่ากระแสลูปนั้นไหลทวนเข็มนาฬิกา',
            ],
            formulas: [
              '(R1 + R2)·I1 − R2·I2 = V1',
              '−R2·I1 + (R2 + R3)·I2 = −V2',
              'I_R2 = I1 − I2',
            ],
          },
          {
            heading: 'การวิเคราะห์โนด (KCL)',
            body: [
              'ให้กราวด์เป็น 0 V มีเพียงโนด A ที่ไม่รู้ค่า เขียนกระแสทุกเส้นที่ไหลออกจาก A ในรูปของ VA (กฎกระแสของเคอร์ชอฟฟ์บอกว่ารวมกันเป็นศูนย์) แล้วแก้สมการเดียว:',
            ],
            formulas: [
              '(VA − V1)/R1 + VA/R2 + (VA − V2)/R3 = 0',
              'VA = (V1/R1 + V2/R3) / (1/R1 + 1/R2 + 1/R3)',
            ],
          },
          {
            heading: 'เลือกวิธีใด',
            body: [
              'ทั้งสองวิธีให้กระแสเท่ากัน ให้นับตัวไม่ทราบค่า: วิธีเมชใช้หนึ่งสมการต่อหนึ่งช่อง วิธีโนดใช้หนึ่งสมการต่อหนึ่งโนดที่ไม่ใช่กราวด์ ในวงจรนี้คือสองต่อหนึ่ง วิธีโนดจึงสั้นกว่า วงจรที่มีกิ่งขนานมากเหมาะกับวิธีโนด ส่วนวงจรแบบบันไดยาวที่มีโนดน้อยแต่มีแหล่งจ่ายกระแสมากอาจเหมาะกับวิธีเมช',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V1 = 9 V, V2 = 5 V, R1 = 220 Ω, R2 = 470 Ω, R3 = 330 Ω',
            'เมช: 690·I1 − 470·I2 = 9 และ −470·I1 + 800·I2 = −5; Δ = 690·800 − 470² = 331 100 Ω²',
            'I1 = 14.65 mA, I2 = 2.36 mA ดังนั้น I_R2 = I1 − I2 = 12.29 mA',
            'โนด: VA·(4.545 + 2.128 + 3.030) mS = 40.909 + 15.152 mA ดังนั้น VA = 56.06/9.703 = 5.78 V',
            'ตรวจสอบ: I_R1 = (9 − 5.78)/220 = 14.65 mA = I1 และ I_R3 = (5.78 − 5)/330 = 2.36 mA = I2 แหล่งจ่าย 5 V รับกำลัง: กำลังถูกชาร์จ',
          ],
        },
        mistakes: [
          'ลืมว่าตัวต้านทานที่อยู่ร่วมกันมีกระแสลูปทั้งสองไหลผ่าน: แรงดันตกคือ R2·(I1 − I2) ไม่ใช่ R2·I1',
          'กำหนดทิศกระแสปนกันใน KCL ให้เขียนกระแสทุกเส้นเป็นกระแสที่ไหลออกจากโนด แล้วให้พีชคณิตบอกเครื่องหมาย',
          'คิดว่ากระแสเมชที่เป็นลบคือความผิดพลาด ที่จริงแปลว่ากระแสไหลสวนทางกับทิศที่สมมติไว้เท่านั้น',
        ],
        faq: [
          {
            q: 'การวิเคราะห์เมชกับการวิเคราะห์โนดต่างกันอย่างไร?',
            a: 'การวิเคราะห์เมชใช้กระแสลูปและกฎแรงดันของเคอร์ชอฟฟ์ หนึ่งสมการต่อหนึ่งช่อง การวิเคราะห์โนดใช้แรงดันโนดและกฎกระแสของเคอร์ชอฟฟ์ หนึ่งสมการต่อหนึ่งโนดที่ไม่ใช่กราวด์ ทั้งสองวิธีได้คำตอบเดียวกัน',
          },
          {
            q: 'ควรใช้การวิเคราะห์โนดแทนการวิเคราะห์เมชเมื่อใด?',
            a: 'เมื่อวงจรมีโนดที่ไม่ใช่กราวด์น้อยกว่าจำนวนช่อง เช่น วงจรที่มีกิ่งขนานหลายกิ่ง ให้เลือกวิธีที่มีตัวไม่ทราบค่าน้อยกว่า',
          },
          {
            q: 'กระแสเมชที่เป็นลบหมายความว่าอะไร?',
            a: 'หมายความว่ากระแสลูปไหลจริงในทิศตรงข้ามกับที่สมมติไว้ โดยทั่วไปคือทวนเข็มนาฬิกาถ้าสมมติไว้ตามเข็มนาฬิกา การคำนวณยังถูกต้อง',
          },
        ],
      },
    },
  },
];
