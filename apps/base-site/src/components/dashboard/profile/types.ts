import type { StudentProfile } from '@rakuxon/contract';

/** Every profile section shares this one update signature — one field, one value, at a time. */
export type UpdateProfileField = <K extends keyof StudentProfile>(
  key: K,
  value: StudentProfile[K],
) => void;
