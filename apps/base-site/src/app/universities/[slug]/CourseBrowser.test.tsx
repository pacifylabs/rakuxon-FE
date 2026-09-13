import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ApiCourse } from '@/lib/catalogue/api';

import { CourseBrowser } from './CourseBrowser';

const courses: ApiCourse[] = [
  {
    id: 'c1',
    slug: 'msc-advanced-data-science',
    title: 'MSc Advanced Data Science',
    level: 'postgraduate',
    studyMode: 'full_time',
    disciplines: ['data-sciences-and-big-data'],
    tuitionAmount: '30300.00',
    tuitionCurrency: 'GBP',
    tuitionIsEstimate: true,
    fastTrackOffer: false,
    intakes: [],
    institutionId: 'i1',
    institutionName: 'University of Exeter',
    institutionSlug: 'university-of-exeter',
    country: 'United Kingdom',
    countryCode: 'GB',
  },
  {
    id: 'c2',
    slug: 'ba-hons-geography',
    title: 'BA (Hons) Geography',
    level: 'undergraduate',
    studyMode: 'full_time',
    disciplines: [],
    fastTrackOffer: false,
    intakes: [],
    institutionId: 'i1',
    institutionName: 'University of Exeter',
    institutionSlug: 'university-of-exeter',
    country: 'United Kingdom',
    countryCode: 'GB',
  },
];

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('CourseBrowser', () => {
  it('opens on cards, the view the rest of the site uses', async () => {
    render(<CourseBrowser courses={courses} />);

    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');
    // The card carries both actions; a row does not.
    expect(screen.getAllByRole('link', { name: 'Proceed to apply' })).toHaveLength(2);
  });

  it('switches to rows, keeping the fee and the level on every course', async () => {
    render(<CourseBrowser courses={courses} />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));

    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('approx. £ 30,300')).toBeInTheDocument();
    expect(screen.getByText('Postgraduate · Data sciences and big data')).toBeInTheDocument();
  });

  it('says what it does not know rather than leaving the fee blank', async () => {
    render(<CourseBrowser courses={courses} />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));

    const row = screen.getByText('BA (Hons) Geography').closest('li');
    expect(within(row as HTMLElement).getByText('Ask an advisor')).toBeInTheDocument();
  });

  it('remembers the choice for the next university', async () => {
    // The preference is the visitor's, not the link's — someone who reads in
    // rows should get rows on the next page too, not only on this one.
    const { unmount } = render(<CourseBrowser courses={courses} />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    unmount();

    render(<CourseBrowser courses={courses} />);
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('falls back to cards when storage cannot be read', () => {
    // Private windows and blocked site data both throw on access, which must
    // not take the course list down with them.
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };

    try {
      render(<CourseBrowser courses={courses} />);
      expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');
    } finally {
      Storage.prototype.getItem = getItem;
    }
  });
});
