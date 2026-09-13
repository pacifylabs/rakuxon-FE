import type { ApiInstitution } from './api';

/**
 * The facts a university card compares down a list.
 *
 * The course count only appears where we hold courses. It used to read "Ask an
 * advisor" at zero, which is not an answer to "how many courses": we hold
 * courses for 367 of 6,665 universities, and a card claiming an advisor knows
 * the number invents a service nobody offers. Leaving it out says the true
 * thing — we list this university, not its courses.
 */
export function institutionCardFacts(
  institution: Pick<ApiInstitution, 'courseCount' | 'country'>,
): { label: string; value: string }[] {
  return [
    ...(institution.courseCount > 0
      ? [{ label: 'Courses listed', value: institution.courseCount.toLocaleString('en-GB') }]
      : []),
    { label: 'Destination', value: institution.country },
  ];
}
