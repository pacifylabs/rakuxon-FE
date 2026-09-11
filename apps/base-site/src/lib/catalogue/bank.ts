import { emptyResult, isPublished } from './types';
import type {
  CatalogueResult,
  Course,
  InstitutionDetail,
  Provenance,
  Suggestion,
} from './types';

/**
 * The course bank.
 *
 * Replaces the provider that proxied a competitor's internal Next.js data
 * routes. That approach was withdrawn for three reasons, in rising order of
 * seriousness: the URLs embed their build id and 404 on every deploy of
 * theirs; their listings are a database we have no licence to republish; and
 * as long as the catalogue was theirs, nobody here could decide what a visitor
 * sees. Owning the records is what makes `status` mean anything.
 *
 * Reads from a local seed today and from the backend catalogue at stage 2c
 * (`10-catalogue-data.md`). The signatures do not change when it does, because
 * the shapes in types.ts are already the backend's contract.
 *
 * The seed is EXPLICITLY sample data. Institutions come from ROR, which is
 * real and CC0, but there is no open dataset of course fees and deadlines — so
 * these are illustrative and attached to illustrative institutions. They are
 * never attributed to a real university: a made-up deadline under a real name
 * is something a student would act on, and that is a different kind of wrong
 * from a placeholder.
 */

const SAMPLE: Provenance = {
  sourceId: 'sample',
  licence: 'Illustrative content authored for this build. Not a licensed dataset.',
  retrievedAt: '2026-09-07',
};

/** True while the bank is seed data, so the UI can say so rather than imply otherwise. */
export const BANK_IS_SAMPLE = true;

const money = (amount: number, currency = 'GBP') => ({ amount, currency });

export const INSTITUTIONS: readonly InstitutionDetail[] = [
  {
    id: 'inst-northfield',
    slug: 'northfield-university',
    name: 'Northfield University',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'Manchester',
    about:
      'A large civic university with a business school, an engineering faculty and a teaching hospital, drawing roughly a fifth of its postgraduate intake from outside the UK.',
    highlights: [
      'Postgraduate community drawn from more than 90 countries',
      'Guaranteed first-year accommodation for international students',
      'Careers service retained for two years after graduation',
    ],
    campuses: [{ name: 'City Campus', city: 'Manchester', countryCode: 'GB' }],
    requiredDocuments: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [
          { name: 'Undergraduate consolidated marksheets', minPercentage: 50 },
          { name: 'Undergraduate semester marksheets', minPercentage: 50 },
          { name: 'Undergraduate provisional certificate' },
          { name: 'Undergraduate graduation certificate' },
        ],
      },
      {
        id: 'english',
        label: 'English language tests',
        items: [{ name: 'IELTS, TOEFL or PTE score report' }],
      },
      { id: 'identity', label: 'Identity', items: [{ name: 'Passport biodata page' }] },
    ],
    employability:
      'Careers support covers CV review, mock interviews and the post-study work visa route.',
    faqs: [
      {
        question: 'Do I need a full degree certificate to apply?',
        answer:
          'No. A provisional certificate and your marksheets are enough to start; the final certificate is needed before enrolment.',
      },
      {
        question: 'Is there an application fee?',
        answer: 'Not for applications submitted through Rakuxon.',
      },
    ],
    qualityRatings: [{ scheme: 'Teaching Excellence Framework', level: 'Silver', year: 2023 }],
    englishTests: [
      { test: 'IELTS', minScore: '6.5 overall, 6.0 in each band' },
      { test: 'TOEFL', minScore: '88 overall' },
    ],
    upcomingIntake: { month: 'Sep', year: 2026, applicationDeadline: '2026-07-06', status: 'open' },
    tuitionFrom: money(17_500),
    fastTrackOffer: true,
    status: 'published',
    provenance: SAMPLE,
  },
  {
    id: 'inst-lakeside',
    slug: 'lakeside-institute',
    name: 'Lakeside Institute',
    country: 'Australia',
    countryCode: 'AU',
    city: 'Melbourne',
    about:
      'A specialist institute for health sciences and data, with a placement year built into most of its postgraduate programmes.',
    highlights: [
      'Placement year included in most postgraduate programmes',
      'Industry partnerships across health and analytics',
    ],
    campuses: [{ name: 'Docklands Campus', city: 'Melbourne', countryCode: 'AU' }],
    requiredDocuments: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [{ name: 'Undergraduate transcripts', minPercentage: 60 }],
      },
      {
        id: 'english',
        label: 'English language tests',
        items: [{ name: 'IELTS or PTE score report' }],
      },
    ],
    faqs: [
      {
        question: 'Is the placement year paid?',
        answer: 'Placements are arranged with partner employers and are usually paid.',
      },
    ],
    qualityRatings: [],
    englishTests: [{ test: 'IELTS', minScore: '6.5 overall' }],
    upcomingIntake: { month: 'Feb', year: 2027, applicationDeadline: '2026-11-30', status: 'open' },
    tuitionFrom: money(34_000, 'AUD'),
    fastTrackOffer: false,
    status: 'published',
    provenance: SAMPLE,
  },
];

