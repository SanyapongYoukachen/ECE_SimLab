import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'DC motor, stepper motor and relay actuator simulator — ECE Labsim';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'ECE Labsim · Module 8',
    title: 'Actuator simulator',
    subtitle: 'A spinning DC motor, a stepping motor, and a relay snapping between contacts.',
  });
}
