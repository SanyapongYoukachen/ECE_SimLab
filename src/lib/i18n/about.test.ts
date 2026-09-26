import { describe, it, expect } from 'vitest';
import { MESSAGES } from './messages';

describe('About sections', () => {
  it('have the same number of points, concepts and FAQ entries in English and Thai', () => {
    const { heading, whatHeading, conceptsHeading, faqHeading, ...pages } = MESSAGES.en.about;
    void heading;
    void whatHeading;
    void conceptsHeading;
    void faqHeading;
    for (const page of Object.keys(pages) as (keyof typeof pages)[]) {
      const en = MESSAGES.en.about[page];
      const th = MESSAGES.th.about[page];
      expect(th.points.length, `${page} points`).toBe(en.points.length);
      expect(th.concepts.length, `${page} concepts`).toBe(en.concepts.length);
      expect(th.faq.length, `${page} faq`).toBe(en.faq.length);
    }
  });
});
