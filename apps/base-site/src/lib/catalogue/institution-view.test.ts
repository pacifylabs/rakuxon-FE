import { describe, expect, it } from 'vitest';

import { institutionCardFacts } from './institution-view';

describe('institutionCardFacts', () => {
  it('shows the count where we hold courses', () => {
    expect(institutionCardFacts({ courseCount: 915, country: 'Australia' })).toEqual([
      { label: 'Courses listed', value: '915' },
      { label: 'Destination', value: 'Australia' },
    ]);
  });

  it('omits the count rather than promising an advisor knows it', () => {
    // We hold courses for 367 of 6,665 universities. "Ask an advisor" under
    // "Courses listed" answered a different question than the one asked.
    expect(institutionCardFacts({ courseCount: 0, country: 'United States' })).toEqual([
      { label: 'Destination', value: 'United States' },
    ]);
  });
});
