import type { ElectronicsState } from '@/lib/state/schemas';
import type { Topic } from './types';

/**
 * Electronics module topics. Worked examples use the simulator's default
 * values, so the numbers in the text are the numbers on screen.
 */
export const ELECTRONICS_TOPICS: readonly Topic<ElectronicsState['mode']>[] = [
  {
    module: 'electronics',
    slug: 'pn-junction',
    mode: 'pn',
    seo: {
      title: 'P-N Junction Simulator — Depletion Region & Band Diagram',
      description:
        'Watch a P-N junction form: holes, electrons and fixed ions, the depletion region and built-in potential, and how forward and reverse bias change the barrier.',
      keywords: [
        'pn junction simulation',
        'depletion region',
        'built-in potential',
        'energy band diagram',
        'forward bias reverse bias',
        'semiconductor',
        'รอยต่อพีเอ็น',
        'บริเวณปลอดพาหะ',
      ],
      teaches: ['P-N junction', 'Depletion region', 'Built-in potential', 'Energy bands', 'Bias'],
    },
    text: {
      en: {
        nav: 'P/N junction',
        h1: 'The P/N junction: depletion region, barrier and bias',
        lead: 'Join P-type and N-type silicon and watch the depletion region form. Apply forward or reverse bias and see the barrier, the field and the current respond.',
        card: 'Holes, electrons and fixed ions; the depletion region, built-in potential and band diagram; forward and reverse bias.',
        sections: [
          {
            heading: 'Doping makes two kinds of silicon',
            body: [
              'Pure silicon has very few free carriers, about 10¹⁰ cm⁻³ at room temperature. Doping changes that. Adding acceptor atoms (boron) gives P-type silicon, full of mobile holes; adding donor atoms (phosphorus) gives N-type, full of free electrons. Each side stays electrically neutral: every hole is balanced by a fixed negative acceptor ion, every electron by a fixed positive donor ion.',
              'The minority carriers on each side follow the mass-action law, n·p = ni², so a side doped to 10¹⁶ cm⁻³ has only 10⁴ cm⁻³ of the other carrier.',
            ],
            formulas: ['n · p = ni²', 'P side: p ≈ Na,  n ≈ ni²/Na', 'N side: n ≈ Nd,  p ≈ ni²/Nd'],
          },
          {
            heading: 'The depletion region and built-in potential',
            body: [
              'Where the two meet, electrons diffuse into P and holes into N, and they recombine. They leave behind the fixed ions: a layer of negative charge on the P side and positive charge on the N side. That charge sets up an electric field, pointing from N to P, which pushes back on further diffusion. The balance is reached at the built-in potential Vbi.',
              'The region swept clear of mobile carriers is the depletion region. Its width shrinks with heavier doping, and it reaches mostly into the more lightly doped side, because the charge on both sides must balance.',
            ],
            formulas: [
              'Vbi = VT · ln(Na·Nd / ni²),   VT = kT/q ≈ 25.9 mV',
              'W = √( 2ε(Vbi − Va)/q · (1/Na + 1/Nd) )',
              'xp·Na = xn·Nd,   Emax = q·Na·xp / ε',
            ],
          },
          {
            heading: 'Forward and reverse bias',
            body: [
              'Forward bias (P positive) works against the built-in field: the barrier falls to Vbi − Va, the depletion region narrows, and carriers pour across. The current rises exponentially with voltage. Reverse bias adds to the barrier: the depletion region widens, the field grows, and only a tiny leakage of thermally generated minority carriers flows. This one-way behaviour is the diode.',
            ],
            formulas: ['I = Is · (exp(Va / VT) − 1)'],
          },
          {
            heading: 'Reading the band diagram',
            body: [
              'The band diagram plots electron energy across the junction. The conduction band Ec and valence band Ev bend by q(Vbi − Va): the hill an electron must climb to cross from N to P. With no bias the Fermi level EF is flat; under bias it splits by qVa between the two sides.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Silicon, Na = Nd = 10¹⁶ cm⁻³, ni = 10¹⁰ cm⁻³, T = 300 K.',
            'Vbi = 0.0259 · ln(10³² / 10²⁰) = 0.714 V.',
            'At zero bias W = 0.430 µm, split equally (0.215 µm each side); Emax = 33.2 kV/cm.',
            'Forward 0.5 V: W shrinks to 0.235 µm and the current grows by a factor of about 2.5 × 10⁸.',
            'Reverse 5 V: W grows to 1.22 µm and Emax to 94 kV/cm, but only leakage current flows.',
          ],
        },
        mistakes: [
          'Thinking the depletion region holds no charge. It holds no mobile carriers, but it is full of fixed ions; that charge makes the field.',
          'Expecting the depletion region to sit equally on both sides. It extends mostly into the lightly doped side.',
          'Applying forward bias above Vbi. The barrier never vanishes: long before Va reaches Vbi the current is so large that the resistance of the silicon and wires takes over.',
        ],
        faq: [
          {
            q: 'What is the depletion region in a P-N junction?',
            a: 'A thin layer around the junction where electrons and holes have diffused across and recombined, leaving only fixed ions. Their charge creates an electric field and the built-in potential that stop further diffusion.',
          },
          {
            q: 'How do you calculate the built-in potential?',
            a: 'Vbi = (kT/q)·ln(Na·Nd/ni²). For silicon with Na = Nd = 10¹⁶ cm⁻³ at 300 K, Vbi ≈ 0.71 V.',
          },
          {
            q: 'What happens to the depletion region under reverse bias?',
            a: 'It widens, in proportion to the square root of (Vbi − Va), and the electric field grows. Only a small leakage current of minority carriers flows.',
          },
        ],
      },
      th: {
        nav: 'รอยต่อ P/N',
        h1: 'รอยต่อ P/N: บริเวณปลอดพาหะ กำแพงศักย์ และไบแอส',
        lead: 'ต่อซิลิคอนชนิด P กับชนิด N แล้วดูบริเวณปลอดพาหะก่อตัวขึ้น ให้ไบแอสตรงหรือไบแอสกลับ แล้วดูกำแพงศักย์ สนามไฟฟ้า และกระแสเปลี่ยนไป',
        card: 'โฮล อิเล็กตรอน และไอออนที่อยู่กับที่ บริเวณปลอดพาหะ ศักย์ในตัว และแผนภาพแถบพลังงาน ไบแอสตรงและไบแอสกลับ',
        sections: [
          {
            heading: 'การโด๊ปทำให้ได้ซิลิคอนสองชนิด',
            body: [
              'ซิลิคอนบริสุทธิ์มีพาหะอิสระน้อยมาก ประมาณ 10¹⁰ cm⁻³ ที่อุณหภูมิห้อง การโด๊ปเปลี่ยนสิ่งนั้น การเติมอะตอมตัวรับ (โบรอน) ได้ซิลิคอนชนิด P ที่มีโฮลเคลื่อนที่ได้มากมาย การเติมอะตอมตัวให้ (ฟอสฟอรัส) ได้ชนิด N ที่มีอิเล็กตรอนอิสระมากมาย แต่ละด้านยังคงเป็นกลางทางไฟฟ้า: โฮลทุกตัวถูกดุลด้วยไอออนลบของตัวรับที่อยู่กับที่ อิเล็กตรอนทุกตัวถูกดุลด้วยไอออนบวกของตัวให้',
              'พาหะส่วนน้อยในแต่ละด้านเป็นไปตามกฎการกระทำมวล n·p = ni² ด้านที่โด๊ป 10¹⁶ cm⁻³ จึงมีพาหะอีกชนิดเพียง 10⁴ cm⁻³',
            ],
            formulas: ['n · p = ni²', 'ด้าน P: p ≈ Na,  n ≈ ni²/Na', 'ด้าน N: n ≈ Nd,  p ≈ ni²/Nd'],
          },
          {
            heading: 'บริเวณปลอดพาหะและศักย์ในตัว',
            body: [
              'ที่รอยต่อ อิเล็กตรอนแพร่เข้าไปในด้าน P และโฮลแพร่เข้าไปในด้าน N แล้วรวมตัวกัน ทิ้งไอออนที่อยู่กับที่ไว้: ชั้นประจุลบในด้าน P และประจุบวกในด้าน N ประจุนั้นสร้างสนามไฟฟ้าชี้จาก N ไป P ซึ่งต้านการแพร่ต่อไป สมดุลเกิดขึ้นที่ศักย์ในตัว Vbi',
              'บริเวณที่ไม่มีพาหะเคลื่อนที่เรียกว่าบริเวณปลอดพาหะ ความกว้างลดลงเมื่อโด๊ปหนักขึ้น และขยายเข้าไปในด้านที่โด๊ปเบากว่าเป็นส่วนใหญ่ เพราะประจุทั้งสองด้านต้องเท่ากัน',
            ],
            formulas: [
              'Vbi = VT · ln(Na·Nd / ni²),   VT = kT/q ≈ 25.9 mV',
              'W = √( 2ε(Vbi − Va)/q · (1/Na + 1/Nd) )',
              'xp·Na = xn·Nd,   Emax = q·Na·xp / ε',
            ],
          },
          {
            heading: 'ไบแอสตรงและไบแอสกลับ',
            body: [
              'ไบแอสตรง (ด้าน P เป็นบวก) ต้านสนามในตัว: กำแพงศักย์ลดลงเหลือ Vbi − Va บริเวณปลอดพาหะแคบลง และพาหะไหลข้ามรอยต่อ กระแสเพิ่มแบบเอกซ์โพเนนเชียลตามแรงดัน ไบแอสกลับเสริมกำแพงศักย์: บริเวณปลอดพาหะกว้างขึ้น สนามแรงขึ้น และมีเพียงกระแสรั่วเล็กน้อยจากพาหะส่วนน้อยที่เกิดจากความร้อน พฤติกรรมทางเดียวนี้คือไดโอด',
            ],
            formulas: ['I = Is · (exp(Va / VT) − 1)'],
          },
          {
            heading: 'การอ่านแผนภาพแถบพลังงาน',
            body: [
              'แผนภาพแถบพลังงานแสดงพลังงานของอิเล็กตรอนตลอดรอยต่อ แถบนำไฟฟ้า Ec และแถบวาเลนซ์ Ev โค้งไป q(Vbi − Va) ซึ่งคือเนินที่อิเล็กตรอนต้องปีนขึ้นเพื่อข้ามจาก N ไป P เมื่อไม่มีไบแอส ระดับเฟอร์มี EF เป็นเส้นตรง เมื่อมีไบแอส ระดับเฟอร์มีทั้งสองด้านแยกห่างกัน qVa',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'ซิลิคอน Na = Nd = 10¹⁶ cm⁻³, ni = 10¹⁰ cm⁻³, T = 300 K',
            'Vbi = 0.0259 · ln(10³² / 10²⁰) = 0.714 V',
            'ที่ไม่มีไบแอส W = 0.430 µm แบ่งเท่ากัน (ด้านละ 0.215 µm); Emax = 33.2 kV/cm',
            'ไบแอสตรง 0.5 V: W แคบลงเหลือ 0.235 µm และกระแสเพิ่มขึ้นประมาณ 2.5 × 10⁸ เท่า',
            'ไบแอสกลับ 5 V: W กว้างขึ้นเป็น 1.22 µm และ Emax เป็น 94 kV/cm แต่มีเพียงกระแสรั่วไหล',
          ],
        },
        mistakes: [
          'คิดว่าบริเวณปลอดพาหะไม่มีประจุ ที่จริงไม่มีพาหะเคลื่อนที่ แต่เต็มไปด้วยไอออนที่อยู่กับที่ ประจุนั้นสร้างสนามไฟฟ้า',
          'คาดว่าบริเวณปลอดพาหะอยู่เท่ากันทั้งสองด้าน ที่จริงขยายเข้าไปในด้านที่โด๊ปเบาเป็นส่วนใหญ่',
          'ให้ไบแอสตรงเกิน Vbi กำแพงศักย์ไม่เคยหายไป ก่อนที่ Va จะถึง Vbi กระแสจะมากจนความต้านทานของซิลิคอนและสายไฟเป็นตัวจำกัด',
        ],
        faq: [
          {
            q: 'บริเวณปลอดพาหะในรอยต่อ P-N คืออะไร?',
            a: 'ชั้นบาง ๆ รอบรอยต่อที่อิเล็กตรอนและโฮลแพร่ข้ามและรวมตัวกันไปแล้ว เหลือเพียงไอออนที่อยู่กับที่ ประจุของไอออนสร้างสนามไฟฟ้าและศักย์ในตัวที่หยุดการแพร่ต่อไป',
          },
          {
            q: 'คำนวณศักย์ในตัวอย่างไร?',
            a: 'Vbi = (kT/q)·ln(Na·Nd/ni²) สำหรับซิลิคอนที่ Na = Nd = 10¹⁶ cm⁻³ ที่ 300 K ได้ Vbi ≈ 0.71 V',
          },
          {
            q: 'บริเวณปลอดพาหะเป็นอย่างไรเมื่อไบแอสกลับ?',
            a: 'กว้างขึ้นตามรากที่สองของ (Vbi − Va) และสนามไฟฟ้าแรงขึ้น มีเพียงกระแสรั่วเล็กน้อยจากพาหะส่วนน้อยไหล',
          },
        ],
      },
    },
  },
  {
    module: 'electronics',
    slug: 'diode',
    mode: 'diode',
    seo: {
      title: 'Diode Simulator — I-V Curve, Load Line & LED Circuit',
      description:
        'Put a diode or LED in a circuit and find the operating point on its I-V curve with the load line. Compare the ideal, 0.7 V drop and exponential diode models.',
      keywords: [
        'diode simulator',
        'diode I-V curve',
        'diode load line',
        'diode models',
        'LED resistor calculator',
        'Shockley diode equation',
        'ไดโอด',
        'กราฟ I-V ไดโอด',
      ],
      teaches: ['Diode I-V characteristic', 'Load-line analysis', 'Diode models', 'LEDs'],
    },
    text: {
      en: {
        nav: 'Diode',
        h1: 'Diodes: I-V curve, load line and LEDs',
        lead: 'Put a diode in series with a resistor and find where its I-V curve meets the circuit’s load line. Swap in an LED and see why each colour needs a different voltage.',
        card: 'The I-V curve and load line; ideal, 0.7 V and exponential models compared; silicon, germanium and LEDs.',
        sections: [
          {
            heading: 'The diode’s I-V curve',
            body: [
              'A diode is a P/N junction with two leads: the anode (P) and the cathode (N). Its current follows the Shockley equation. In reverse it passes almost nothing; in forward it passes almost nothing until the knee, then the current climbs steeply, roughly tenfold for every 60 mV more.',
            ],
            formulas: [
              'I = Is · (exp(V / (n·VT)) − 1)',
              'ΔV ≈ n·VT·ln(10) ≈ 60 mV per decade of current (n = 1)',
            ],
          },
          {
            heading: 'Load-line analysis',
            body: [
              'In a circuit, the diode’s voltage and current are tied to the rest of the loop by Kirchhoff’s law: VS = I·R + VD. Plotted on the same axes, that is a straight line from (VS, 0) to (0, VS/R): the load line. The operating point Q is where it crosses the diode’s curve; both the diode and the circuit are satisfied there.',
            ],
            formulas: ['I = (VS − VD) / R'],
          },
          {
            heading: 'Three models, three levels of detail',
            body: [
              'Hand analysis rarely needs the full exponential. Pick the simplest model that answers the question:',
            ],
            bullets: [
              'Ideal: a switch. On in forward with 0 V drop, off in reverse. Good for seeing which way current flows.',
              'Constant drop: 0.7 V once on (0.3 V for germanium). Good for most circuit calculations.',
              'Exponential (Shockley): the real curve. Needed for small signals, temperature effects and the exact operating point.',
            ],
          },
          {
            heading: 'LEDs: the voltage is the colour',
            body: [
              'In an LED each electron crossing the junction gives up its energy as a photon. The photon’s energy is about the band gap, so the forward voltage tracks the colour: about 1.9 V for red, 2.2 V for green, 2.9 V for blue. Shorter wavelength, more energy per photon, higher voltage. An LED always needs a series resistor to set its current: R = (VS − Vf)/I.',
            ],
            formulas: ['E_photon = hc/λ ≈ 1240 / λ(nm) eV ≈ q·Vf', 'R = (VS − Vf) / I_LED'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Silicon diode, VS = 5 V, R = 430 Ω.',
            'Constant-drop model: I = (5 − 0.7)/430 = 10.0 mA.',
            'Exponential model: Q at VD = 0.700 V, I = 10.0 mA. The 0.7 V model is spot on here.',
            'Ideal model: I = 5/430 = 11.6 mA, 16% too high because it ignores the drop.',
            'Swap in a red LED: VD = 1.88 V, I = 7.25 mA. For exactly 10 mA you would need R = (5 − 1.9)/0.01 = 310 Ω.',
          ],
        },
        mistakes: [
          'Connecting an LED straight across a supply with no resistor. The exponential curve means the current, and the heat, run away.',
          'Using the ideal model when the supply is only a few volts. A 0.7 V drop out of 5 V is a 14% error.',
          'Reading reverse current as zero forever. It is tiny, but every diode breaks down at a high enough reverse voltage.',
        ],
        faq: [
          {
            q: 'How do you find a diode’s operating point?',
            a: 'Draw the load line I = (VS − V)/R on the diode’s I-V curve. The point where they cross gives the diode voltage and current, satisfying both the diode and the circuit.',
          },
          {
            q: 'Why is the diode voltage drop 0.7 V?',
            a: 'For a silicon diode at a few milliamps, the Shockley equation gives about 0.6–0.7 V. The voltage changes only about 60 mV for each tenfold change in current, so 0.7 V is a good fixed estimate.',
          },
          {
            q: 'How do you calculate the resistor for an LED?',
            a: 'R = (VS − Vf)/I. A red LED (Vf ≈ 1.9 V) at 10 mA from 5 V needs about 310 Ω; use the next standard value, 330 Ω.',
          },
        ],
      },
      th: {
        nav: 'ไดโอด',
        h1: 'ไดโอด: กราฟ I-V เส้นโหลด และ LED',
        lead: 'ต่อไดโอดอนุกรมกับตัวต้านทาน แล้วหาจุดที่กราฟ I-V ของไดโอดตัดกับเส้นโหลดของวงจร เปลี่ยนเป็น LED แล้วดูว่าทำไมแต่ละสีจึงต้องการแรงดันต่างกัน',
        card: 'กราฟ I-V และเส้นโหลด เปรียบเทียบแบบจำลองอุดมคติ 0.7 V และเอกซ์โพเนนเชียล ซิลิคอน เจอร์เมเนียม และ LED',
        sections: [
          {
            heading: 'กราฟ I-V ของไดโอด',
            body: [
              'ไดโอดคือรอยต่อ P/N ที่มีขาสองขา: แอโนด (P) และแคโทด (N) กระแสเป็นไปตามสมการของช็อกลีย์ ในทิศกลับแทบไม่มีกระแสไหล ในทิศตรงก็แทบไม่มีกระแสจนถึงจุดหัวเข่า จากนั้นกระแสเพิ่มอย่างรวดเร็ว ประมาณสิบเท่าทุก ๆ 60 mV ที่เพิ่มขึ้น',
            ],
            formulas: [
              'I = Is · (exp(V / (n·VT)) − 1)',
              'ΔV ≈ n·VT·ln(10) ≈ 60 mV ต่อกระแสที่เพิ่มสิบเท่า (n = 1)',
            ],
          },
          {
            heading: 'การวิเคราะห์ด้วยเส้นโหลด',
            body: [
              'ในวงจร แรงดันและกระแสของไดโอดผูกกับส่วนที่เหลือของลูปด้วยกฎของเคอร์ชอฟฟ์: VS = I·R + VD เมื่อพล็อตบนแกนเดียวกัน จะได้เส้นตรงจาก (VS, 0) ถึง (0, VS/R) เรียกว่าเส้นโหลด จุดทำงาน Q คือจุดที่เส้นนี้ตัดกับกราฟของไดโอด ซึ่งเป็นจุดที่ทั้งไดโอดและวงจรเป็นจริงพร้อมกัน',
            ],
            formulas: ['I = (VS − VD) / R'],
          },
          {
            heading: 'สามแบบจำลอง สามระดับความละเอียด',
            body: [
              'การวิเคราะห์ด้วยมือแทบไม่ต้องใช้สมการเอกซ์โพเนนเชียลเต็มรูป ให้เลือกแบบจำลองที่ง่ายที่สุดที่ตอบคำถามได้:',
            ],
            bullets: [
              'อุดมคติ: เป็นสวิตช์ เปิดในทิศตรงโดยไม่มีแรงดันตก ปิดในทิศกลับ เหมาะสำหรับดูว่ากระแสไหลทางไหน',
              'แรงดันตกคงที่: 0.7 V เมื่อนำกระแส (0.3 V สำหรับเจอร์เมเนียม) เหมาะกับการคำนวณวงจรส่วนใหญ่',
              'เอกซ์โพเนนเชียล (ช็อกลีย์): กราฟจริง จำเป็นสำหรับสัญญาณขนาดเล็ก ผลของอุณหภูมิ และจุดทำงานที่แม่นยำ',
            ],
          },
          {
            heading: 'LED: แรงดันคือสี',
            body: [
              'ใน LED อิเล็กตรอนแต่ละตัวที่ข้ามรอยต่อจะปล่อยพลังงานออกมาเป็นโฟตอน พลังงานของโฟตอนใกล้เคียงกับแถบช่องว่างพลังงาน แรงดันไบแอสตรงจึงเปลี่ยนตามสี: ประมาณ 1.9 V สำหรับสีแดง 2.2 V สำหรับสีเขียว 2.9 V สำหรับสีน้ำเงิน ความยาวคลื่นสั้นลง พลังงานต่อโฟตอนมากขึ้น แรงดันสูงขึ้น LED ต้องมีตัวต้านทานอนุกรมเพื่อกำหนดกระแสเสมอ: R = (VS − Vf)/I',
            ],
            formulas: ['E_photon = hc/λ ≈ 1240 / λ(nm) eV ≈ q·Vf', 'R = (VS − Vf) / I_LED'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'ไดโอดซิลิคอน VS = 5 V, R = 430 Ω',
            'แบบจำลองแรงดันตกคงที่: I = (5 − 0.7)/430 = 10.0 mA',
            'แบบจำลองเอกซ์โพเนนเชียล: Q ที่ VD = 0.700 V, I = 10.0 mA แบบจำลอง 0.7 V ตรงพอดีในกรณีนี้',
            'แบบจำลองอุดมคติ: I = 5/430 = 11.6 mA สูงเกิน 16% เพราะไม่คิดแรงดันตก',
            'เปลี่ยนเป็น LED สีแดง: VD = 1.88 V, I = 7.25 mA ถ้าต้องการ 10 mA พอดีต้องใช้ R = (5 − 1.9)/0.01 = 310 Ω',
          ],
        },
        mistakes: [
          'ต่อ LED คร่อมแหล่งจ่ายตรง ๆ โดยไม่มีตัวต้านทาน กราฟแบบเอกซ์โพเนนเชียลทำให้กระแสและความร้อนพุ่งสูงจนควบคุมไม่ได้',
          'ใช้แบบจำลองอุดมคติเมื่อแหล่งจ่ายมีเพียงไม่กี่โวลต์ แรงดันตก 0.7 V จาก 5 V คือความคลาดเคลื่อน 14%',
          'คิดว่ากระแสย้อนกลับเป็นศูนย์ตลอดไป ที่จริงมีค่าน้อยมาก แต่ไดโอดทุกตัวจะพังทลายเมื่อแรงดันย้อนกลับสูงพอ',
        ],
        faq: [
          {
            q: 'หาจุดทำงานของไดโอดอย่างไร?',
            a: 'วาดเส้นโหลด I = (VS − V)/R บนกราฟ I-V ของไดโอด จุดที่ตัดกันให้แรงดันและกระแสของไดโอดที่เป็นจริงทั้งสำหรับไดโอดและวงจร',
          },
          {
            q: 'ทำไมแรงดันตกคร่อมไดโอดจึงเป็น 0.7 V?',
            a: 'สำหรับไดโอดซิลิคอนที่กระแสไม่กี่มิลลิแอมป์ สมการช็อกลีย์ให้ประมาณ 0.6–0.7 V แรงดันเปลี่ยนเพียงประมาณ 60 mV ต่อกระแสที่เปลี่ยนสิบเท่า 0.7 V จึงเป็นค่าประมาณคงที่ที่ดี',
          },
          {
            q: 'คำนวณตัวต้านทานสำหรับ LED อย่างไร?',
            a: 'R = (VS − Vf)/I LED สีแดง (Vf ≈ 1.9 V) ที่ 10 mA จากแหล่งจ่าย 5 V ต้องใช้ประมาณ 310 Ω ให้ใช้ค่ามาตรฐานถัดไปคือ 330 Ω',
          },
        ],
      },
    },
  },
  {
    module: 'electronics',
    slug: 'bjt',
    mode: 'bjt',
    seo: {
      title: 'BJT Transistor Simulator — Cutoff, Active, Saturation',
      description:
        'See how an NPN transistor works: a small base current controls a large collector current, IC = β·IB, on live output curves with a load line and its three regions.',
      keywords: [
        'transistor simulator',
        'BJT simulator',
        'NPN transistor',
        'transistor output characteristics',
        'cutoff active saturation',
        'transistor as a switch',
        'ทรานซิสเตอร์',
        'ทรานซิสเตอร์ BJT',
      ],
      teaches: [
        'Bipolar junction transistor',
        'Current gain β',
        'Operating regions',
        'Transistor switch',
      ],
    },
    text: {
      en: {
        nav: 'Transistor (BJT)',
        h1: 'The BJT transistor: a small current controls a large one',
        lead: 'Drive an NPN transistor’s base and watch the collector current follow, β times larger. Move along the load line from cutoff, through the active region, into saturation.',
        card: 'IC = β·IB on live output curves; the load line; cutoff, active and saturation; the transistor as a switch.',
        sections: [
          {
            heading: 'Two junctions, one thin base',
            body: [
              'An NPN bipolar junction transistor is two P/N junctions back to back: N emitter, a very thin P base, N collector. Forward-bias the base–emitter junction and the emitter injects electrons into the base. The base is so thin that almost all of them diffuse straight through and are swept into the collector by the reverse-biased collector junction. Only a few recombine in the base; they make up the small base current.',
            ],
            formulas: ['IC = β · IB,   IE = IC + IB', 'VBE ≈ 0.6–0.7 V when conducting'],
          },
          {
            heading: 'Output characteristics and the load line',
            body: [
              'Plot collector current against VCE for several base currents and you get a family of nearly flat curves: in the active region IC depends on IB, hardly on VCE. The collector circuit adds a load line, IC = (VCC − VCE)/RC. The operating point sits where the load line meets the curve for the present IB.',
            ],
            formulas: ['IC = (VCC − VCE) / RC'],
          },
          {
            heading: 'Three regions',
            body: ['Where Q lands on the load line decides how the transistor behaves:'],
            bullets: [
              'Cutoff: VBE below about 0.5 V, no base current, so no collector current. The transistor is an open switch and VCE ≈ VCC.',
              'Active: IC = β·IB, controlled by the base. This is the region for amplifiers.',
              'Saturation: the base asks for more than RC lets through. IC is capped at about (VCC − 0.2)/RC and VCE ≈ 0.2 V. The transistor is a closed switch.',
            ],
          },
          {
            heading: 'The transistor as a switch',
            body: [
              'Digital and power circuits use only the two ends of the load line: cutoff for off, saturation for on. To make sure the transistor saturates, designers drive the base with two to ten times the minimum current IC,sat/β, so the switch stays on even with a low-β part.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'VBB = 2 V, RB = 100 kΩ, VCC = 12 V, RC = 2.2 kΩ, β = 100.',
            'Base loop: IB = (2 − 0.66)/100 k = 13.4 µA.',
            'Collector: IC ≈ β·IB = 1.46 mA (slightly over 100 × IB, from the Early effect); VCE = 12 − 1.46 mA × 2.2 kΩ = 8.80 V: active.',
            'Lower RB to 22 kΩ: IB = 59 µA would ask for 5.9 mA, but RC allows only (12 − 0.2)/2.2 k = 5.36 mA. The transistor saturates at VCE = 0.19 V.',
          ],
        },
        mistakes: [
          'Applying IC = β·IB in saturation. There the collector circuit limits IC, and IC/IB falls below β.',
          'Forgetting VBE: the base current is (VBB − 0.7)/RB, not VBB/RB.',
          'Treating β as a precise constant. It varies widely between parts and with temperature, which is why good amplifier designs don’t depend on it.',
        ],
        faq: [
          {
            q: 'How does a BJT transistor work?',
            a: 'A small base current lets a much larger current flow from collector to emitter: IC = β·IB, with β typically 50–300. Electrons injected by the forward-biased base–emitter junction cross the thin base and are collected by the reverse-biased collector junction.',
          },
          {
            q: 'What are the cutoff, active and saturation regions?',
            a: 'Cutoff: no base current, transistor off. Active: IC = β·IB, used for amplifying. Saturation: IC limited by the collector circuit, VCE ≈ 0.2 V, transistor fully on.',
          },
          {
            q: 'How do you use a transistor as a switch?',
            a: 'Drive it between cutoff (off) and saturation (on). Choose RB so that IB is several times IC,sat/β, so the transistor saturates even with a low β.',
          },
        ],
      },
      th: {
        nav: 'ทรานซิสเตอร์ (BJT)',
        h1: 'ทรานซิสเตอร์ BJT: กระแสเล็กควบคุมกระแสใหญ่',
        lead: 'ขับขาเบสของทรานซิสเตอร์ NPN แล้วดูกระแสคอลเลกเตอร์ตามมา มากกว่า β เท่า เลื่อนไปตามเส้นโหลดจากคัตออฟ ผ่านย่านแอกทีฟ เข้าสู่ย่านอิ่มตัว',
        card: 'IC = β·IB บนกราฟคุณลักษณะเอาต์พุตแบบสด เส้นโหลด ย่านคัตออฟ แอกทีฟ และอิ่มตัว ทรานซิสเตอร์เป็นสวิตช์',
        sections: [
          {
            heading: 'สองรอยต่อ ขาเบสบาง ๆ หนึ่งชั้น',
            body: [
              'ทรานซิสเตอร์แบบไบโพลาร์ชนิด NPN คือรอยต่อ P/N สองรอยต่อหันหลังชนกัน: อิมิตเตอร์ชนิด N เบสชนิด P ที่บางมาก และคอลเลกเตอร์ชนิด N เมื่อให้ไบแอสตรงกับรอยต่อเบส–อิมิตเตอร์ อิมิตเตอร์จะฉีดอิเล็กตรอนเข้าไปในเบส เบสบางมากจนอิเล็กตรอนเกือบทั้งหมดแพร่ผ่านไปตรง ๆ และถูกกวาดเข้าคอลเลกเตอร์ด้วยรอยต่อคอลเลกเตอร์ที่ไบแอสกลับ มีเพียงส่วนน้อยที่รวมตัวในเบส ซึ่งคือกระแสเบสเล็ก ๆ',
            ],
            formulas: ['IC = β · IB,   IE = IC + IB', 'VBE ≈ 0.6–0.7 V เมื่อนำกระแส'],
          },
          {
            heading: 'กราฟคุณลักษณะเอาต์พุตและเส้นโหลด',
            body: [
              'เมื่อพล็อตกระแสคอลเลกเตอร์เทียบกับ VCE สำหรับกระแสเบสหลายค่า จะได้กลุ่มเส้นที่เกือบแบนราบ: ในย่านแอกทีฟ IC ขึ้นกับ IB และแทบไม่ขึ้นกับ VCE วงจรคอลเลกเตอร์เพิ่มเส้นโหลด IC = (VCC − VCE)/RC จุดทำงานอยู่ที่เส้นโหลดตัดกับเส้นของ IB ปัจจุบัน',
            ],
            formulas: ['IC = (VCC − VCE) / RC'],
          },
          {
            heading: 'สามย่านการทำงาน',
            body: ['ตำแหน่งของ Q บนเส้นโหลดกำหนดพฤติกรรมของทรานซิสเตอร์:'],
            bullets: [
              'คัตออฟ: VBE ต่ำกว่าประมาณ 0.5 V ไม่มีกระแสเบส จึงไม่มีกระแสคอลเลกเตอร์ ทรานซิสเตอร์เป็นสวิตช์เปิดวงจร และ VCE ≈ VCC',
              'แอกทีฟ: IC = β·IB ควบคุมโดยเบส นี่คือย่านสำหรับวงจรขยาย',
              'อิ่มตัว: เบสต้องการกระแสมากกว่าที่ RC ยอมให้ผ่าน IC ถูกจำกัดที่ประมาณ (VCC − 0.2)/RC และ VCE ≈ 0.2 V ทรานซิสเตอร์เป็นสวิตช์ปิดวงจร',
            ],
          },
          {
            heading: 'ทรานซิสเตอร์เป็นสวิตช์',
            body: [
              'วงจรดิจิทัลและวงจรกำลังใช้เพียงปลายทั้งสองของเส้นโหลด: คัตออฟสำหรับปิด และอิ่มตัวสำหรับเปิด เพื่อให้แน่ใจว่าทรานซิสเตอร์อิ่มตัว ผู้ออกแบบจะขับเบสด้วยกระแสสองถึงสิบเท่าของกระแสขั้นต่ำ IC,sat/β สวิตช์จึงยังเปิดได้แม้ใช้ตัวที่มี β ต่ำ',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'VBB = 2 V, RB = 100 kΩ, VCC = 12 V, RC = 2.2 kΩ, β = 100',
            'ลูปเบส: IB = (2 − 0.66)/100 k = 13.4 µA',
            'คอลเลกเตอร์: IC ≈ β·IB = 1.46 mA (มากกว่า 100 × IB เล็กน้อยจากปรากฏการณ์เออร์ลี); VCE = 12 − 1.46 mA × 2.2 kΩ = 8.80 V: ย่านแอกทีฟ',
            'ลด RB เป็น 22 kΩ: IB = 59 µA ต้องการ 5.9 mA แต่ RC ยอมให้เพียง (12 − 0.2)/2.2 k = 5.36 mA ทรานซิสเตอร์จึงอิ่มตัวที่ VCE = 0.19 V',
          ],
        },
        mistakes: [
          'ใช้ IC = β·IB ในย่านอิ่มตัว ในย่านนั้นวงจรคอลเลกเตอร์จำกัด IC และ IC/IB ต่ำกว่า β',
          'ลืม VBE: กระแสเบสคือ (VBB − 0.7)/RB ไม่ใช่ VBB/RB',
          'ถือว่า β เป็นค่าคงที่แม่นยำ ที่จริง β ต่างกันมากระหว่างแต่ละตัวและเปลี่ยนตามอุณหภูมิ วงจรขยายที่ดีจึงออกแบบไม่ให้ขึ้นกับ β',
        ],
        faq: [
          {
            q: 'ทรานซิสเตอร์ BJT ทำงานอย่างไร?',
            a: 'กระแสเบสเล็ก ๆ ยอมให้กระแสที่ใหญ่กว่ามากไหลจากคอลเลกเตอร์ไปอิมิตเตอร์: IC = β·IB โดยทั่วไป β อยู่ระหว่าง 50–300 อิเล็กตรอนที่ฉีดโดยรอยต่อเบส–อิมิตเตอร์ที่ไบแอสตรงจะข้ามเบสบาง ๆ และถูกเก็บโดยรอยต่อคอลเลกเตอร์ที่ไบแอสกลับ',
          },
          {
            q: 'ย่านคัตออฟ แอกทีฟ และอิ่มตัวคืออะไร?',
            a: 'คัตออฟ: ไม่มีกระแสเบส ทรานซิสเตอร์ปิด แอกทีฟ: IC = β·IB ใช้สำหรับขยายสัญญาณ อิ่มตัว: IC ถูกจำกัดโดยวงจรคอลเลกเตอร์ VCE ≈ 0.2 V ทรานซิสเตอร์เปิดเต็มที่',
          },
          {
            q: 'ใช้ทรานซิสเตอร์เป็นสวิตช์อย่างไร?',
            a: 'ขับให้ทำงานระหว่างคัตออฟ (ปิด) และอิ่มตัว (เปิด) เลือก RB ให้ IB มากกว่า IC,sat/β หลายเท่า ทรานซิสเตอร์จึงอิ่มตัวแม้ β ต่ำ',
          },
        ],
      },
    },
  },
  {
    module: 'electronics',
    slug: 'amplifier',
    mode: 'amp',
    seo: {
      title: 'Common Emitter Amplifier Simulator — Gain, Bias, Clipping',
      description:
        'Bias a common-emitter BJT amplifier with a voltage divider, read its Q-point and gain, and push the input until the output distorts and clips on the load line.',
      keywords: [
        'common emitter amplifier',
        'transistor amplifier simulator',
        'voltage divider bias',
        'amplifier gain calculation',
        'AC load line',
        'bypass capacitor',
        'clipping distortion',
        'วงจรขยายอิมิตเตอร์ร่วม',
        'วงจรขยายทรานซิสเตอร์',
      ],
      teaches: [
        'Common-emitter amplifier',
        'Voltage-divider bias',
        'Small-signal gain',
        'Load lines',
        'Clipping',
      ],
    },
    text: {
      en: {
        nav: 'CE amplifier',
        h1: 'The common-emitter amplifier: bias, gain and clipping',
        lead: 'Bias a transistor in the middle of its load line, feed in a small sine wave and get a large, inverted copy out. Then push the input until the output distorts and clips.',
        card: 'Voltage-divider bias and the Q-point; gain −RC∥RL/(re + RE); the bypass capacitor; distortion and clipping on the AC load line.',
        sections: [
          {
            heading: 'Step 1: the DC bias point',
            body: [
              'An amplifier first needs a quiet operating point in the middle of the active region, so the signal can swing both ways. A voltage divider R1–R2 holds the base at a fixed voltage, and the emitter resistor RE sets the current: VE = VB − 0.7 V, so IE = VE/RE. Because this hardly depends on β, the bias stays put when the transistor is swapped.',
            ],
            formulas: [
              'VTH = VCC·R2/(R1 + R2),   RTH = R1 ∥ R2',
              'IB = (VTH − VBE) / (RTH + (β + 1)·RE)',
              'IC = β·IB,   VCE = VCC − IC·RC − IE·RE',
            ],
          },
          {
            heading: 'Step 2: small-signal gain',
            body: [
              'For a small signal, the transistor looks like an emitter resistance re = VT/IE in series with whatever emitter resistance the signal sees. The collector current change flows through RC in parallel with the load RL (the coupling capacitors pass the signal but block DC), so the gain is the ratio of the two resistances, with a minus sign: the output is inverted.',
            ],
            formulas: [
              're = VT / IE ≈ 25.9 mV / IE',
              'Av = −(RC ∥ RL) / (re + RE,ac)',
              'Rin = R1 ∥ R2 ∥ (β + 1)(re + RE,ac)',
            ],
          },
          {
            heading: 'The bypass capacitor',
            body: [
              'A capacitor CE across RE shorts it for the signal but not for DC. With it (RE,ac = 0) the gain is large, −RC∥RL/re, but depends on re, which changes with current: big signals distort. Without it (RE,ac = RE) the gain falls to about −RC∥RL/RE, but becomes predictable and much more linear. That trade of gain for stability is negative feedback.',
            ],
          },
          {
            heading: 'Distortion and clipping',
            body: [
              'The signal moves the operating point along the AC load line. Push too far and it runs into a wall: cutoff, where the collector current reaches zero and the output’s top flattens, or saturation, where VCE reaches about 0.2 V and the bottom flattens. Even before clipping, a bypassed stage distorts, because the collector current is exponential in VBE. Biasing Q in the middle of the AC load line gives the largest clean swing.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'VCC = 12 V, R1 = 100 kΩ, R2 = 22 kΩ, RC = 4.7 kΩ, RE = 1 kΩ, RL = 10 kΩ, β = 100.',
            'VTH = 12 × 22/122 = 2.16 V, RTH = 18.0 kΩ → IC = 1.26 mA; VB = 1.94 V, VE = 1.28 V, VC = 6.06 V, VCE = 4.79 V.',
            're = 25.9 mV/1.28 mA = 20.3 Ω; RC ∥ RL = 3.20 kΩ.',
            'Bypassed: Av = −3.20 k/20.3 ≈ −156 (43.9 dB). A 2 mV input gives about 0.31 V out.',
            'Unbypassed: Av = −3.20 k/(20.3 + 1000) ≈ −3.1, and Rin rises from 1.84 kΩ to 15.3 kΩ.',
            'Bypassed with 10 mV in: the output reaches −1.91 V but only +1.30 V, already visibly distorted; by 50 mV it clips.',
          ],
        },
        mistakes: [
          'Forgetting the load. The gain uses RC ∥ RL, not RC alone.',
          'Including RE in the gain when it is bypassed, or leaving it out when it is not.',
          'Biasing near one end of the load line. The output then clips on that side long before the other.',
        ],
        faq: [
          {
            q: 'What is the voltage gain of a common-emitter amplifier?',
            a: 'Av ≈ −(RC ∥ RL)/(re + RE,ac), where re = VT/IE ≈ 26 mV/IE. With the emitter resistor bypassed RE,ac = 0 and the gain is large; unbypassed it is about −RC/RE. The minus sign means the output is inverted.',
          },
          {
            q: 'Why use voltage-divider bias?',
            a: 'It fixes the base voltage and lets the emitter resistor set the current, so the Q-point barely depends on β, which varies from transistor to transistor.',
          },
          {
            q: 'What causes clipping in a transistor amplifier?',
            a: 'The output can only swing until the transistor reaches cutoff (IC = 0) or saturation (VCE ≈ 0.2 V). A signal larger than that has its peaks flattened.',
          },
        ],
      },
      th: {
        nav: 'วงจรขยาย CE',
        h1: 'วงจรขยายแบบอิมิตเตอร์ร่วม: ไบแอส อัตราขยาย และการตัดยอด',
        lead: 'ไบแอสทรานซิสเตอร์ไว้กลางเส้นโหลด ป้อนคลื่นไซน์ขนาดเล็ก แล้วได้สัญญาณที่ใหญ่และกลับเฟสออกมา จากนั้นเพิ่มอินพุตจนเอาต์พุตผิดเพี้ยนและถูกตัดยอด',
        card: 'ไบแอสแบบแบ่งแรงดันและจุด Q อัตราขยาย −RC∥RL/(re + RE) ตัวเก็บประจุบายพาส ความผิดเพี้ยนและการตัดยอดบนเส้นโหลด AC',
        sections: [
          {
            heading: 'ขั้นที่ 1: จุดไบแอสไฟตรง',
            body: [
              'วงจรขยายต้องมีจุดทำงานขณะไม่มีสัญญาณอยู่กลางย่านแอกทีฟก่อน สัญญาณจึงแกว่งได้ทั้งสองทาง วงจรแบ่งแรงดัน R1–R2 ตรึงแรงดันเบสไว้ และตัวต้านทานอิมิตเตอร์ RE กำหนดกระแส: VE = VB − 0.7 V ดังนั้น IE = VE/RE เพราะค่านี้แทบไม่ขึ้นกับ β จุดไบแอสจึงคงที่เมื่อเปลี่ยนทรานซิสเตอร์',
            ],
            formulas: [
              'VTH = VCC·R2/(R1 + R2),   RTH = R1 ∥ R2',
              'IB = (VTH − VBE) / (RTH + (β + 1)·RE)',
              'IC = β·IB,   VCE = VCC − IC·RC − IE·RE',
            ],
          },
          {
            heading: 'ขั้นที่ 2: อัตราขยายสัญญาณขนาดเล็ก',
            body: [
              'สำหรับสัญญาณขนาดเล็ก ทรานซิสเตอร์ดูเหมือนความต้านทานอิมิตเตอร์ re = VT/IE ต่ออนุกรมกับความต้านทานอิมิตเตอร์ที่สัญญาณมองเห็น กระแสคอลเลกเตอร์ที่เปลี่ยนไปไหลผ่าน RC ที่ขนานกับโหลด RL (ตัวเก็บประจุคัปปลิงให้สัญญาณผ่านแต่กั้นไฟตรง) อัตราขยายจึงเป็นอัตราส่วนของความต้านทานทั้งสอง โดยมีเครื่องหมายลบ: เอาต์พุตกลับเฟส',
            ],
            formulas: [
              're = VT / IE ≈ 25.9 mV / IE',
              'Av = −(RC ∥ RL) / (re + RE,ac)',
              'Rin = R1 ∥ R2 ∥ (β + 1)(re + RE,ac)',
            ],
          },
          {
            heading: 'ตัวเก็บประจุบายพาส',
            body: [
              'ตัวเก็บประจุ CE ที่ต่อคร่อม RE จะลัดวงจร RE สำหรับสัญญาณแต่ไม่ลัดสำหรับไฟตรง เมื่อมี CE (RE,ac = 0) อัตราขยายสูง −RC∥RL/re แต่ขึ้นกับ re ซึ่งเปลี่ยนตามกระแส สัญญาณขนาดใหญ่จึงผิดเพี้ยน เมื่อไม่มี CE (RE,ac = RE) อัตราขยายลดลงเหลือประมาณ −RC∥RL/RE แต่คาดเดาได้และเป็นเชิงเส้นมากขึ้น การแลกอัตราขยายกับความเสถียรนี้คือการป้อนกลับเชิงลบ',
            ],
          },
          {
            heading: 'ความผิดเพี้ยนและการตัดยอด',
            body: [
              'สัญญาณเลื่อนจุดทำงานไปตามเส้นโหลด AC ถ้าเลื่อนไกลเกินไปจะชนขีดจำกัด: คัตออฟ ที่กระแสคอลเลกเตอร์เป็นศูนย์และยอดบนของเอาต์พุตแบน หรืออิ่มตัว ที่ VCE ลดลงถึงประมาณ 0.2 V และยอดล่างแบน แม้ก่อนถูกตัดยอด วงจรที่บายพาสก็ผิดเพี้ยนแล้ว เพราะกระแสคอลเลกเตอร์เป็นเอกซ์โพเนนเชียลของ VBE การไบแอส Q ไว้กลางเส้นโหลด AC ให้การแกว่งที่สะอาดได้กว้างที่สุด',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'VCC = 12 V, R1 = 100 kΩ, R2 = 22 kΩ, RC = 4.7 kΩ, RE = 1 kΩ, RL = 10 kΩ, β = 100',
            'VTH = 12 × 22/122 = 2.16 V, RTH = 18.0 kΩ → IC = 1.26 mA; VB = 1.94 V, VE = 1.28 V, VC = 6.06 V, VCE = 4.79 V',
            're = 25.9 mV/1.28 mA = 20.3 Ω; RC ∥ RL = 3.20 kΩ',
            'มีบายพาส: Av = −3.20 k/20.3 ≈ −156 (43.9 dB) อินพุต 2 mV ให้เอาต์พุตประมาณ 0.31 V',
            'ไม่มีบายพาส: Av = −3.20 k/(20.3 + 1000) ≈ −3.1 และ Rin เพิ่มจาก 1.84 kΩ เป็น 15.3 kΩ',
            'มีบายพาสและอินพุต 10 mV: เอาต์พุตลงถึง −1.91 V แต่ขึ้นเพียง +1.30 V ผิดเพี้ยนให้เห็นแล้ว และที่ 50 mV ถูกตัดยอด',
          ],
        },
        mistakes: [
          'ลืมโหลด อัตราขยายใช้ RC ∥ RL ไม่ใช่ RC อย่างเดียว',
          'รวม RE ในอัตราขยายเมื่อมีบายพาส หรือไม่รวมเมื่อไม่มีบายพาส',
          'ไบแอสไว้ใกล้ปลายด้านใดด้านหนึ่งของเส้นโหลด เอาต์พุตจะถูกตัดยอดด้านนั้นก่อนอีกด้านมาก',
        ],
        faq: [
          {
            q: 'อัตราขยายแรงดันของวงจรขยายอิมิตเตอร์ร่วมเป็นเท่าใด?',
            a: 'Av ≈ −(RC ∥ RL)/(re + RE,ac) โดย re = VT/IE ≈ 26 mV/IE เมื่อบายพาสตัวต้านทานอิมิตเตอร์ RE,ac = 0 อัตราขยายจะสูง เมื่อไม่บายพาสจะประมาณ −RC/RE เครื่องหมายลบหมายถึงเอาต์พุตกลับเฟส',
          },
          {
            q: 'ทำไมจึงใช้ไบแอสแบบแบ่งแรงดัน?',
            a: 'ช่วยตรึงแรงดันเบสและให้ตัวต้านทานอิมิตเตอร์กำหนดกระแส จุด Q จึงแทบไม่ขึ้นกับ β ซึ่งต่างกันไปในทรานซิสเตอร์แต่ละตัว',
          },
          {
            q: 'อะไรทำให้เกิดการตัดยอดในวงจรขยายทรานซิสเตอร์?',
            a: 'เอาต์พุตแกว่งได้จนกว่าทรานซิสเตอร์จะถึงคัตออฟ (IC = 0) หรืออิ่มตัว (VCE ≈ 0.2 V) สัญญาณที่ใหญ่กว่านั้นจะถูกตัดยอดให้แบน',
          },
        ],
      },
    },
  },
];
