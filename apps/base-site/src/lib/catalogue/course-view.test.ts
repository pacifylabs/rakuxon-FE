import { describe, expect, it } from 'vitest';

import type { ApiCourse, ApiCourseDetail } from './api';
import { COURSES } from './bank';
import {
  cardFacts,
  feeFromApi,
  formatFee,
  formatSubject,
  fromApiCourse,
  fromBankCourse,
} from './course-view';

/** An imported course as the API sends it: a title, a level, a subject, an approximate fee. */
const imported: ApiCourse = {
  id: 'c1',
  slug: 'msc-data-science-cardiff',
  title: 'MSc Data Science',
  level: 'postgraduate',
  studyMode: 'full_time',
  disciplines: ['data-sciences-and-big-data'],
  tuitionAmount: '24800.00',
  tuitionCurrency: 'GBP',
  tuitionIsEstimate: true,
  fastTrackOffer: false,
  intakes: [],
  institutionId: 'i1',
  institutionName: 'Cardiff University',
  institutionSlug: 'cardiff-university',
  country: 'United Kingdom',
  countryCode: 'GB',
};

const importedDetail: ApiCourseDetail = {
  ...imported,
  highlights: [],
  tuitionPeriod: 'year',
  entryRequirements: [],
  englishTests: [],
  scholarships: [],
};

describe('fees', () => {
  it('marks a fee the source calls approximate as approximate', () => {
    expect(formatFee(feeFromApi(imported)!)).toBe('approx. £ 24,800');
  });

  it('shows an exact fee as the figure alone', () => {
    expect(formatFee({ amount: 18000, currency: 'GBP', per: 'year', estimate: false })).toBe('£ 18,000');
  });

  it.each([
    ['no currency', { tuitionAmount: '24800.00', tuitionCurrency: undefined }],
    ['no amount', { tuitionAmount: undefined, tuitionCurrency: 'GBP' }],
    ['a zero amount', { tuitionAmount: '0', tuitionCurrency: 'GBP' }],
    ['a non-number', { tuitionAmount: 'None', tuitionCurrency: 'GBP' }],
  ])('drops a fee with %s rather than showing a wrong number', (_label, fields) => {
    expect(feeFromApi({ ...imported, ...fields })).toBeUndefined();
  });
});

describe('fromApiCourse', () => {
  it('leaves absent what the import does not carry', () => {
    const view = fromApiCourse(importedDetail);

    expect(view.durationMonths).toBeUndefined();
    expect(view.overview).toBeUndefined();
    expect(view.intakes).toEqual([]);
    expect(view.entryRequirements).toEqual([]);
  });

  it('does not present the database default as a stated study mode', () => {
    // Imported rows carry "full_time" because it is the column default.
    expect(fromApiCourse(importedDetail).studyMode).toBeUndefined();
  });

  it('treats a blank overview as no overview', () => {
    expect(fromApiCourse({ ...importedDetail, overview: '   ' }).overview).toBeUndefined();
  });
});

describe('fromBankCourse', () => {
  it('keeps everything a hand-written sample carries, with its exact fee', () => {
    const sample = COURSES[0]!;
    const view = fromBankCourse(sample);

    expect(view.intakes).toEqual(sample.intakes);
    expect(view.studyMode).toBe(sample.studyMode);
    expect(view.fee?.estimate).toBe(false);
    expect(view.durationMonths).toBe(sample.durationMonths);
  });
});

describe('cardFacts', () => {
  it('shows the facts an imported course holds, and no placeholders for the rest', () => {
    expect(cardFacts(imported)).toEqual([
      { label: 'Fee', value: 'approx. £ 24,800' },
      { label: 'Study level', value: 'Postgraduate' },
      { label: 'Subject', value: 'Data sciences and big data' },
    ]);
  });

  it('keeps the fee column even without a fee, since cards are compared by it', () => {
    const facts = cardFacts({ ...imported, tuitionAmount: undefined, disciplines: [] });
    expect(facts).toEqual([
      { label: 'Fee', value: 'Ask an advisor' },
      { label: 'Study level', value: 'Postgraduate' },
    ]);
  });

  it('leads with a known intake and duration for a fully described course, up to four', () => {
    const facts = cardFacts({
      ...imported,
      durationMonths: 12,
      intakes: [{ month: 'Sep', year: 2026, status: 'closing_soon' }],
    });

    expect(facts.map((fact) => fact.label)).toEqual(['Fee', 'Study level', 'Next intake', 'Duration']);
    expect(facts[2]).toMatchObject({ value: 'Sep 2026', urgent: true });
  });
});

describe('formatSubject', () => {
  it('turns a subject slug into words', () => {
    expect(formatSubject('data-sciences-and-big-data')).toBe('Data sciences and big data');
    expect(formatSubject('psychology')).toBe('Psychology');
  });
});