export const COURSES: readonly Course[] = [
  {
    id: 'course-nf-mba',
    slug: 'mba-business-administration-northfield',
    title: 'MBA Business Administration',
    institutionId: 'inst-northfield',
    institutionSlug: 'northfield-university',
    institutionName: 'Northfield University',
    country: 'United Kingdom',
    countryCode: 'GB',
    campus: 'City Campus',
    level: 'postgraduate',
    disciplines: ['Business administration', 'Business'],
    durationMonths: 12,
    studyMode: 'full_time',
    tuition: { ...money(17_500), per: 'year', international: true },
    intakes: [
      { month: 'Sep', year: 2026, applicationDeadline: '2026-07-06', status: 'open' },
      { month: 'Jan', year: 2027, applicationDeadline: '2026-11-02', status: 'open' },
    ],
    entryRequirements: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [
          { name: 'Undergraduate consolidated marksheets', minPercentage: 50 },
          { name: 'Undergraduate graduation certificate' },
        ],
      },
      {
        id: 'professional',
        label: 'Professional records',
        items: [{ name: 'Two years of work experience', note: 'Preferred, not required' }],
      },
    ],
    englishTests: [
      { test: 'IELTS', minScore: '6.5 overall, 6.0 in each band' },
      { test: 'TOEFL', minScore: '88 overall' },
    ],
    scholarships: [
      { name: 'International merit award', amount: 3_000, currency: 'GBP', note: 'Applied automatically' },
    ],
    overview:
      'A general management degree for people moving into leadership. Core terms cover strategy, finance and operations; the final term is a consultancy project with a partner organisation.',
    highlights: [
      'Consultancy project with a partner organisation in the final term',
      'Taught by staff drawn from both business and academia',
      'Scholarship of GBP 3,000 applied automatically to eligible applicants',
    ],
    careers:
      'Graduates typically move into general management, consulting or operations roles.',
    offerResponseWeeks: 2,
    fastTrackOffer: true,
    status: 'published',
    provenance: SAMPLE,
  },
  {
    id: 'course-nf-entrepreneurship',
    slug: 'msc-entrepreneurship-and-innovation-northfield',
    title: 'MSc Entrepreneurship and Innovation',
    institutionId: 'inst-northfield',
    institutionSlug: 'northfield-university',
    institutionName: 'Northfield University',
    country: 'United Kingdom',
    countryCode: 'GB',
    campus: 'City Campus',
    level: 'postgraduate',
    disciplines: ['Business', 'Software design'],
    durationMonths: 12,
    studyMode: 'full_time',
    tuition: { ...money(17_500), per: 'year', international: true },
    intakes: [{ month: 'Sep', year: 2026, applicationDeadline: '2026-07-06', status: 'open' }],
    entryRequirements: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [{ name: 'Undergraduate transcripts', minPercentage: 50 }],
      },
    ],
    englishTests: [{ test: 'IELTS', minScore: '6.5 overall' }],
    scholarships: [],
    overview:
      'For founders and early-stage operators. The programme runs a venture from proposition to pitch, with legal, finance and product modules attached to that work rather than taught apart from it.',
    highlights: ['Build a venture across the year', 'Pitch to an investor panel in the final term'],
    offerResponseWeeks: 2,
    fastTrackOffer: true,
    status: 'published',
    provenance: SAMPLE,
  },
  {
    id: 'course-lk-data',
    slug: 'msc-data-analytics-lakeside',
    title: 'MSc Data Analytics and Technologies',
    institutionId: 'inst-lakeside',
    institutionSlug: 'lakeside-institute',
    institutionName: 'Lakeside Institute',
    country: 'Australia',
    countryCode: 'AU',
    campus: 'Docklands Campus',
    level: 'postgraduate',
    disciplines: ['Engineering and technology', 'Software design'],
    durationMonths: 18,
    studyMode: 'full_time',
    tuition: { ...money(34_000, 'AUD'), per: 'year', international: true },
    intakes: [{ month: 'Feb', year: 2027, applicationDeadline: '2026-11-30', status: 'open' }],
    entryRequirements: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [{ name: 'Undergraduate transcripts', minPercentage: 60 }],
      },
    ],
    englishTests: [{ test: 'IELTS', minScore: '6.5 overall' }],
    scholarships: [],
    overview:
      'Applied analytics with a placement year. The taught terms cover statistics, engineering and visualisation; the placement is arranged with a partner employer.',
    highlights: ['Placement year with a partner employer', 'Portfolio assessed instead of a thesis'],
    offerResponseWeeks: 3,
    fastTrackOffer: false,
    status: 'published',
    provenance: SAMPLE,
  },
  {
    id: 'course-nf-nursing',
    slug: 'bsc-adult-nursing-northfield',
    title: 'BSc Adult Nursing',
    institutionId: 'inst-northfield',
    institutionSlug: 'northfield-university',
    institutionName: 'Northfield University',
    country: 'United Kingdom',
    countryCode: 'GB',
    campus: 'City Campus',
    level: 'undergraduate',
    disciplines: ['Health care'],
    durationMonths: 36,
    studyMode: 'full_time',
    tuition: { ...money(15_200), per: 'year', international: true },
    intakes: [{ month: 'Sep', year: 2026, applicationDeadline: '2026-06-30', status: 'closing_soon' }],
    entryRequirements: [
      {
        id: 'academic',
        label: 'Academic certificates',
        items: [{ name: 'Secondary school certificate', minPercentage: 60 }],
      },
      { id: 'medical', label: 'Medical', items: [{ name: 'Immunisation record' }] },
    ],
    englishTests: [{ test: 'IELTS', minScore: '7.0 overall, 6.5 in each band' }],
    scholarships: [],
    overview:
      'A registered nursing degree with clinical placements from the first year, delivered with the university teaching hospital.',
    highlights: ['Clinical placements from year one', 'Leads to professional registration'],
    offerResponseWeeks: 4,
    fastTrackOffer: false,
    status: 'published',
    provenance: SAMPLE,
  },
];

