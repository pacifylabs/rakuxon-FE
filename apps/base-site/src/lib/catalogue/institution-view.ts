import { BookOpen, CalendarDays, Users } from 'lucide-react';

import type { InstitutionCardFact } from '@rakuxon/ui';

import type { ApiInstitution } from './api';

/**
 * Facts an `InstitutionCard` can actually back up, picked in order of how
 * much they say about the place. "Courses listed" only counts when there is
 * a real number behind it — imported records almost never have one yet, and
 * "Ask an advisor" repeated across every card in a grid reads as the page
 * being empty rather than as an invitation.
 *
 * No destination fallback: the flag and city above the facts already say
 * the country, and a chip repeating it adds a line without adding a fact.
 * A card with none of these is left with just the header, which is honest
 * about what the record actually holds.
 */
export function institutionCardFacts(institution: Pick<ApiInstitution, 'courseCount' | 'foundedYear' | 'studentCount'>): InstitutionCardFact[] {
  const facts: InstitutionCardFact[] = [];

  if (institution.foundedYear) {
    facts.push({ icon: CalendarDays, text: `Founded ${institution.foundedYear}` });
  }
  if (institution.studentCount) {
    facts.push({ icon: Users, text: `${institution.studentCount.toLocaleString('en-GB')} students` });
  }
  if (institution.courseCount > 0) {
    facts.push({
      icon: BookOpen,
      text: `${institution.courseCount} course${institution.courseCount === 1 ? '' : 's'}`,
    });
  }

  return facts;
}
