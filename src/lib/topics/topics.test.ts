import { describe, it, expect } from 'vitest';
import { allTopics, findTopic, topicForMode, topicPath, TOPICS } from './index';

describe('topic pages', () => {
  it('have unique paths and a page for every module section', () => {
    const paths = allTopics().map(topicPath);
    expect(new Set(paths).size).toBe(paths.length);
    for (const mode of ['generator', 'sine', 'load', 'threephase'])
      expect(topicForMode('ac', mode)).toBeDefined();
    for (const mode of ['ohm', 'network', 'divider', 'thevenin', 'mesh'])
      expect(topicForMode('circuits', mode)).toBeDefined();
    expect(findTopic('ac', 'three-phase')?.mode).toBe('threephase');
    expect(findTopic('ac', 'nope')).toBeUndefined();
  });

  it('keep the Thai article the same shape as the English one', () => {
    for (const t of allTopics()) {
      const { en, th } = t.text;
      const where = topicPath(t);
      expect(th.sections.length, `${where} sections`).toBe(en.sections.length);
      en.sections.forEach((s, i) => {
        expect(th.sections[i].body.length, `${where} §${i} body`).toBe(s.body.length);
        expect(th.sections[i].formulas?.length, `${where} §${i} formulas`).toBe(s.formulas?.length);
        expect(th.sections[i].bullets?.length, `${where} §${i} bullets`).toBe(s.bullets?.length);
      });
      expect(th.example.steps.length, `${where} example`).toBe(en.example.steps.length);
      expect(th.mistakes.length, `${where} mistakes`).toBe(en.mistakes.length);
      expect(th.faq.length, `${where} faq`).toBe(en.faq.length);
    }
  });

  it('fit search results: titles ≤ 60 characters, descriptions 120–170', () => {
    for (const t of allTopics()) {
      expect(t.seo.title.length, t.seo.title).toBeLessThanOrEqual(60);
      expect(t.seo.description.length, t.seo.description).toBeGreaterThanOrEqual(120);
      expect(t.seo.description.length, t.seo.description).toBeLessThanOrEqual(170);
    }
  });

  it('cover both DC and AC modules', () => {
    expect(TOPICS.ac.length).toBe(4);
    expect(TOPICS.circuits.length).toBe(5);
  });
});
