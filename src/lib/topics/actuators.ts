import type { ActuatorTab } from '@/lib/state/schemas';
import type { Topic } from './types';

/**
 * Actuators module topics. Worked examples use the simulator's default
 * values, so the numbers in the text are the numbers on screen.
 */
export const ACTUATOR_TOPICS: readonly Topic<ActuatorTab>[] = [
  {
    module: 'actuators',
    slug: 'dc-motor',
    mode: 'dcmotor',
    seo: {
      title: 'DC Motor Simulator — Back-EMF, Torque, Speed & PWM',
      description:
        'Interactive DC motor: see how supply voltage, back-EMF, load torque and armature current set the speed, then control it with a PWM duty cycle and find the stall point.',
      keywords: [
        'DC motor simulator',
        'back EMF',
        'DC motor speed equation',
        'torque speed characteristic',
        'armature current',
        'PWM motor control',
        'duty cycle',
        'มอเตอร์ไฟฟ้ากระแสตรง',
        'แรงเคลื่อนไฟฟ้าย้อนกลับ',
        'ควบคุมความเร็วมอเตอร์ PWM',
      ],
      teaches: [
        'DC motor steady state',
        'Back-EMF',
        'Torque-speed balance',
        'PWM speed control',
        'Motor stall',
      ],
    },
    text: {
      en: {
        nav: 'DC motor',
        h1: 'The DC motor: back-EMF, torque and PWM speed control',
        lead: 'Set the supply, the load and the PWM duty cycle, and watch the motor settle at the speed where back-EMF and torque balance.',
        card: 'The armature loop and back-EMF, the torque balance, the steady-state speed equation, and speed control by PWM duty cycle.',
        sections: [
          {
            heading: 'Two equations run the motor',
            body: [
              'A DC motor has an electrical side and a mechanical side, joined by one constant K. On the electrical side, the supply drives current through the armature resistance Ra, and the spinning armature generates a back-EMF K·ω that opposes the supply. On the mechanical side, that current makes a torque K·I, which has to balance the load torque Tl plus friction B·ω.',
              'In SI units the torque constant Kt and the back-EMF constant Ke are the same number, so the simulator uses one constant K for both.',
            ],
            formulas: ['V = I·Ra + K·ω   (armature loop)', 'K·I = B·ω + Tl   (torque balance)'],
          },
          {
            heading: 'The steady-state speed',
            body: [
              'Solve the two equations together and the speed comes out directly. The motor speeds up until its back-EMF has used up enough of the supply that the current left over makes exactly the torque the load needs. Load it more and it slows down, which lowers the back-EMF and lets more current flow to make more torque. A DC motor regulates itself this way.',
            ],
            formulas: [
              'ω = (V − Ra·Tl/K) / (Ra·B/K + K)',
              'I = (B·ω + Tl) / K',
              'rpm = ω · 60 / 2π',
            ],
          },
          {
            heading: 'Power and efficiency',
            body: [
              'The supply delivers V·I. Part of it is lost as heat in the armature resistance, I²·Ra; the rest reaches the shaft as mechanical power T·ω. A heavily loaded motor draws more current, and since the loss grows with the square of the current, its efficiency falls.',
            ],
            formulas: ['P_in = V·I = P_mech + P_loss', 'P_mech = K·I·ω', 'P_loss = I²·Ra'],
          },
          {
            heading: 'Speed control with PWM',
            body: [
              'A microcontroller cannot output 7.2 V, but it can switch a transistor fully on and off thousands of times a second. Pulse-width modulation (PWM) does exactly that and varies the duty cycle D, the fraction of each period the switch is on. The armature inductance smooths the current, so as long as the switching is fast compared with the armature’s L/R time constant, the motor behaves as if it were fed the average voltage.',
              'The switch is either fully on or fully off, so it wastes very little power, unlike a series resistor that drops the extra voltage as heat.',
            ],
            formulas: ['V_avg = D · Vs'],
          },
          {
            heading: 'Stall',
            body: [
              'At standstill there is no back-EMF, so the current is V/Ra and the torque K·V/Ra is the most the motor can make at that voltage. If the load needs more than that, the motor does not turn at all: it is stalled, drawing its full stall current and turning all of it into heat.',
            ],
            formulas: ['T_stall = K · V / Ra', 'stalls when K·V/Ra < Tl'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Vs = 12 V, D = 100 %, Ra = 2 Ω, K = 0.05 V·s/rad, Tl = 0.02 N·m, B = 0.001 N·m·s/rad.',
            'ω = (12 − 2·0.02/0.05) / (2·0.001/0.05 + 0.05) = 11.2 / 0.09 = 124.4 rad/s ≈ 1188 RPM.',
            'I = (0.001·124.4 + 0.02) / 0.05 = 2.89 A. Back-EMF = 0.05·124.4 = 6.22 V and I·Ra = 5.78 V, which add up to the 12 V supply.',
            'Power: 34.7 W in, 18.0 W at the shaft and 16.7 W lost in Ra, so the efficiency is about 52 %.',
            'At D = 50 %, V_avg = 6 V: ω = 5.2 / 0.09 = 57.8 rad/s ≈ 552 RPM, and I = 1.56 A.',
            'Below D ≈ 6.7 % (V_avg = 0.8 V) the stall torque 0.05·V/2 falls under 0.02 N·m and the motor stalls.',
          ],
        },
        mistakes: [
          'Expecting half the voltage to give exactly half the speed. Under load, part of the voltage always goes on I·Ra, so 50 % duty here gives 552 RPM, well under half of 1188.',
          'Thinking a motor draws the most current at full speed. Current is highest at standstill, when there is no back-EMF to oppose the supply.',
          'Treating PWM as a lower voltage at every instant. The armature sees the full supply during each pulse; only the average, smoothed by the inductance, is lower.',
        ],
        faq: [
          {
            q: 'What is back-EMF in a DC motor?',
            a: 'The voltage the spinning armature generates, K·ω, acting against the supply. It grows with speed, and it is what limits the current once the motor is running.',
          },
          {
            q: 'How does PWM control the speed of a DC motor?',
            a: 'It switches the full supply on and off quickly and varies the duty cycle D. The armature inductance smooths the pulses, so the motor runs as if it were fed D times the supply voltage.',
          },
          {
            q: 'Why does a DC motor slow down under load?',
            a: 'More load torque needs more current, and more current means a bigger I·Ra drop. Less voltage is left for back-EMF, so the speed, back-EMF divided by K, falls.',
          },
        ],
      },
      th: {
        nav: 'มอเตอร์ไฟตรง',
        h1: 'มอเตอร์ไฟฟ้ากระแสตรง: แรงเคลื่อนไฟฟ้าย้อนกลับ แรงบิด และการควบคุมความเร็วด้วย PWM',
        lead: 'ตั้งแรงดันจ่าย โหลด และดิวตี้ไซเคิลของ PWM แล้วดูมอเตอร์เข้าสู่ความเร็วที่แรงเคลื่อนไฟฟ้าย้อนกลับและแรงบิดสมดุลกัน',
        card: 'วงจรอาร์เมเจอร์และแรงเคลื่อนไฟฟ้าย้อนกลับ สมดุลแรงบิด สมการความเร็วคงที่ และการควบคุมความเร็วด้วยดิวตี้ไซเคิล PWM',
        sections: [
          {
            heading: 'สองสมการที่กำหนดการทำงานของมอเตอร์',
            body: [
              'มอเตอร์ไฟตรงมีด้านไฟฟ้าและด้านกล เชื่อมกันด้วยค่าคงที่ K เพียงตัวเดียว ด้านไฟฟ้า แหล่งจ่ายดันกระแสผ่านความต้านทานอาร์เมเจอร์ Ra และอาร์เมเจอร์ที่หมุนอยู่สร้างแรงเคลื่อนไฟฟ้าย้อนกลับ K·ω ต้านแหล่งจ่าย ด้านกล กระแสนั้นสร้างแรงบิด K·I ซึ่งต้องสมดุลกับแรงบิดโหลด Tl บวกแรงเสียดทาน B·ω',
              'ในหน่วย SI ค่าคงที่แรงบิด Kt และค่าคงที่แรงเคลื่อนไฟฟ้าย้อนกลับ Ke มีค่าเท่ากัน โปรแกรมจำลองจึงใช้ค่าคงที่ K ตัวเดียวแทนทั้งสอง',
            ],
            formulas: ['V = I·Ra + K·ω   (วงจรอาร์เมเจอร์)', 'K·I = B·ω + Tl   (สมดุลแรงบิด)'],
          },
          {
            heading: 'ความเร็วในสภาวะคงตัว',
            body: [
              'แก้สองสมการพร้อมกันจะได้ความเร็วออกมาโดยตรง มอเตอร์เร่งความเร็วขึ้นจนแรงเคลื่อนไฟฟ้าย้อนกลับใช้แรงดันจ่ายไปมากพอ จนกระแสที่เหลือสร้างแรงบิดได้พอดีกับที่โหลดต้องการ เพิ่มโหลดแล้วมอเตอร์จะช้าลง แรงเคลื่อนไฟฟ้าย้อนกลับจึงลดลง กระแสไหลได้มากขึ้นและสร้างแรงบิดมากขึ้น มอเตอร์ไฟตรงปรับตัวเองด้วยวิธีนี้',
            ],
            formulas: [
              'ω = (V − Ra·Tl/K) / (Ra·B/K + K)',
              'I = (B·ω + Tl) / K',
              'rpm = ω · 60 / 2π',
            ],
          },
          {
            heading: 'กำลังและประสิทธิภาพ',
            body: [
              'แหล่งจ่ายให้กำลัง V·I ส่วนหนึ่งสูญเสียเป็นความร้อนในความต้านทานอาร์เมเจอร์ I²·Ra ที่เหลือไปถึงเพลาเป็นกำลังกล T·ω มอเตอร์ที่รับโหลดหนักดึงกระแสมากขึ้น และเพราะการสูญเสียเพิ่มตามกำลังสองของกระแส ประสิทธิภาพจึงลดลง',
            ],
            formulas: ['P_in = V·I = P_mech + P_loss', 'P_mech = K·I·ω', 'P_loss = I²·Ra'],
          },
          {
            heading: 'ควบคุมความเร็วด้วย PWM',
            body: [
              'ไมโครคอนโทรลเลอร์จ่ายแรงดัน 7.2 V ออกมาไม่ได้ แต่สั่งทรานซิสเตอร์ให้เปิดสุดและปิดสุดได้หลายพันครั้งต่อวินาที การมอดูเลตความกว้างพัลส์ (PWM) ทำเช่นนั้นและปรับดิวตี้ไซเคิล D คือสัดส่วนของแต่ละคาบที่สวิตช์เปิด ความเหนี่ยวนำของอาร์เมเจอร์ทำให้กระแสเรียบขึ้น ตราบใดที่การสวิตช์เร็วกว่าค่าคงที่เวลา L/R ของอาร์เมเจอร์มาก มอเตอร์จะทำงานเหมือนได้รับแรงดันเฉลี่ย',
              'สวิตช์อยู่ในสถานะเปิดสุดหรือปิดสุดเท่านั้น จึงสูญเสียกำลังน้อยมาก ต่างจากตัวต้านทานอนุกรมที่ทิ้งแรงดันส่วนเกินเป็นความร้อน',
            ],
            formulas: ['V_avg = D · Vs'],
          },
          {
            heading: 'การหยุดนิ่ง (สตอล)',
            body: [
              'ขณะหยุดนิ่งไม่มีแรงเคลื่อนไฟฟ้าย้อนกลับ กระแสจึงเท่ากับ V/Ra และแรงบิด K·V/Ra คือแรงบิดสูงสุดที่มอเตอร์สร้างได้ที่แรงดันนั้น ถ้าโหลดต้องการมากกว่านี้ มอเตอร์จะไม่หมุนเลย เรียกว่าสตอล มอเตอร์ดึงกระแสสตอลเต็มที่และเปลี่ยนทั้งหมดเป็นความร้อน',
            ],
            formulas: ['T_stall = K · V / Ra', 'สตอลเมื่อ K·V/Ra < Tl'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'Vs = 12 V, D = 100 %, Ra = 2 Ω, K = 0.05 V·s/rad, Tl = 0.02 N·m, B = 0.001 N·m·s/rad',
            'ω = (12 − 2·0.02/0.05) / (2·0.001/0.05 + 0.05) = 11.2 / 0.09 = 124.4 rad/s ≈ 1188 RPM',
            'I = (0.001·124.4 + 0.02) / 0.05 = 2.89 A แรงเคลื่อนไฟฟ้าย้อนกลับ = 0.05·124.4 = 6.22 V และ I·Ra = 5.78 V รวมกันเท่ากับแรงดันจ่าย 12 V',
            'กำลัง: ป้อนเข้า 34.7 W ที่เพลา 18.0 W และสูญเสียใน Ra 16.7 W ประสิทธิภาพจึงประมาณ 52 %',
            'ที่ D = 50 %, V_avg = 6 V: ω = 5.2 / 0.09 = 57.8 rad/s ≈ 552 RPM และ I = 1.56 A',
            'ต่ำกว่า D ≈ 6.7 % (V_avg = 0.8 V) แรงบิดสตอล 0.05·V/2 จะน้อยกว่า 0.02 N·m และมอเตอร์สตอล',
          ],
        },
        mistakes: [
          'คาดว่าแรงดันครึ่งหนึ่งจะได้ความเร็วครึ่งหนึ่งพอดี เมื่อมีโหลด แรงดันส่วนหนึ่งตกที่ I·Ra เสมอ ดิวตี้ 50 % ในตัวอย่างนี้จึงได้ 552 RPM น้อยกว่าครึ่งของ 1188 พอสมควร',
          'คิดว่ามอเตอร์ดึงกระแสมากที่สุดตอนหมุนเร็วสุด ที่จริงกระแสสูงสุดตอนหยุดนิ่ง เพราะไม่มีแรงเคลื่อนไฟฟ้าย้อนกลับมาต้านแหล่งจ่าย',
          'มอง PWM ว่าเป็นแรงดันที่ต่ำลงตลอดเวลา ที่จริงอาร์เมเจอร์ได้รับแรงดันเต็มระหว่างแต่ละพัลส์ มีเพียงค่าเฉลี่ยที่ถูกความเหนี่ยวนำทำให้เรียบเท่านั้นที่ต่ำลง',
        ],
        faq: [
          {
            q: 'แรงเคลื่อนไฟฟ้าย้อนกลับในมอเตอร์ไฟตรงคืออะไร?',
            a: 'แรงดันที่อาร์เมเจอร์ซึ่งกำลังหมุนสร้างขึ้น คือ K·ω มีทิศต้านแหล่งจ่าย ยิ่งหมุนเร็วยิ่งมาก และเป็นตัวจำกัดกระแสเมื่อมอเตอร์หมุนแล้ว',
          },
          {
            q: 'PWM ควบคุมความเร็วมอเตอร์ไฟตรงได้อย่างไร?',
            a: 'สวิตช์แรงดันจ่ายเต็มเปิดปิดอย่างรวดเร็วและปรับดิวตี้ไซเคิล D ความเหนี่ยวนำของอาร์เมเจอร์ทำให้พัลส์เรียบ มอเตอร์จึงหมุนเหมือนได้รับแรงดัน D คูณแรงดันจ่าย',
          },
          {
            q: 'ทำไมมอเตอร์ไฟตรงจึงช้าลงเมื่อรับโหลด?',
            a: 'แรงบิดโหลดที่มากขึ้นต้องใช้กระแสมากขึ้น และกระแสที่มากขึ้นทำให้แรงดันตกที่ I·Ra มากขึ้น แรงดันที่เหลือสำหรับแรงเคลื่อนไฟฟ้าย้อนกลับจึงน้อยลง ความเร็วซึ่งเท่ากับแรงเคลื่อนไฟฟ้าย้อนกลับหารด้วย K จึงลดลง',
          },
        ],
      },
    },
  },
  {
    module: 'actuators',
    slug: 'stepper-motor',
    mode: 'stepper',
    seo: {
      title: 'Stepper Motor Simulator — Full Step, Half Step & Poles',
      description:
        'See how a stepper motor works: stator coils energized in sequence pull a magnet rotor round one step at a time. Compare full and half step, step angle and speed.',
      keywords: [
        'stepper motor simulator',
        'how a stepper motor works',
        'full step half step',
        'step angle',
        'stepper motor sequence',
        'stator rotor poles',
        'มอเตอร์สเต็ปปิ้ง',
        'มอเตอร์สเตป',
      ],
      teaches: [
        'Stepper motor operation',
        'Coil energizing sequence',
        'Step angle',
        'Full and half stepping',
        'Rotor pole pairs',
      ],
    },
    text: {
      en: {
        nav: 'Stepping motor',
        h1: 'The stepping motor: poles, coil sequence and step angle',
        lead: 'Energize the stator coils in order and watch the magnet rotor follow, one exact step at a time. Switch to half step and see the resolution double.',
        card: 'Stator poles and a permanent-magnet rotor, the coil sequence, step angle and speed, full versus half stepping, and direction.',
        sections: [
          {
            heading: 'Stator and rotor',
            body: [
              'The stator is the fixed outer part: iron poles, each wrapped in a coil. Energize a coil and its pole becomes an electromagnet. The rotor is a permanent magnet on the shaft. Opposite poles attract, so the rotor’s N pole swings into line with the energized stator poles and holds there.',
              'That holding is the point of a stepper. With no position sensor at all, the controller knows where the shaft is, because it knows how many steps it has sent.',
            ],
          },
          {
            heading: 'Stepping through the sequence',
            body: [
              'Switch the energized coils round the stator in order and the magnetic field turns with them; the rotor follows, step by step. Reverse the order and it turns the other way. How fast you step sets the speed.',
            ],
            formulas: [
              'Full step (two coils on):  AB → BC → CD → DA',
              'Half step:  A → AB → B → BC → C → CD → D → DA',
            ],
          },
          {
            heading: 'Step angle, pole pairs and speed',
            body: [
              'A real rotor carries many N–S pole pairs round its rim, not one. One pass through the four-step coil sequence moves the rotor along by one pole pair, so a motor’s full steps per revolution is four times its pole pairs. A 24-step motor has 6 pole pairs; a common 200-step motor has 50.',
            ],
            formulas: [
              'step angle = 360° / steps per revolution',
              'pole pairs = full steps per revolution / 4',
              'rpm = step rate · 60 / steps per revolution',
            ],
          },
          {
            heading: 'Full step versus half step',
            body: [
              'Full stepping keeps two coils on all the time, so the rotor sits between two poles with full torque. Half stepping alternates between one coil and two, adding a position halfway between each pair of full steps. That doubles the resolution and halves the step angle, so at the same step rate the shaft turns half as fast. The one-coil positions hold with less torque.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Full step, 24 steps per revolution, 4 steps per second, clockwise.',
            'Step angle = 360° / 24 = 15°; pole pairs = 24 / 4 = 6.',
            'Speed = 4 · 60 / 24 = 10 RPM, so one revolution takes 6 s.',
            'Half step: 48 positions per revolution, 7.5° per step, and 5 RPM at the same 4 steps per second.',
            'Each full step turns the field by 90°, but the shaft by only 90° / 6 = 15°.',
          ],
        },
        mistakes: [
          'Thinking a stepper turns smoothly. It moves in discrete steps and holds between them; smooth motion at low speed needs microstepping.',
          'Assuming the step angle depends on the step rate. It is fixed by how the motor is built; the step rate only sets the speed.',
          'Stepping too fast for the load. Above some rate the rotor cannot keep up, misses steps, and the controller loses track of where the shaft is.',
        ],
        faq: [
          {
            q: 'How does a stepper motor work?',
            a: 'Coils on the stator are energized in sequence, each turning its pole into an electromagnet. The magnet rotor is pulled into line with the energized poles, so it moves one step every time the sequence advances.',
          },
          {
            q: 'What is the difference between full step and half step?',
            a: 'Full step keeps two coils on and moves one full step angle per pulse. Half step alternates between one and two coils, giving twice as many positions per revolution at half the step angle.',
          },
          {
            q: 'How do you calculate stepper motor RPM?',
            a: 'RPM = step rate × 60 / steps per revolution. A 24-step motor driven at 4 steps per second turns at 10 RPM.',
          },
        ],
      },
      th: {
        nav: 'มอเตอร์สเตป',
        h1: 'มอเตอร์สเต็ปปิ้ง: ขั้วแม่เหล็ก ลำดับการจ่ายไฟคอยล์ และมุมสเตป',
        lead: 'จ่ายไฟให้คอยล์สเตเตอร์ตามลำดับแล้วดูโรเตอร์แม่เหล็กหมุนตามไปทีละสเตปอย่างแม่นยำ สลับเป็นฮาล์ฟสเตปแล้วดูความละเอียดเพิ่มเป็นสองเท่า',
        card: 'ขั้วสเตเตอร์และโรเตอร์แม่เหล็กถาวร ลำดับการจ่ายไฟคอยล์ มุมสเตปและความเร็ว ฟูลสเตปเทียบกับฮาล์ฟสเตป และทิศทางการหมุน',
        sections: [
          {
            heading: 'สเตเตอร์และโรเตอร์',
            body: [
              'สเตเตอร์คือส่วนนอกที่อยู่กับที่ ประกอบด้วยขั้วเหล็กที่แต่ละขั้วพันด้วยคอยล์ เมื่อจ่ายไฟให้คอยล์ ขั้วนั้นจะกลายเป็นแม่เหล็กไฟฟ้า โรเตอร์คือแม่เหล็กถาวรบนเพลา ขั้วต่างกันดูดกัน ขั้ว N ของโรเตอร์จึงหมุนไปเรียงตรงกับขั้วสเตเตอร์ที่ได้รับไฟและค้างอยู่ที่นั่น',
              'การค้างตำแหน่งนี้คือจุดเด่นของมอเตอร์สเตป ตัวควบคุมรู้ตำแหน่งเพลาโดยไม่ต้องมีเซนเซอร์ตำแหน่งเลย เพราะรู้ว่าส่งสเตปไปแล้วกี่ครั้ง',
            ],
          },
          {
            heading: 'เดินตามลำดับการจ่ายไฟ',
            body: [
              'สลับคอยล์ที่ได้รับไฟวนรอบสเตเตอร์ตามลำดับ สนามแม่เหล็กจะหมุนตามไป และโรเตอร์ก็หมุนตามทีละสเตป กลับลำดับแล้วมอเตอร์จะหมุนอีกทาง อัตราการสเตปเป็นตัวกำหนดความเร็ว',
            ],
            formulas: [
              'ฟูลสเตป (เปิดสองคอยล์):  AB → BC → CD → DA',
              'ฮาล์ฟสเตป:  A → AB → B → BC → C → CD → D → DA',
            ],
          },
          {
            heading: 'มุมสเตป คู่ขั้ว และความเร็ว',
            body: [
              'โรเตอร์จริงมีคู่ขั้ว N–S หลายคู่รอบขอบ ไม่ใช่คู่เดียว การเดินครบลำดับสี่สเตปหนึ่งรอบทำให้โรเตอร์เลื่อนไปหนึ่งคู่ขั้ว จำนวนฟูลสเตปต่อรอบของมอเตอร์จึงเท่ากับสี่เท่าของจำนวนคู่ขั้ว มอเตอร์ 24 สเตปมี 6 คู่ขั้ว มอเตอร์ 200 สเตปที่พบบ่อยมี 50 คู่ขั้ว',
            ],
            formulas: [
              'มุมสเตป = 360° / จำนวนสเตปต่อรอบ',
              'จำนวนคู่ขั้ว = จำนวนฟูลสเตปต่อรอบ / 4',
              'rpm = อัตราสเตป · 60 / จำนวนสเตปต่อรอบ',
            ],
          },
          {
            heading: 'ฟูลสเตปเทียบกับฮาล์ฟสเตป',
            body: [
              'ฟูลสเตปเปิดคอยล์สองตัวตลอดเวลา โรเตอร์จึงอยู่ระหว่างสองขั้วด้วยแรงบิดเต็มที่ ฮาล์ฟสเตปสลับระหว่างเปิดหนึ่งคอยล์และสองคอยล์ เพิ่มตำแหน่งตรงกลางระหว่างฟูลสเตปแต่ละคู่ ความละเอียดจึงเพิ่มเป็นสองเท่าและมุมสเตปลดลงครึ่งหนึ่ง ที่อัตราสเตปเท่าเดิมเพลาจึงหมุนช้าลงครึ่งหนึ่ง ตำแหน่งที่เปิดคอยล์เดียวยึดตำแหน่งด้วยแรงบิดที่น้อยกว่า',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'ฟูลสเตป 24 สเตปต่อรอบ 4 สเตปต่อวินาที หมุนตามเข็มนาฬิกา',
            'มุมสเตป = 360° / 24 = 15° จำนวนคู่ขั้ว = 24 / 4 = 6',
            'ความเร็ว = 4 · 60 / 24 = 10 RPM หมุนหนึ่งรอบใช้เวลา 6 วินาที',
            'ฮาล์ฟสเตป: 48 ตำแหน่งต่อรอบ 7.5° ต่อสเตป และ 5 RPM ที่ 4 สเตปต่อวินาทีเท่าเดิม',
            'ฟูลสเตปแต่ละครั้งหมุนสนามแม่เหล็กไป 90° แต่หมุนเพลาไปเพียง 90° / 6 = 15°',
          ],
        },
        mistakes: [
          'คิดว่ามอเตอร์สเตปหมุนอย่างต่อเนื่อง ที่จริงมันเคลื่อนที่เป็นสเตปและค้างอยู่ระหว่างสเตป การหมุนให้เรียบที่ความเร็วต่ำต้องใช้ไมโครสเตปปิ้ง',
          'คิดว่ามุมสเตปขึ้นกับอัตราสเตป ที่จริงมุมสเตปถูกกำหนดโดยโครงสร้างมอเตอร์ อัตราสเตปกำหนดเพียงความเร็ว',
          'สเตปเร็วเกินไปสำหรับโหลด เมื่อเกินอัตราหนึ่ง โรเตอร์ตามไม่ทันและพลาดสเตป ตัวควบคุมจึงไม่รู้ตำแหน่งที่แท้จริงของเพลาอีกต่อไป',
        ],
        faq: [
          {
            q: 'มอเตอร์สเตปทำงานอย่างไร?',
            a: 'คอยล์บนสเตเตอร์ได้รับไฟตามลำดับ แต่ละตัวทำให้ขั้วของมันกลายเป็นแม่เหล็กไฟฟ้า โรเตอร์แม่เหล็กถูกดึงให้เรียงตรงกับขั้วที่ได้รับไฟ จึงขยับไปหนึ่งสเตปทุกครั้งที่ลำดับเดินหน้า',
          },
          {
            q: 'ฟูลสเตปกับฮาล์ฟสเตปต่างกันอย่างไร?',
            a: 'ฟูลสเตปเปิดคอยล์สองตัวและขยับหนึ่งมุมสเตปเต็มต่อพัลส์ ฮาล์ฟสเตปสลับระหว่างหนึ่งและสองคอยล์ ได้ตำแหน่งต่อรอบเป็นสองเท่าที่มุมสเตปครึ่งหนึ่ง',
          },
          {
            q: 'คำนวณ RPM ของมอเตอร์สเตปอย่างไร?',
            a: 'RPM = อัตราสเตป × 60 / จำนวนสเตปต่อรอบ มอเตอร์ 24 สเตปที่ขับด้วย 4 สเตปต่อวินาทีจะหมุนที่ 10 RPM',
          },
        ],
      },
    },
  },
  {
    module: 'actuators',
    slug: 'relay',
    mode: 'relay',
    seo: {
      title: 'Relay Simulator — Coil, Armature, NO and NC Contacts',
      description:
        'How an electromagnetic relay works: its circuit symbol beside its internal structure. Coil current, pull-in threshold, armature and NO/NC contacts switching a load.',
      keywords: [
        'relay simulator',
        'how a relay works',
        'relay circuit symbol',
        'NO NC contacts',
        'relay coil current',
        'pull-in current',
        'electromagnetic relay',
        'รีเลย์',
        'หน้าสัมผัส NO NC',
      ],
      teaches: [
        'Electromagnetic relay',
        'Relay circuit symbol',
        'Pull-in current',
        'NO and NC contacts',
        'Isolation between circuits',
      ],
    },
    text: {
      en: {
        nav: 'Relay',
        h1: 'The relay: coil, armature and NO/NC contacts',
        lead: 'Raise the coil current past the pull-in threshold and watch the armature snap over, in the circuit symbol and inside the part, switching the load on.',
        card: 'The relay symbol beside its internal structure, coil current and pull-in, the armature and spring, and NO/NC contacts switching a load.',
        sections: [
          {
            heading: 'Inside a relay',
            body: [
              'A relay is a switch worked by an electromagnet. A coil is wound on an iron core. Above it, a hinged iron armature is held up by a spring, and the armature carries the moving contact, called COM. With no coil current the spring holds COM against the normally closed contact, NC. Pass current through the coil and the core becomes a magnet, pulls the armature down against the spring, and COM moves over to the normally open contact, NO.',
            ],
          },
          {
            heading: 'Reading the circuit symbol',
            body: [
              'On a circuit diagram the coil is a rectangle with two terminals, usually A1 and A2, labelled with the relay’s name, such as K1. The contacts are drawn as a switch: a blade at COM that rests on NC and can move to NO. A dashed line from the coil to the blade means they are one part, linked mechanically rather than electrically.',
              'Contacts are always drawn in their de-energized position, so NC is shown closed and NO open.',
            ],
            bullets: [
              'A1, A2: the coil terminals',
              'COM: common, the moving contact',
              'NC: normally closed, joined to COM while the coil is off',
              'NO: normally open, joined to COM only while the coil is energized',
            ],
          },
          {
            heading: 'Coil current and pull-in',
            body: [
              'The coil is a resistance, so its current follows Ohm’s law. The armature moves only once that current makes enough magnetic force to beat the spring: the pull-in current. Below it nothing happens, however close you get; above it the armature snaps over.',
            ],
            formulas: [
              'I_coil = V_coil / R_coil',
              'energized when I_coil ≥ I_pull-in',
              'I_load = V_load / R_load   (through NO, only while energized)',
            ],
          },
          {
            heading: 'Why use a relay',
            body: [
              'The coil circuit and the contact circuit are electrically separate. A few milliamps from a 5 V microcontroller, through a transistor, can switch a 230 V mains load with no electrical connection between the two. A diode is fitted across the coil in practice, because the coil’s inductance kicks back a high voltage when it is switched off.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'V_coil = 5 V, R_coil = 400 Ω, pull-in 20 mA; the load is 12 V across 100 Ω, wired through NO.',
            'I_coil = 5 / 400 = 12.5 mA, below 20 mA: the relay stays de-energized, COM rests on NC and no load current flows.',
            'To pull in, the coil needs at least 20 mA × 400 Ω = 8 V.',
            'At 12 V: I_coil = 30 mA, the armature pulls in, COM closes onto NO and I_load = 12 / 100 = 0.12 A.',
          ],
        },
        mistakes: [
          'Reading NO and NC from a powered relay. Normally open and normally closed describe the contacts with no coil current, which is also how they are drawn.',
          'Driving a relay coil straight from a microcontroller pin. Most coils need more current than a pin can give, and the switch-off spike can damage it; use a transistor and a flyback diode.',
          'Expecting it to release at the pull-in current. Real relays let go at a lower drop-out current, which stops them chattering; the simulator uses one threshold for both.',
        ],
        faq: [
          {
            q: 'How does a relay work?',
            a: 'Current through the coil magnetizes an iron core, which pulls a hinged armature against a spring. The armature moves the common contact from NC to NO. Cut the current and the spring pulls it back.',
          },
          {
            q: 'What do NO and NC mean on a relay?',
            a: 'NO (normally open) connects to COM only while the coil is energized. NC (normally closed) connects to COM while the coil is off. Both names describe the relay at rest.',
          },
          {
            q: 'What is relay pull-in current?',
            a: 'The smallest coil current that makes enough magnetic force to pull the armature over. With a coil resistance R, it sets the minimum coil voltage, I_pull-in × R.',
          },
        ],
      },
      th: {
        nav: 'รีเลย์',
        h1: 'รีเลย์: คอยล์ อาร์เมเจอร์ และหน้าสัมผัส NO/NC',
        lead: 'เพิ่มกระแสคอยล์ให้เกินค่าดึงเข้าแล้วดูอาร์เมเจอร์สะบัดข้าม ทั้งในสัญลักษณ์วงจรและภายในตัวอุปกรณ์ แล้วโหลดก็ทำงาน',
        card: 'สัญลักษณ์รีเลย์คู่กับโครงสร้างภายใน กระแสคอยล์และค่าดึงเข้า อาร์เมเจอร์และสปริง และหน้าสัมผัส NO/NC ที่สวิตช์โหลด',
        sections: [
          {
            heading: 'ภายในรีเลย์',
            body: [
              'รีเลย์คือสวิตช์ที่ทำงานด้วยแม่เหล็กไฟฟ้า คอยล์พันอยู่บนแกนเหล็ก เหนือขึ้นไปมีอาร์เมเจอร์เหล็กแบบบานพับถูกสปริงยกไว้ อาร์เมเจอร์พาหน้าสัมผัสที่เคลื่อนที่ได้ซึ่งเรียกว่า COM เมื่อไม่มีกระแสคอยล์ สปริงกด COM ไว้กับหน้าสัมผัสปกติปิด NC เมื่อจ่ายกระแสให้คอยล์ แกนเหล็กจะกลายเป็นแม่เหล็ก ดึงอาร์เมเจอร์ลงชนะแรงสปริง และ COM ย้ายไปแตะหน้าสัมผัสปกติเปิด NO',
            ],
          },
          {
            heading: 'การอ่านสัญลักษณ์วงจร',
            body: [
              'ในแผนภาพวงจร คอยล์เขียนเป็นสี่เหลี่ยมที่มีสองขั้ว ปกติคือ A1 และ A2 พร้อมชื่อรีเลย์ เช่น K1 หน้าสัมผัสเขียนเป็นสวิตช์ คือใบสวิตช์ที่ COM ซึ่งพักอยู่ที่ NC และย้ายไป NO ได้ เส้นประจากคอยล์ไปยังใบสวิตช์หมายความว่าทั้งสองเป็นอุปกรณ์ชิ้นเดียวกัน เชื่อมกันทางกล ไม่ใช่ทางไฟฟ้า',
              'หน้าสัมผัสจะเขียนในสถานะที่ไม่ได้จ่ายไฟเสมอ NC จึงแสดงเป็นปิด และ NO แสดงเป็นเปิด',
            ],
            bullets: [
              'A1, A2: ขั้วของคอยล์',
              'COM: ขั้วร่วม คือหน้าสัมผัสที่เคลื่อนที่',
              'NC: ปกติปิด ต่อกับ COM ขณะคอยล์ไม่ได้รับไฟ',
              'NO: ปกติเปิด ต่อกับ COM เฉพาะขณะคอยล์ได้รับไฟ',
            ],
          },
          {
            heading: 'กระแสคอยล์และค่าดึงเข้า',
            body: [
              'คอยล์เป็นความต้านทาน กระแสจึงเป็นไปตามกฎของโอห์ม อาร์เมเจอร์จะขยับก็ต่อเมื่อกระแสนั้นสร้างแรงแม่เหล็กมากพอที่จะชนะสปริง เรียกว่ากระแสดึงเข้า ต่ำกว่านี้ไม่มีอะไรเกิดขึ้นไม่ว่าจะใกล้แค่ไหน สูงกว่านี้อาร์เมเจอร์จะสะบัดข้ามไป',
            ],
            formulas: [
              'I_coil = V_coil / R_coil',
              'ทำงานเมื่อ I_coil ≥ I_pull-in',
              'I_load = V_load / R_load   (ผ่าน NO เฉพาะขณะทำงาน)',
            ],
          },
          {
            heading: 'ทำไมต้องใช้รีเลย์',
            body: [
              'วงจรคอยล์และวงจรหน้าสัมผัสแยกจากกันทางไฟฟ้า กระแสไม่กี่มิลลิแอมป์จากไมโครคอนโทรลเลอร์ 5 V ผ่านทรานซิสเตอร์ สวิตช์โหลดไฟบ้าน 230 V ได้โดยไม่มีการเชื่อมต่อทางไฟฟ้าระหว่างกัน ในทางปฏิบัติจะต่อไดโอดคร่อมคอยล์ไว้ เพราะความเหนี่ยวนำของคอยล์สร้างแรงดันย้อนกลับสูงเมื่อถูกตัดไฟ',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'V_coil = 5 V, R_coil = 400 Ω, ค่าดึงเข้า 20 mA โหลดคือ 12 V คร่อม 100 Ω ต่อผ่าน NO',
            'I_coil = 5 / 400 = 12.5 mA ต่ำกว่า 20 mA รีเลย์จึงไม่ทำงาน COM พักอยู่ที่ NC และไม่มีกระแสโหลด',
            'คอยล์ต้องการแรงดันอย่างน้อย 20 mA × 400 Ω = 8 V จึงจะดึงเข้า',
            'ที่ 12 V: I_coil = 30 mA อาร์เมเจอร์ดึงเข้า COM แตะ NO และ I_load = 12 / 100 = 0.12 A',
          ],
        },
        mistakes: [
          'อ่าน NO และ NC จากรีเลย์ที่กำลังได้รับไฟ ปกติเปิดและปกติปิดหมายถึงหน้าสัมผัสเมื่อไม่มีกระแสคอยล์ ซึ่งก็คือสถานะที่ใช้เขียนในแผนภาพด้วย',
          'ขับคอยล์รีเลย์จากขาไมโครคอนโทรลเลอร์โดยตรง คอยล์ส่วนใหญ่ต้องการกระแสมากกว่าที่ขาจ่ายได้ และแรงดันกระชากตอนตัดไฟอาจทำให้เสียหาย ควรใช้ทรานซิสเตอร์และไดโอดกันแรงดันย้อนกลับ',
          'คาดว่ารีเลย์จะปล่อยที่ค่ากระแสดึงเข้า รีเลย์จริงปล่อยที่กระแสดรอปเอาต์ซึ่งต่ำกว่า ช่วยไม่ให้หน้าสัมผัสสั่นกระพือ โปรแกรมจำลองใช้ค่าขีดเดียวสำหรับทั้งสองกรณี',
        ],
        faq: [
          {
            q: 'รีเลย์ทำงานอย่างไร?',
            a: 'กระแสผ่านคอยล์ทำให้แกนเหล็กเป็นแม่เหล็ก ดึงอาร์เมเจอร์แบบบานพับให้ชนะสปริง อาร์เมเจอร์ย้ายหน้าสัมผัสร่วมจาก NC ไป NO ตัดกระแสแล้วสปริงจะดึงกลับ',
          },
          {
            q: 'NO และ NC บนรีเลย์หมายถึงอะไร?',
            a: 'NO (ปกติเปิด) ต่อกับ COM เฉพาะขณะคอยล์ได้รับไฟ NC (ปกติปิด) ต่อกับ COM ขณะคอยล์ไม่ได้รับไฟ ทั้งสองชื่ออธิบายรีเลย์ในสภาวะพัก',
          },
          {
            q: 'กระแสดึงเข้าของรีเลย์คืออะไร?',
            a: 'กระแสคอยล์ที่น้อยที่สุดที่สร้างแรงแม่เหล็กพอจะดึงอาร์เมเจอร์ข้ามไป เมื่อคอยล์มีความต้านทาน R ค่านี้กำหนดแรงดันคอยล์ต่ำสุดเท่ากับ I_pull-in × R',
          },
        ],
      },
    },
  },
];
