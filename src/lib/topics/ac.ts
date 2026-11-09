import type { AcState } from '@/lib/state/schemas';
import type { Topic } from './types';

export type AcMode = AcState['mode'];

/**
 * AC module topics. Worked examples use the simulator's default values, so
 * the numbers in the text are the numbers on screen.
 */
export const AC_TOPICS: readonly Topic<AcMode>[] = [
  {
    module: 'ac',
    slug: 'generator',
    mode: 'generator',
    seo: {
      title: 'AC Generator Simulator — How Electricity Is Generated',
      description:
        'Turn an AC generator by hand: see Faraday’s law make a sine wave, with poles, speed and f = P·n/120, peak and RMS EMF, slip rings, load current and power.',
      keywords: [
        'AC generator simulation',
        'how electricity is generated',
        'alternator',
        'Faraday’s law',
        'f = P n / 120',
        'generator EMF formula',
        'เครื่องกำเนิดไฟฟ้ากระแสสลับ',
        'หลักการผลิตไฟฟ้า',
      ],
      teaches: ['AC generator', 'Faraday’s law of induction', 'Synchronous speed', 'RMS value'],
    },
    text: {
      en: {
        nav: 'Generator',
        h1: 'AC generator: how electricity is generated',
        lead: 'Turn a coil in a magnetic field and watch Faraday’s law draw a sine wave. Change the poles, the speed and the coil, and see what sets the voltage and what sets the frequency.',
        card: 'A coil turning between magnet poles: Faraday’s law, f = P·n/120, peak and RMS EMF, and the load it drives.',
        sections: [
          {
            heading: 'Why a turning coil makes a sine wave',
            body: [
              'A coil of N turns and area A sits in a magnetic field of flux density B. As it turns through angle θ, the flux linking it is N·B·A·cos θ: largest when the coil faces the poles, zero when it lies along the field.',
              'Faraday’s law says the induced EMF is the rate of change of that flux linkage. Differentiate cos θ at a steady angular speed ω and you get a sine:',
            ],
            formulas: [
              'λ = N·B·A·cos(ωt)',
              'e = −dλ/dt = N·B·A·ω·sin(ωt)',
              'Emax = N·B·A·ω,   Erms = Emax / √2',
            ],
          },
          {
            heading: 'When the EMF is zero, and when it peaks',
            body: [
              'The EMF depends on how fast the flux changes, not on how much flux there is. Facing the poles (θ = 0°) the coil holds the most flux, but for that instant it isn’t changing, so e = 0. A quarter turn later the coil holds no flux at all, yet the flux is changing fastest, so e is at its peak.',
              'In the simulator the coil sides are marked ⊙ (current out of the page) and ⊗ (into the page). Watch them fade out and swap each half turn: that swap is the alternation in alternating current.',
            ],
          },
          {
            heading: 'Frequency: poles and speed',
            body: [
              'A machine with P poles passes P/2 north–south pairs for every mechanical turn, so each turn of the shaft gives P/2 electrical cycles. With the speed n in revolutions per minute:',
              'That is why grid generators run at fixed speeds: a 2-pole steam turbine at 3000 rpm and a 4-pole machine at 1500 rpm both give 50 Hz, and a slow hydro turbine needs many poles to reach the same frequency.',
            ],
            formulas: ['ωe = (P/2)·ωm', 'f = P·n / 120'],
          },
          {
            heading: 'From EMF to terminal voltage and power',
            body: [
              'Slip rings and brushes carry the coil’s current out to the load. The coil itself has resistance Ra, so some voltage is lost inside the machine: the terminal voltage is a little below the EMF, and the gap widens as the load draws more current.',
            ],
            formulas: ['I = E / (R + Ra)', 'V = I·R', 'P = V·I,   torque = P_gen / ωm'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'N = 100 turns, B = 0.50 T, A = 0.010 m², 2 poles at 3000 rpm, load R = 100 Ω, Ra = 1 Ω.',
            'ωm = 2π·3000/60 = 314.2 rad/s; with 2 poles ωe = ωm, so f = 2·3000/120 = 50 Hz and T = 20 ms.',
            'N·B·A = 100·0.50·0.010 = 0.50 Wb-turns, so Emax = 0.50·314.2 = 157.1 V and Erms = 111.1 V.',
            'I = 111.1 / (100 + 1) = 1.10 A rms; terminal V = 1.10·100 = 110.0 V; load power = 110.0·1.10 = 120.9 W.',
          ],
        },
        mistakes: [
          'Thinking the EMF is largest when the flux is largest. It is largest when the flux is changing fastest, a quarter turn later.',
          'Thinking more turns or a stronger magnet raises the frequency. They raise the voltage; only speed and poles set the frequency.',
          'Using the 2-pole formula for every machine: with P poles the electrical angle runs P/2 times faster than the shaft.',
        ],
        faq: [
          {
            q: 'What is the formula for the EMF of an AC generator?',
            a: 'e = N·B·A·ω·sin(ωt), so the peak EMF is Emax = N·B·A·ω and the RMS EMF is Emax/√2, with ω the electrical angular speed in rad/s.',
          },
          {
            q: 'How do you calculate generator frequency from speed?',
            a: 'f = P·n/120, with P the number of poles and n the speed in rpm. A 2-pole machine at 3000 rpm gives 50 Hz; at 3600 rpm it gives 60 Hz.',
          },
          {
            q: 'What do slip rings do in an AC generator?',
            a: 'They connect the rotating coil to the stationary circuit: each end of the coil goes to its own ring, and carbon brushes pressing on the rings carry the alternating current out to the load.',
          },
        ],
      },
      th: {
        nav: 'เครื่องกำเนิดไฟฟ้า',
        h1: 'เครื่องกำเนิดไฟฟ้ากระแสสลับ: ไฟฟ้าถูกผลิตขึ้นอย่างไร',
        lead: 'หมุนขดลวดในสนามแม่เหล็ก แล้วดูกฎของฟาราเดย์วาดคลื่นไซน์ ลองเปลี่ยนจำนวนขั้ว ความเร็ว และขดลวด เพื่อดูว่าอะไรกำหนดแรงดันและอะไรกำหนดความถี่',
        card: 'ขดลวดหมุนระหว่างขั้วแม่เหล็ก: กฎของฟาราเดย์ f = P·n/120 แรงเคลื่อนไฟฟ้าค่ายอดและ rms และโหลดที่ขับ',
        sections: [
          {
            heading: 'ทำไมขดลวดที่หมุนจึงให้คลื่นไซน์',
            body: [
              'ขดลวด N รอบ พื้นที่ A วางอยู่ในสนามแม่เหล็กความหนาแน่นฟลักซ์ B เมื่อหมุนไปเป็นมุม θ ฟลักซ์คล้องขดลวดคือ N·B·A·cos θ มากที่สุดเมื่อขดลวดหันหน้าเข้าหาขั้ว และเป็นศูนย์เมื่อวางขนานกับสนาม',
              'กฎของฟาราเดย์บอกว่าแรงเคลื่อนไฟฟ้าเหนี่ยวนำคืออัตราการเปลี่ยนแปลงของฟลักซ์คล้อง เมื่อหาอนุพันธ์ของ cos θ ที่ความเร็วเชิงมุม ω คงที่ จะได้ไซน์:',
            ],
            formulas: [
              'λ = N·B·A·cos(ωt)',
              'e = −dλ/dt = N·B·A·ω·sin(ωt)',
              'Emax = N·B·A·ω,   Erms = Emax / √2',
            ],
          },
          {
            heading: 'แรงเคลื่อนไฟฟ้าเป็นศูนย์และสูงสุดเมื่อใด',
            body: [
              'แรงเคลื่อนไฟฟ้าขึ้นกับว่าฟลักซ์เปลี่ยนเร็วแค่ไหน ไม่ใช่ว่ามีฟลักซ์มากเท่าใด เมื่อหันหน้าเข้าหาขั้ว (θ = 0°) ขดลวดมีฟลักซ์มากที่สุด แต่ขณะนั้นฟลักซ์ไม่เปลี่ยน e จึงเป็น 0 เมื่อหมุนไปอีกหนึ่งในสี่รอบ ขดลวดไม่มีฟลักซ์ผ่านเลย แต่ฟลักซ์เปลี่ยนเร็วที่สุด e จึงสูงสุด',
              'ในโปรแกรมจำลอง ด้านของขดลวดมีเครื่องหมาย ⊙ (กระแสออกจากหน้ากระดาษ) และ ⊗ (กระแสเข้าหน้ากระดาษ) ดูเครื่องหมายจางลงและสลับกันทุกครึ่งรอบ การสลับนั้นคือ "สลับ" ในคำว่ากระแสสลับ',
            ],
          },
          {
            heading: 'ความถี่: จำนวนขั้วและความเร็ว',
            body: [
              'เครื่องที่มี P ขั้ว จะผ่านคู่ขั้วเหนือ–ใต้ P/2 คู่ในหนึ่งรอบของเพลา เพลาหมุนหนึ่งรอบจึงได้ P/2 รอบทางไฟฟ้า เมื่อความเร็ว n มีหน่วยรอบต่อนาที:',
              'นี่คือเหตุผลที่เครื่องกำเนิดไฟฟ้าในระบบไฟฟ้าหมุนที่ความเร็วคงที่: กังหันไอน้ำ 2 ขั้วที่ 3000 rpm และเครื่อง 4 ขั้วที่ 1500 rpm ให้ 50 Hz เท่ากัน ส่วนกังหันน้ำที่หมุนช้าต้องมีหลายขั้วจึงจะได้ความถี่เดียวกัน',
            ],
            formulas: ['ωe = (P/2)·ωm', 'f = P·n / 120'],
          },
          {
            heading: 'จากแรงเคลื่อนไฟฟ้าสู่แรงดันที่ขั้วและกำลัง',
            body: [
              'สลิปริงและแปรงถ่านนำกระแสจากขดลวดออกไปยังโหลด ขดลวดเองมีความต้านทาน Ra จึงมีแรงดันตกภายในเครื่อง แรงดันที่ขั้วจึงต่ำกว่าแรงเคลื่อนไฟฟ้าเล็กน้อย และต่างกันมากขึ้นเมื่อโหลดดึงกระแสมากขึ้น',
            ],
            formulas: ['I = E / (R + Ra)', 'V = I·R', 'P = V·I,   แรงบิด = P_gen / ωm'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'N = 100 รอบ, B = 0.50 T, A = 0.010 m², 2 ขั้วที่ 3000 rpm, โหลด R = 100 Ω, Ra = 1 Ω',
            'ωm = 2π·3000/60 = 314.2 rad/s เมื่อมี 2 ขั้ว ωe = ωm ดังนั้น f = 2·3000/120 = 50 Hz และ T = 20 ms',
            'N·B·A = 100·0.50·0.010 = 0.50 Wb-รอบ ดังนั้น Emax = 0.50·314.2 = 157.1 V และ Erms = 111.1 V',
            'I = 111.1 / (100 + 1) = 1.10 A rms แรงดันที่ขั้ว = 1.10·100 = 110.0 V กำลังที่โหลด = 110.0·1.10 = 120.9 W',
          ],
        },
        mistakes: [
          'คิดว่าแรงเคลื่อนไฟฟ้าสูงสุดเมื่อฟลักซ์มากที่สุด ที่จริงสูงสุดเมื่อฟลักซ์เปลี่ยนเร็วที่สุด ซึ่งคือหนึ่งในสี่รอบถัดไป',
          'คิดว่าจำนวนรอบที่มากขึ้นหรือแม่เหล็กที่แรงขึ้นทำให้ความถี่สูงขึ้น สิ่งเหล่านี้เพิ่มแรงดัน มีเพียงความเร็วและจำนวนขั้วที่กำหนดความถี่',
          'ใช้สูตรของเครื่อง 2 ขั้วกับทุกเครื่อง: เครื่อง P ขั้ว มุมทางไฟฟ้าเปลี่ยนเร็วกว่าเพลา P/2 เท่า',
        ],
        faq: [
          {
            q: 'สูตรแรงเคลื่อนไฟฟ้าของเครื่องกำเนิดไฟฟ้ากระแสสลับคืออะไร?',
            a: 'e = N·B·A·ω·sin(ωt) แรงเคลื่อนไฟฟ้าค่ายอดคือ Emax = N·B·A·ω และค่า rms คือ Emax/√2 โดย ω คือความเร็วเชิงมุมทางไฟฟ้าในหน่วย rad/s',
          },
          {
            q: 'คำนวณความถี่ของเครื่องกำเนิดไฟฟ้าจากความเร็วอย่างไร?',
            a: 'f = P·n/120 โดย P คือจำนวนขั้ว และ n คือความเร็วในหน่วยรอบต่อนาที เครื่อง 2 ขั้วที่ 3000 rpm ให้ 50 Hz และที่ 3600 rpm ให้ 60 Hz',
          },
          {
            q: 'สลิปริงในเครื่องกำเนิดไฟฟ้ากระแสสลับทำหน้าที่อะไร?',
            a: 'เชื่อมขดลวดที่หมุนอยู่เข้ากับวงจรที่อยู่กับที่: ปลายแต่ละข้างของขดลวดต่อกับวงแหวนของตัวเอง และแปรงถ่านที่กดบนวงแหวนนำกระแสสลับออกไปยังโหลด',
          },
        ],
      },
    },
  },
  {
    module: 'ac',
    slug: 'sine-wave-rms',
    mode: 'sine',
    seo: {
      title: 'Sine Wave & RMS Calculator — Peak, RMS, Phasor',
      description:
        'Why 220 V mains peaks at 311 V: square the wave, average it, take the root. Compare RMS of sine, square and triangle waves, and watch the phasor draw the sine.',
      keywords: [
        'RMS calculator',
        'RMS voltage',
        'peak to RMS',
        'Vrms = Vp/√2',
        'sine wave graph',
        'phasor',
        'ค่าอาร์เอ็มเอส',
        'คลื่นไซน์',
      ],
      teaches: ['RMS value', 'Peak and peak-to-peak voltage', 'Phasors', 'Crest factor'],
    },
    text: {
      en: {
        nav: 'Sine wave & RMS',
        h1: 'Sine wave and RMS: what “220 V” really means',
        lead: 'Graph a sine wave, square it, average it and take the root. See why mains quoted as 220 V swings to 311 V, and why the √2 rule only works for sines.',
        card: 'Peak, peak-to-peak and RMS; why Vrms = Vp/√2 for sines only; the phasor that draws the wave.',
        sections: [
          {
            heading: 'Describing a sine wave',
            body: [
              'A sinusoidal voltage is fixed by three numbers: its peak Vp, its frequency f and its phase φ. The period is T = 1/f and the angular frequency ω = 2πf.',
            ],
            formulas: ['v(t) = Vp·sin(ωt + φ)', 'T = 1/f,   ω = 2πf', 'Vpp = 2·Vp'],
          },
          {
            heading: 'RMS: root of the mean of the square',
            body: [
              'The average of a sine wave over a period is zero, so the average is useless for power. RMS (root-mean-square) asks a better question: what DC voltage would heat a resistor equally? Square the waveform so every part is positive, take the mean over one period, then the square root.',
              'For a sine, the mean of sin² is exactly ½, so Vrms = Vp/√2. That is why Thai mains, quoted as 220 V rms, actually peaks at 220·√2 ≈ 311 V.',
            ],
            formulas: ['Vrms = √( (1/T)·∫ v² dt )', 'sine: Vrms = Vp / √2 ≈ 0.707·Vp'],
          },
          {
            heading: 'Square and triangle waves break the √2 rule',
            body: [
              'The factor √2 comes from the shape of a sine. A square wave sits at ±Vp all the time, so v² is Vp² everywhere and Vrms = Vp. A triangle wave spends more time near zero, so Vrms = Vp/√3. The ratio Vp/Vrms is called the crest factor.',
            ],
            bullets: [
              'Sine: Vrms = 0.707·Vp, crest factor 1.414',
              'Square: Vrms = Vp, crest factor 1',
              'Triangle: Vrms = 0.577·Vp, crest factor 1.732',
            ],
          },
          {
            heading: 'The phasor: a rotating arrow',
            body: [
              'Picture an arrow of length Vp rotating anticlockwise at ω. Its height at any instant is Vp·sin(ωt + φ): the sine wave. The phase φ is just where the arrow starts. Phasors turn calculus on sines into geometry, which is how the RLC and three-phase sections work.',
            ],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Sine wave, Vp = 311 V, f = 50 Hz.',
            'T = 1/50 = 20 ms; ω = 2π·50 = 314.2 rad/s; Vpp = 622 V.',
            'Vrms = 311/√2 = 220 V: the number on the electricity bill.',
            'Switch to a square wave of the same peak: Vrms = 311 V, so the same peak delivers twice the heating power (Vrms² is twice as big).',
          ],
        },
        mistakes: [
          'Using Vrms = Vp/√2 for every waveform. It is true only for sines.',
          'Confusing peak and peak-to-peak: an oscilloscope’s Vpp is twice the peak.',
          'Treating the average of a sine as its “effective” value. The average over a period is zero; RMS is the effective value.',
        ],
        faq: [
          {
            q: 'How do you convert peak voltage to RMS?',
            a: 'For a sine wave divide by √2: Vrms = Vp/√2 ≈ 0.707·Vp. For other shapes use the definition: square, average over a period, square root.',
          },
          {
            q: 'Why is 220 V mains 311 V peak?',
            a: '220 V is the RMS value. The peak of a sine is √2 times its RMS, and 220·√2 ≈ 311 V.',
          },
          {
            q: 'What is RMS used for?',
            a: 'RMS is the equivalent DC value for heating: a resistor dissipates P = Vrms²/R on AC, exactly as it would on that much DC. Ratings of mains, meters and loads are all RMS.',
          },
        ],
      },
      th: {
        nav: 'คลื่นไซน์และค่าอาร์เอ็มเอส',
        h1: 'คลื่นไซน์และค่าอาร์เอ็มเอส: “220 V” หมายความว่าอะไรจริง ๆ',
        lead: 'วาดกราฟคลื่นไซน์ ยกกำลังสอง หาค่าเฉลี่ย แล้วถอดราก ดูว่าทำไมไฟบ้านที่ระบุว่า 220 V จึงแกว่งถึง 311 V และทำไมกฎ √2 ใช้ได้กับคลื่นไซน์เท่านั้น',
        card: 'ค่ายอด ค่ายอดถึงยอด และค่า rms ทำไม Vrms = Vp/√2 ใช้ได้กับไซน์เท่านั้น และเฟสเซอร์ที่วาดคลื่น',
        sections: [
          {
            heading: 'การอธิบายคลื่นไซน์',
            body: [
              'แรงดันรูปไซน์กำหนดได้ด้วยตัวเลขสามตัว: ค่ายอด Vp ความถี่ f และเฟส φ คาบคือ T = 1/f และความถี่เชิงมุม ω = 2πf',
            ],
            formulas: ['v(t) = Vp·sin(ωt + φ)', 'T = 1/f,   ω = 2πf', 'Vpp = 2·Vp'],
          },
          {
            heading: 'ค่าอาร์เอ็มเอส: รากของค่าเฉลี่ยของกำลังสอง',
            body: [
              'ค่าเฉลี่ยของคลื่นไซน์ตลอดหนึ่งคาบเป็นศูนย์ จึงใช้คิดเรื่องกำลังไม่ได้ ค่า rms ถามคำถามที่ดีกว่า: แรงดันไฟตรงเท่าใดที่ทำให้ตัวต้านทานร้อนเท่ากัน ยกกำลังสองรูปคลื่นเพื่อให้ทุกส่วนเป็นบวก หาค่าเฉลี่ยตลอดหนึ่งคาบ แล้วถอดรากที่สอง',
              'สำหรับไซน์ ค่าเฉลี่ยของ sin² เท่ากับ ½ พอดี ดังนั้น Vrms = Vp/√2 นี่คือเหตุผลที่ไฟบ้านในไทยซึ่งระบุว่า 220 V rms มีค่ายอดจริงประมาณ 220·√2 ≈ 311 V',
            ],
            formulas: ['Vrms = √( (1/T)·∫ v² dt )', 'ไซน์: Vrms = Vp / √2 ≈ 0.707·Vp'],
          },
          {
            heading: 'คลื่นสี่เหลี่ยมและสามเหลี่ยมไม่เป็นไปตามกฎ √2',
            body: [
              'ตัวประกอบ √2 มาจากรูปร่างของไซน์ คลื่นสี่เหลี่ยมอยู่ที่ ±Vp ตลอดเวลา v² จึงเท่ากับ Vp² ทุกขณะ และ Vrms = Vp คลื่นสามเหลี่ยมอยู่ใกล้ศูนย์นานกว่า จึงได้ Vrms = Vp/√3 อัตราส่วน Vp/Vrms เรียกว่าแฟกเตอร์ยอด (crest factor)',
            ],
            bullets: [
              'ไซน์: Vrms = 0.707·Vp แฟกเตอร์ยอด 1.414',
              'สี่เหลี่ยม: Vrms = Vp แฟกเตอร์ยอด 1',
              'สามเหลี่ยม: Vrms = 0.577·Vp แฟกเตอร์ยอด 1.732',
            ],
          },
          {
            heading: 'เฟสเซอร์: ลูกศรที่หมุน',
            body: [
              'นึกภาพลูกศรยาว Vp หมุนทวนเข็มนาฬิกาด้วยความเร็ว ω ความสูงของลูกศรในแต่ละขณะคือ Vp·sin(ωt + φ) ซึ่งก็คือคลื่นไซน์ เฟส φ คือตำแหน่งเริ่มต้นของลูกศร เฟสเซอร์เปลี่ยนแคลคูลัสของไซน์ให้เป็นเรขาคณิต ซึ่งเป็นพื้นฐานของหัวข้อ RLC และไฟฟ้าสามเฟส',
            ],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'คลื่นไซน์ Vp = 311 V, f = 50 Hz',
            'T = 1/50 = 20 ms; ω = 2π·50 = 314.2 rad/s; Vpp = 622 V',
            'Vrms = 311/√2 = 220 V ซึ่งคือตัวเลขในบิลค่าไฟ',
            'เปลี่ยนเป็นคลื่นสี่เหลี่ยมที่มีค่ายอดเท่ากัน: Vrms = 311 V ค่ายอดเท่ากันจึงให้กำลังความร้อนเป็นสองเท่า (Vrms² เป็นสองเท่า)',
          ],
        },
        mistakes: [
          'ใช้ Vrms = Vp/√2 กับทุกรูปคลื่น ซึ่งจริงสำหรับไซน์เท่านั้น',
          'สับสนระหว่างค่ายอดกับค่ายอดถึงยอด: Vpp บนออสซิลโลสโคปเป็นสองเท่าของค่ายอด',
          'ใช้ค่าเฉลี่ยของไซน์เป็นค่า “ประสิทธิผล” ค่าเฉลี่ยตลอดหนึ่งคาบเป็นศูนย์ ค่า rms ต่างหากคือค่าประสิทธิผล',
        ],
        faq: [
          {
            q: 'แปลงแรงดันค่ายอดเป็นค่า rms อย่างไร?',
            a: 'สำหรับคลื่นไซน์ให้หารด้วย √2: Vrms = Vp/√2 ≈ 0.707·Vp สำหรับรูปคลื่นอื่นให้ใช้นิยาม: ยกกำลังสอง หาค่าเฉลี่ยตลอดหนึ่งคาบ แล้วถอดรากที่สอง',
          },
          {
            q: 'ทำไมไฟบ้าน 220 V จึงมีค่ายอด 311 V?',
            a: '220 V คือค่า rms ค่ายอดของไซน์เป็น √2 เท่าของค่า rms และ 220·√2 ≈ 311 V',
          },
          {
            q: 'ค่า rms ใช้ทำอะไร?',
            a: 'ค่า rms คือค่าไฟตรงที่ให้ความร้อนเท่ากัน ตัวต้านทานใช้กำลัง P = Vrms²/R บนไฟสลับ เท่ากับเมื่อจ่ายไฟตรงขนาดนั้น พิกัดของไฟบ้าน มิเตอร์ และโหลดล้วนเป็นค่า rms',
          },
        ],
      },
    },
  },
  {
    module: 'ac',
    slug: 'rlc-power-factor',
    mode: 'load',
    seo: {
      title: 'Power Factor & RLC Circuit Simulator — Leading, Lagging',
      description:
        'Connect R, L and C loads to 220 V and watch current lead or lag: impedance, phase angle, real, reactive and apparent power, power factor correction and resonance.',
      keywords: [
        'power factor',
        'power factor calculator',
        'RLC circuit simulator',
        'leading and lagging current',
        'power triangle',
        'impedance calculator',
        'series resonance',
        'ตัวประกอบกำลัง',
        'วงจร RLC',
      ],
      teaches: ['Impedance', 'Phase angle', 'Power factor', 'Power triangle', 'Series resonance'],
    },
    text: {
      en: {
        nav: 'RLC load & power factor',
        h1: 'RLC circuits and power factor: leading and lagging current',
        lead: 'Put R, L and C loads on a 220 V, 50 Hz supply and watch the current shift against the voltage. Read the impedance, the power triangle and the power factor, and tune to resonance.',
        card: 'Impedance and phase angle; why inductors lag and capacitors lead; P, Q, S and power factor; resonance.',
        sections: [
          {
            heading: 'Impedance: resistance plus reactance',
            body: [
              'On AC an inductor and a capacitor oppose current with reactance, which depends on frequency. Inductive reactance rises with f; capacitive reactance falls. In a series circuit they add to the resistance as a complex impedance:',
            ],
            formulas: [
              'X_L = 2πf·L,   X_C = 1 / (2πf·C)',
              'Z = R + j(X_L − X_C)',
              '|Z| = √(R² + (X_L − X_C)²),   θ = atan((X_L − X_C)/R)',
            ],
          },
          {
            heading: 'Lead and lag',
            body: [
              'The angle θ is how far the voltage leads the current. An inductor resists changes in current, so the current peaks a quarter cycle after the voltage: inductive loads lag. A capacitor must charge before its voltage rises, so its current peaks first: capacitive loads lead. A pure resistor keeps them in step.',
            ],
            bullets: [
              'R only: θ = 0°, in phase',
              'L only: current lags by 90°',
              'C only: current leads by 90°',
              'RL: lags by 0–90°; RC: leads by 0–90°',
            ],
          },
          {
            heading: 'Real, reactive and apparent power',
            body: [
              'Only the part of the current in phase with the voltage delivers energy. The rest flows back and forth each cycle. The three powers form a right-angled triangle, and the power factor is the cosine of θ.',
            ],
            formulas: [
              'S = V·I  (VA)',
              'P = V·I·cos θ  (W)',
              'Q = V·I·sin θ  (var)',
              'PF = cos θ = P / S',
            ],
          },
          {
            heading: 'Power factor correction and resonance',
            body: [
              'Motors are inductive, so factories draw lagging reactive power that the utility must still carry. A capacitor across the load supplies leading Q that cancels it, raising the power factor toward 1 and cutting the line current.',
              'In a series RLC circuit, X_L and X_C cancel at one frequency, the resonant frequency. There Z = R, the current is largest and the power factor is exactly 1.',
            ],
            formulas: ['f0 = 1 / (2π·√(L·C))'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default RL load)',
          steps: [
            'RL load: R = 10 Ω, L = 50 mH on 220 V, 50 Hz.',
            'X_L = 2π·50·0.050 = 15.71 Ω; |Z| = √(10² + 15.71²) = 18.62 Ω; θ = atan(15.71/10) = 57.5°.',
            'I = 220/18.62 = 11.8 A, lagging by 57.5°; PF = cos 57.5° = 0.537 lagging.',
            'P = I²R = 1.40 kW; Q = I²X_L = 2.19 kvar; S = V·I = 2.60 kVA.',
            'To correct to PF = 1, add C = Q/(ωV²) = 2193/(314.2·220²) ≈ 144 µF in parallel.',
          ],
        },
        mistakes: [
          'Adding R and X directly. They are at right angles: |Z| = √(R² + X²), not R + X.',
          'Mixing up the sign: inductive loads lag (θ > 0); capacitive loads lead (θ < 0).',
          'Thinking reactive power is wasted energy. It does no work on average, but it still flows in the wires and loads them.',
        ],
        faq: [
          {
            q: 'What is power factor?',
            a: 'The ratio of real power to apparent power, PF = P/S = cos θ, where θ is the phase angle between voltage and current. It runs from 0 (purely reactive) to 1 (purely resistive).',
          },
          {
            q: 'Why does current lag in an inductor?',
            a: 'An inductor’s voltage is L·di/dt, so it is largest where the current changes fastest: as the current crosses zero. That puts the current’s peak a quarter cycle (90°) after the voltage’s.',
          },
          {
            q: 'How do you find the resonant frequency of an RLC circuit?',
            a: 'f0 = 1/(2π√(LC)), where X_L = X_C. With L = 50 mH and C = 100 µF, f0 ≈ 71 Hz.',
          },
        ],
      },
      th: {
        nav: 'โหลด RLC และตัวประกอบกำลัง',
        h1: 'วงจร RLC และตัวประกอบกำลัง: กระแสนำหน้าและล้าหลัง',
        lead: 'ต่อโหลด R, L และ C เข้ากับแหล่งจ่าย 220 V 50 Hz แล้วดูกระแสเลื่อนเฟสเทียบกับแรงดัน อ่านค่าอิมพีแดนซ์ สามเหลี่ยมกำลัง และตัวประกอบกำลัง และปรับไปที่จุดเรโซแนนซ์',
        card: 'อิมพีแดนซ์และมุมเฟส ทำไมตัวเหนี่ยวนำล้าหลังและตัวเก็บประจุนำหน้า P, Q, S และตัวประกอบกำลัง เรโซแนนซ์',
        sections: [
          {
            heading: 'อิมพีแดนซ์: ความต้านทานบวกรีแอกแตนซ์',
            body: [
              'บนไฟสลับ ตัวเหนี่ยวนำและตัวเก็บประจุต้านกระแสด้วยรีแอกแตนซ์ ซึ่งขึ้นกับความถี่ รีแอกแตนซ์เชิงเหนี่ยวนำเพิ่มตาม f ส่วนรีแอกแตนซ์เชิงความจุลดลง ในวงจรอนุกรมจะรวมกับความต้านทานเป็นอิมพีแดนซ์เชิงซ้อน:',
            ],
            formulas: [
              'X_L = 2πf·L,   X_C = 1 / (2πf·C)',
              'Z = R + j(X_L − X_C)',
              '|Z| = √(R² + (X_L − X_C)²),   θ = atan((X_L − X_C)/R)',
            ],
          },
          {
            heading: 'นำหน้าและล้าหลัง',
            body: [
              'มุม θ คือมุมที่แรงดันนำหน้ากระแส ตัวเหนี่ยวนำต้านการเปลี่ยนแปลงของกระแส กระแสจึงถึงยอดหลังแรงดันหนึ่งในสี่รอบ: โหลดเหนี่ยวนำล้าหลัง ตัวเก็บประจุต้องประจุก่อนแรงดันจึงจะขึ้น กระแสจึงถึงยอดก่อน: โหลดตัวเก็บประจุนำหน้า ตัวต้านทานล้วนให้ทั้งสองไปพร้อมกัน',
            ],
            bullets: [
              'R อย่างเดียว: θ = 0° เฟสตรงกัน',
              'L อย่างเดียว: กระแสล้าหลัง 90°',
              'C อย่างเดียว: กระแสนำหน้า 90°',
              'RL: ล้าหลัง 0–90°; RC: นำหน้า 0–90°',
            ],
          },
          {
            heading: 'กำลังจริง กำลังรีแอกทีฟ และกำลังปรากฏ',
            body: [
              'มีเพียงส่วนของกระแสที่เฟสตรงกับแรงดันเท่านั้นที่ส่งพลังงาน ส่วนที่เหลือไหลไปกลับในแต่ละรอบ กำลังทั้งสามเป็นสามเหลี่ยมมุมฉาก และตัวประกอบกำลังคือ cos ของ θ',
            ],
            formulas: [
              'S = V·I  (VA)',
              'P = V·I·cos θ  (W)',
              'Q = V·I·sin θ  (var)',
              'PF = cos θ = P / S',
            ],
          },
          {
            heading: 'การแก้ตัวประกอบกำลังและเรโซแนนซ์',
            body: [
              'มอเตอร์เป็นโหลดเหนี่ยวนำ โรงงานจึงดึงกำลังรีแอกทีฟแบบล้าหลังซึ่งการไฟฟ้ายังต้องส่งผ่านสาย การต่อตัวเก็บประจุคร่อมโหลดจะจ่าย Q แบบนำหน้ามาหักล้าง ทำให้ตัวประกอบกำลังเข้าใกล้ 1 และกระแสในสายลดลง',
              'ในวงจร RLC อนุกรม X_L และ X_C หักล้างกันที่ความถี่หนึ่ง เรียกว่าความถี่เรโซแนนซ์ ที่นั่น Z = R กระแสมากที่สุด และตัวประกอบกำลังเท่ากับ 1 พอดี',
            ],
            formulas: ['f0 = 1 / (2π·√(L·C))'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (โหลด RL ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'โหลด RL: R = 10 Ω, L = 50 mH ต่อกับ 220 V 50 Hz',
            'X_L = 2π·50·0.050 = 15.71 Ω; |Z| = √(10² + 15.71²) = 18.62 Ω; θ = atan(15.71/10) = 57.5°',
            'I = 220/18.62 = 11.8 A ล้าหลัง 57.5°; PF = cos 57.5° = 0.537 ล้าหลัง',
            'P = I²R = 1.40 kW; Q = I²X_L = 2.19 kvar; S = V·I = 2.60 kVA',
            'ถ้าต้องการแก้ให้ PF = 1 ให้ต่อ C = Q/(ωV²) = 2193/(314.2·220²) ≈ 144 µF ขนานกับโหลด',
          ],
        },
        mistakes: [
          'บวก R กับ X ตรง ๆ ทั้งสองตั้งฉากกัน: |Z| = √(R² + X²) ไม่ใช่ R + X',
          'สับสนเครื่องหมาย: โหลดเหนี่ยวนำล้าหลัง (θ > 0) โหลดตัวเก็บประจุนำหน้า (θ < 0)',
          'คิดว่ากำลังรีแอกทีฟเป็นพลังงานที่สูญเปล่า โดยเฉลี่ยมันไม่ทำงาน แต่ยังไหลอยู่ในสายไฟและทำให้สายรับภาระ',
        ],
        faq: [
          {
            q: 'ตัวประกอบกำลังคืออะไร?',
            a: 'อัตราส่วนของกำลังจริงต่อกำลังปรากฏ PF = P/S = cos θ โดย θ คือมุมเฟสระหว่างแรงดันกับกระแส มีค่าตั้งแต่ 0 (รีแอกทีฟล้วน) ถึง 1 (ความต้านทานล้วน)',
          },
          {
            q: 'ทำไมกระแสในตัวเหนี่ยวนำจึงล้าหลัง?',
            a: 'แรงดันของตัวเหนี่ยวนำคือ L·di/dt จึงสูงสุดเมื่อกระแสเปลี่ยนเร็วที่สุด คือขณะกระแสผ่านศูนย์ ทำให้ยอดของกระแสอยู่หลังยอดของแรงดันหนึ่งในสี่รอบ (90°)',
          },
          {
            q: 'หาความถี่เรโซแนนซ์ของวงจร RLC อย่างไร?',
            a: 'f0 = 1/(2π√(LC)) ซึ่งเป็นจุดที่ X_L = X_C เมื่อ L = 50 mH และ C = 100 µF จะได้ f0 ≈ 71 Hz',
          },
        ],
      },
    },
  },
  {
    module: 'ac',
    slug: 'three-phase',
    mode: 'threephase',
    seo: {
      title: 'Three-Phase Power Simulator — Star & Delta, √3 Explained',
      description:
        'See three-phase AC: three coils 120° apart, phasors, line vs phase voltage (√3), star and delta connection, neutral current and constant total power.',
      keywords: [
        'three phase',
        'three phase power',
        'star delta connection',
        'line voltage vs phase voltage',
        '3 phase waveform',
        'neutral current',
        'ไฟฟ้าสามเฟส',
        'การต่อสตาร์ เดลตา',
      ],
      teaches: [
        'Three-phase power',
        'Star (Y) connection',
        'Delta (Δ) connection',
        'Line and phase voltage',
        'Neutral current',
      ],
    },
    text: {
      en: {
        nav: 'Three phase',
        h1: 'Three-phase power: star, delta and the √3',
        lead: 'Three coils 120° apart make three sine voltages 120° apart. See why line voltage is √3 times phase voltage, how star and delta differ, and why a balanced load needs no neutral current.',
        card: 'Three voltages 120° apart; line = √3 × phase; star vs delta; neutral current; constant total power.',
        sections: [
          {
            heading: 'Three coils, three phases',
            body: [
              'A power-station generator spins a magnet inside three fixed coils spaced 120° around the stator. Each coil gives a sine voltage, and because the coils are 120° apart, so are their voltages: phase B lags A by 120°, and C lags B by another 120°.',
            ],
            formulas: ['va = Vp·sin(ωt)', 'vb = Vp·sin(ωt − 120°)', 'vc = Vp·sin(ωt + 120°)'],
          },
          {
            heading: 'Phase voltage and line voltage',
            body: [
              'Phase voltage is measured from a line to neutral; line voltage between two lines. The line voltage is the difference of two phase phasors 120° apart, which is √3 times longer and leads by 30°. That is why the Thai low-voltage supply is quoted as 230/400 V.',
            ],
            formulas: ['V_L = √3 · V_ph', '230 V · √3 ≈ 400 V'],
          },
          {
            heading: 'Star (Y) and delta (Δ)',
            body: [
              'In star, each load connects from a line to a common star point tied to neutral: it sees the phase voltage, and the line current is its own current. In delta, each load connects between two lines: it sees the line voltage, and each line current is the difference of two load currents, √3 times larger when balanced.',
            ],
            bullets: [
              'Star: V_load = V_ph, I_line = I_load, has a neutral',
              'Delta: V_load = V_L, I_line = √3·I_load, no neutral',
              'Same three loads in delta draw 3× the power of star',
            ],
          },
          {
            heading: 'Why grids use three phases',
            body: [
              'In a balanced system the three currents add to zero at every instant, so the neutral carries nothing and three wires do the work of six. And the total power v·i summed over the phases is constant, not pulsing at twice the supply frequency as single phase does, which is why three-phase motors run smoothly. Unbalance the load and both benefits fade: current returns through the neutral and the power ripples.',
            ],
            formulas: ['P = √3 · V_L · I_L · cos θ = 3 · V_ph · I_ph · cos θ'],
          },
        ],
        example: {
          heading: 'Worked example (the simulator’s default values)',
          steps: [
            'Star-connected supply, 230 V phase, 50 Hz; each load R = 20 Ω, X = 10 Ω (inductive).',
            'V_L = √3·230 = 398 V; |Z| = √(20² + 10²) = 22.4 Ω; I = 230/22.4 = 10.3 A, lagging by 26.6°.',
            'PF = cos 26.6° = 0.894; P = 3·10.3²·20 = 6.35 kW; Q = 3.17 kvar; neutral current 0 A.',
            'Reconnect the same loads in delta: each sees 398 V, I_load = 17.8 A, I_line = 30.9 A, P = 19.0 kW (three times).',
          ],
        },
        mistakes: [
          'Adding phase voltages arithmetically. Two 230 V phases 120° apart give 400 V between them, not 460 V.',
          'Expecting neutral current to be three times one phase current. Balanced, it is zero.',
          'Forgetting which voltage the load sees: phase voltage in star, line voltage in delta.',
        ],
        faq: [
          {
            q: 'Why is line voltage √3 times phase voltage?',
            a: 'The line voltage is the difference between two phase voltages 120° apart. Geometrically, that difference is √3 times as long as each phasor and leads by 30°.',
          },
          {
            q: 'What is the difference between star and delta connection?',
            a: 'In star each load sits between a line and neutral (phase voltage, line current = load current). In delta each load sits between two lines (line voltage, line current = √3 × load current), with no neutral.',
          },
          {
            q: 'Why is the neutral current zero in a balanced three-phase system?',
            a: 'Three equal currents 120° apart sum to zero at every instant, like three equal arrows at 120° adding to nothing. Any unbalance leaves a remainder, which returns through the neutral.',
          },
        ],
      },
      th: {
        nav: 'ไฟฟ้าสามเฟส',
        h1: 'ไฟฟ้าสามเฟส: สตาร์ เดลตา และ √3',
        lead: 'ขดลวดสามชุดที่ห่างกัน 120° ให้แรงดันไซน์สามเฟสที่ห่างกัน 120° ดูว่าทำไมแรงดันสายจึงเป็น √3 เท่าของแรงดันเฟส การต่อแบบสตาร์และเดลตาต่างกันอย่างไร และทำไมโหลดสมดุลจึงไม่มีกระแสนิวทรัล',
        card: 'แรงดันสามเฟสห่างกัน 120° แรงดันสาย = √3 × แรงดันเฟส สตาร์กับเดลตา กระแสนิวทรัล และกำลังรวมที่คงที่',
        sections: [
          {
            heading: 'ขดลวดสามชุด สามเฟส',
            body: [
              'เครื่องกำเนิดไฟฟ้าในโรงไฟฟ้าหมุนแม่เหล็กภายในขดลวดที่อยู่กับที่สามชุด วางห่างกัน 120° รอบสเตเตอร์ ขดลวดแต่ละชุดให้แรงดันไซน์ และเพราะขดลวดห่างกัน 120° แรงดันจึงห่างกัน 120° ด้วย: เฟส B ล้าหลัง A 120° และ C ล้าหลัง B อีก 120°',
            ],
            formulas: ['va = Vp·sin(ωt)', 'vb = Vp·sin(ωt − 120°)', 'vc = Vp·sin(ωt + 120°)'],
          },
          {
            heading: 'แรงดันเฟสและแรงดันสาย',
            body: [
              'แรงดันเฟสวัดจากสายไปยังนิวทรัล แรงดันสายวัดระหว่างสองสาย แรงดันสายคือผลต่างของเฟสเซอร์สองตัวที่ห่างกัน 120° ซึ่งยาวกว่า √3 เท่าและนำหน้า 30° นี่คือเหตุผลที่ระบบไฟฟ้าแรงต่ำในไทยระบุเป็น 230/400 V',
            ],
            formulas: ['V_L = √3 · V_ph', '230 V · √3 ≈ 400 V'],
          },
          {
            heading: 'สตาร์ (Y) และเดลตา (Δ)',
            body: [
              'แบบสตาร์ โหลดแต่ละตัวต่อจากสายไปยังจุดสตาร์ร่วมที่ต่อกับนิวทรัล จึงได้แรงดันเฟส และกระแสสายคือกระแสของโหลดนั้นเอง แบบเดลตา โหลดแต่ละตัวต่อระหว่างสองสาย จึงได้แรงดันสาย และกระแสสายแต่ละเส้นคือผลต่างของกระแสโหลดสองตัว ซึ่งมากกว่า √3 เท่าเมื่อสมดุล',
            ],
            bullets: [
              'สตาร์: V_load = V_ph, I_line = I_load มีนิวทรัล',
              'เดลตา: V_load = V_L, I_line = √3·I_load ไม่มีนิวทรัล',
              'โหลดสามตัวเดิมต่อแบบเดลตาใช้กำลังเป็น 3 เท่าของแบบสตาร์',
            ],
          },
          {
            heading: 'ทำไมระบบไฟฟ้าจึงใช้สามเฟส',
            body: [
              'ในระบบที่สมดุล กระแสทั้งสามรวมกันเป็นศูนย์ทุกขณะ สายนิวทรัลจึงไม่มีกระแส และสายสามเส้นทำงานแทนสายหกเส้นได้ นอกจากนี้กำลังรวม v·i ของทุกเฟสยังคงที่ ไม่เต้นเป็นจังหวะที่สองเท่าของความถี่เหมือนระบบเฟสเดียว มอเตอร์สามเฟสจึงหมุนได้ราบรื่น ถ้าโหลดไม่สมดุล ข้อดีทั้งสองจะลดลง: มีกระแสไหลกลับทางนิวทรัล และกำลังเริ่มกระเพื่อม',
            ],
            formulas: ['P = √3 · V_L · I_L · cos θ = 3 · V_ph · I_ph · cos θ'],
          },
        ],
        example: {
          heading: 'ตัวอย่างการคำนวณ (ค่าเริ่มต้นของโปรแกรมจำลอง)',
          steps: [
            'แหล่งจ่ายแบบสตาร์ แรงดันเฟส 230 V 50 Hz โหลดแต่ละตัว R = 20 Ω, X = 10 Ω (เหนี่ยวนำ)',
            'V_L = √3·230 = 398 V; |Z| = √(20² + 10²) = 22.4 Ω; I = 230/22.4 = 10.3 A ล้าหลัง 26.6°',
            'PF = cos 26.6° = 0.894; P = 3·10.3²·20 = 6.35 kW; Q = 3.17 kvar; กระแสนิวทรัล 0 A',
            'ต่อโหลดเดิมแบบเดลตา: แต่ละตัวได้ 398 V, I_load = 17.8 A, I_line = 30.9 A, P = 19.0 kW (สามเท่า)',
          ],
        },
        mistakes: [
          'บวกแรงดันเฟสแบบเลขคณิต สองเฟสขนาด 230 V ที่ห่างกัน 120° ให้แรงดันระหว่างกัน 400 V ไม่ใช่ 460 V',
          'คาดว่ากระแสนิวทรัลเป็นสามเท่าของกระแสเฟส เมื่อสมดุลกระแสนิวทรัลเป็นศูนย์',
          'ลืมว่าโหลดได้แรงดันใด: แรงดันเฟสในแบบสตาร์ แรงดันสายในแบบเดลตา',
        ],
        faq: [
          {
            q: 'ทำไมแรงดันสายจึงเป็น √3 เท่าของแรงดันเฟส?',
            a: 'แรงดันสายคือผลต่างของแรงดันเฟสสองตัวที่ห่างกัน 120° ในทางเรขาคณิต ผลต่างนั้นยาวกว่าเฟสเซอร์แต่ละตัว √3 เท่าและนำหน้า 30°',
          },
          {
            q: 'การต่อแบบสตาร์กับเดลตาต่างกันอย่างไร?',
            a: 'แบบสตาร์ โหลดแต่ละตัวอยู่ระหว่างสายกับนิวทรัล (แรงดันเฟส กระแสสาย = กระแสโหลด) แบบเดลตา โหลดแต่ละตัวอยู่ระหว่างสองสาย (แรงดันสาย กระแสสาย = √3 × กระแสโหลด) และไม่มีนิวทรัล',
          },
          {
            q: 'ทำไมกระแสนิวทรัลจึงเป็นศูนย์ในระบบสามเฟสที่สมดุล?',
            a: 'กระแสสามเฟสที่ขนาดเท่ากันและห่างกัน 120° รวมกันเป็นศูนย์ทุกขณะ เหมือนลูกศรสามอันยาวเท่ากันที่ทำมุม 120° รวมกันได้ศูนย์ ถ้าไม่สมดุลจะมีส่วนเหลือ ซึ่งไหลกลับทางนิวทรัล',
          },
        ],
      },
    },
  },
];
