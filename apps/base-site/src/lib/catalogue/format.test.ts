import { describe, expect, it } from 'vitest';

import { formatLocation } from './format';

describe('formatLocation', () => {
  it('joins a city to its country', () => {
    expect(formatLocation('Manchester', 'United Kingdom')).toBe('Manchester, United Kingdom');
  });

  it('does not print the same word twice', () => {
    // The registry's location name is sometimes the country, for institutions
    // with no single campus — which rendered as "Ireland, Ireland".
    expect(formatLocation('Ireland', 'Ireland')).toBe('Ireland');
  });

  it('ignores case and padding when comparing', () => {
    expect(formatLocation(' ireland ', 'Ireland')).toBe('Ireland');
  });

  it('falls back to the country when there is no city', () => {
    expect(formatLocation(null, 'Malta')).toBe('Malta');
    expect(formatLocation('   ', 'Malta')).toBe('Malta');
  });
});