/* ----------------------------------------------------------------- lookups */

const published = <T extends { status: 'draft' | 'published' | 'suspended' }>(rows: readonly T[]) =>
  rows.filter(isPublished);

export interface CourseQuery {
  q?: string;
  countryCode?: string;
  level?: string;
  discipline?: string;
  institutionSlug?: string;
}

const matches = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

export function findCourses(query: CourseQuery = {}): CatalogueResult<Course> {
  const { q = '', countryCode = '', level = '', discipline = '', institutionSlug = '' } = query;

  const items = published(COURSES).filter((course) => {
    if (countryCode && course.countryCode !== countryCode) return false;
    if (level && course.level !== level) return false;
    if (institutionSlug && course.institutionSlug !== institutionSlug) return false;
    if (discipline && !course.disciplines.some((entry) => matches(entry, discipline))) return false;
    if (q && !matches(course.title, q) && !matches(course.institutionName, q)) return false;
    return true;
  });

  return { items, total: items.length, source: 'bank' };
}

export function findCourseBySlug(slug: string): Course | undefined {
  return published(COURSES).find((course) => course.slug === slug);
}

export function findInstitutionBySlug(slug: string): InstitutionDetail | undefined {
  return published(INSTITUTIONS).find((institution) => institution.slug === slug);
}

export function listInstitutions(): CatalogueResult<InstitutionDetail> {
  const items = published(INSTITUTIONS);
  return { items, total: items.length, source: 'bank' };
}

/** Every discipline in the bank, for the subject filter chips. */
export const DISCIPLINES: readonly string[] = [
  ...new Set(published(COURSES).flatMap((course) => course.disciplines)),
].sort();

/**
 * Typeahead.
 *
 * Institutions first, then courses — someone typing a university name wants
 * the university, and burying it under four of its own courses is the common
 * way this control gets it wrong.
 */
export function suggest(q: string, limit = 8): CatalogueResult<Suggestion> {
  const query = q.trim();
  if (query.length < 2) return emptyResult('bank');

  const institutions: Suggestion[] = published(INSTITUTIONS)
    .filter((institution) => matches(institution.name, query))
    .map((institution) => ({
      type: 'institution' as const,
      id: institution.id,
      slug: institution.slug,
      title: institution.name,
      subtitle: [institution.city, institution.country].filter(Boolean).join(', '),
      countryCode: institution.countryCode,
      badges: badgesFor(institution),
    }));

  const courses: Suggestion[] = published(COURSES)
    .filter((course) => matches(course.title, query) || matches(course.institutionName, query))
    .map((course) => ({
      type: 'course' as const,
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: `${course.institutionName}, ${course.country}`,
      countryCode: course.countryCode,
    }));

  const items = [...institutions, ...courses].slice(0, limit);
  return { items, total: institutions.length + courses.length, source: 'bank' };
}

function badgesFor(institution: InstitutionDetail): string[] {
  const badges: string[] = [];
  if (institution.fastTrackOffer) badges.push('Fast-track offer');

  const award = COURSES.filter((course) => course.institutionId === institution.id)
    .flatMap((course) => course.scholarships)
    .find((scholarship) => scholarship.amount);

  if (award?.amount) {
    badges.push(`Scholarships up to ${award.currency} ${award.amount.toLocaleString('en-GB')}`);
  }

  return badges;
}
