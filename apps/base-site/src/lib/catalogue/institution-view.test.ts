import { describe, expect, it } from 'vitest';
import { institutionCardFacts } from './institution-view';
describe('institutionCardFacts', () => {
  it('shows the count where we hold courses', () => {
    expect(institutionCardFacts({ courseCount: 915 }).map(fact => fact.text)).toEqual(['915 courses']);
  });
  it('omits unavailable facts rather than inventing an advisor service', () => {
    expect(institutionCardFacts({ courseCount: 0 })).toEqual([]);
  });
  it('shows sourced founding and student facts', () => {
    expect(institutionCardFacts({ courseCount: 1, foundedYear: 1900, studentCount: 1500 }).map(fact => fact.text))
      .toEqual(['Founded 1900', '1,500 students', '1 course']);
  });
});
