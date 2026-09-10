import type { StudentProfile } from '@rakuxon/contract';

/** What admission processing needs — mirrors the backend's completion gate. */
const REQUIRED_FIELDS: (keyof StudentProfile)[] = [
  'dateOfBirth',
  'nationality',
  'phone',
  'intendedStudyLevel',
  'intendedCountry',
  'preferredIntake',
];

export function profileCompleteness(profile: StudentProfile): number {
  const total = REQUIRED_FIELDS.length + 1; // +1 for education history
  const done =
    REQUIRED_FIELDS.filter((field) => Boolean(profile[field])).length +
    (profile.educationHistory.length > 0 ? 1 : 0);
  return Math.round((done / total) * 100);
}
