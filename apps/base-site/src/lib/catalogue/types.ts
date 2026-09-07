/**
 * The catalogue contract.
 *
 * Rich enough to drive a full course page — fees, intakes, deadlines, grouped
 * entry requirements, English bands, scholarships — because a thin listing is
 * not a reason for anyone to apply through us.
 *
 * These shapes are ours. They were designed by looking at what a study-abroad
 * course page has to answer, not by copying a competitor's payload, and no
 * competitor's vocabulary survives in them: what one rival brands "Express
 * Offer" is `fastTrackOffer` here, because a product feature name is theirs and
 * the concept is not.
 *
 * Every provider maps into these, so the UI never sees a source's own payload.
 * When the backend catalogue lands (`10-catalogue-data.md`), only the provider
 * changes — these types and every component stay put.
 */

/* ------------------------------------------------------------- provenance */

/**
 * Where a record came from and under what terms.
 *
 * Carried on every record rather than tracked in a spreadsheet: a licence
 * question two years from now has to be answerable for one row, not for a
 * source in general.
 */
export interface Provenance {
  sourceId: string;
  /** The id in that source, which is what a re-run matches on. */
  sourceRecordId?: string;
  sourceUrl?: string;
  /** The licence in force when the record was ingested, verbatim. */
  licence: string;
  retrievedAt: string;
}

/**
 * The admin's switch.
 *
 * Owning the data is what makes this possible: a record can be pulled from
 * public view without asking anyone, and nothing outside our own database
 * decides what a visitor sees. Only `published` ever reaches a page.
 */
export type PublishStatus = 'draft' | 'published' | 'suspended';

/* ------------------------------------------------------------ value types */

export interface Money {
  amount: number;
  /** ISO 4217. Stored, never assumed — a fee shown in the wrong currency is a lie. */
  currency: string;
}

export interface Intake {
  /** Short month name, e.g. "Sep". */
  month: string;
  year: number;
  /** ISO date. Absent means the institution has not published one yet. */
  applicationDeadline?: string;
  status: 'open' | 'closing_soon' | 'closed';
}

export interface RequirementItem {
  name: string;
  /** Minimum percentage, where the institution states one. */
  minPercentage?: number;
  note?: string;
}

/** Requirements arrive grouped, because that is how an applicant gathers them. */
export interface RequirementGroup {
  id: string;
  label: string;
  items: readonly RequirementItem[];
}

export interface EnglishTest {
  test: 'IELTS' | 'TOEFL' | 'PTE' | 'Duolingo';
  minScore: string;
}

export interface Scholarship {
  name: string;
  amount?: Money;
  note?: string;
}

export type StudyLevel = 'foundation' | 'undergraduate' | 'postgraduate' | 'research';
export type StudyMode = 'full_time' | 'part_time' | 'online' | 'hybrid';

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  foundation: 'Foundation',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  research: 'Research',
};

export const STUDY_MODE_LABELS: Record<StudyMode, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  online: 'Online',
  hybrid: 'Hybrid',
};

/* ----------------------------------------------------------- institutions */

export interface Institution {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  city?: string;
  website?: string;
}

export interface Campus {
  name: string;
  city: string;
  countryCode: string;
}

/** A published quality rating, named by its scheme so it is never ours. */
export interface QualityRating {
  scheme: string;
  level: string;
  year: number;
}

export interface InstitutionDetail extends Institution {
  about: string;
  highlights: readonly string[];
  campuses: readonly Campus[];
  requiredDocuments: readonly RequirementGroup[];
  employability?: string;
  faqs: readonly { question: string; answer: string }[];
  qualityRatings: readonly QualityRating[];
  englishTests: readonly EnglishTest[];
  upcomingIntake?: Intake;
  tuitionFrom?: Money;
  /** A partner that returns decisions quickly. Our term, deliberately. */
  fastTrackOffer: boolean;
  logoUrl?: string;
  heroImageUrl?: string;
  status: PublishStatus;
  provenance: Provenance;
}

/* ---------------------------------------------------------------- courses */

export interface Course {
  id: string;
  slug: string;
  title: string;
  institutionId: string;
  institutionSlug: string;
  institutionName: string;
  country: string;
  countryCode: string;
  campus?: string;
  level: StudyLevel;
  disciplines: readonly string[];
  durationMonths: number;
  studyMode: StudyMode;
  tuition: Money & { per: 'year' | 'course'; international: boolean };
  intakes: readonly Intake[];
  entryRequirements: readonly RequirementGroup[];
  englishTests: readonly EnglishTest[];
  scholarships: readonly Scholarship[];
  overview: string;
  highlights: readonly string[];
  careers?: string;
  /** Weeks to a decision, where the institution commits to one. */
  offerResponseWeeks?: number;
  fastTrackOffer: boolean;
  status: PublishStatus;
  provenance: Provenance;
}

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  url?: string;
  publishedAt?: string;
  readMinutes?: number;
}

export interface CountryCount {
  country: string;
  countryCode: string;
  institutions: number;
}

/* ----------------------------------------------------------------- search */

export interface Suggestion {
  type: 'institution' | 'course';
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  countryCode?: string;
  /** Short incentives — "Scholarships up to GBP 3,000", "IELTS waiver". */
  badges?: readonly string[];
}

/* ---------------------------------------------------------------- results */

/**
 * Providers never throw at the page. A marketing page must render when a
 * source is slow or down, so failures come back as data.
 */
export interface CatalogueResult<T> {
  items: readonly T[];
  total: number;
  /** Present when the source failed or returned nothing usable. */
  error?: string;
  /** Which provider answered, so the UI can be honest about provenance. */
  source: 'ror' | 'bank' | 'unavailable';
}

export const emptyResult = <T>(source: CatalogueResult<T>['source'], error?: string) =>
  ({ items: [], total: 0, error, source }) satisfies CatalogueResult<T>;

/** Only published records ever reach a page. The admin's toggle, enforced once. */
export const isPublished = <T extends { status: PublishStatus }>(record: T) =>
  record.status === 'published';
