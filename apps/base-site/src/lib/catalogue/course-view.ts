import type { ApiCourse, ApiCourseDetail } from './api';
import { formatDuration, formatIntake, formatMoney } from './format';
import { STUDY_LEVEL_LABELS } from './types';
import type {
  Course,
  EnglishTest,
  Intake,
  RequirementGroup,
  Scholarship,
  StudyLevel,
  StudyMode,
} from './types';

/**
 * One shape for a course page, whichever source it came from.
 *
 * The catalogue holds two kinds of course: the hand-written samples, which
 * carry intakes, requirements and an exact fee, and forty thousand imported
 * ones, which carry a title, a level, subjects and often an approximate fee.
 * Rendering both from one shape — with the gaps as absences, not placeholders —
 * is what lets a page hide what it does not know instead of inventing it.
 */
export interface CourseView {
  slug: string;
  title: string;
  institutionName: string;
  institutionSlug: string;
  country: string;
  countryCode: string;
  level: StudyLevel;
  /** Only where the source states it. */
  studyMode?: StudyMode;
  disciplines: readonly string[];
  durationMonths?: number;
  fee?: CourseFee;
  overview?: string;
  highlights: readonly string[];
  careers?: string;
  campus?: string;
  intakes: readonly Intake[];
  entryRequirements: readonly RequirementGroup[];
  englishTests: readonly EnglishTest[];
  scholarships: readonly Scholarship[];
  offerResponseWeeks?: number;
  fastTrackOffer: boolean;
}

export interface CourseFee {
  amount: number;
  currency: string;
  per: 'year' | 'course';
  /** The source calls the figure approximate. */
  estimate: boolean;
}

/**
 * A fee from the API, or none. An amount only counts with its currency and a
 * positive value: "17500" on its own would render in whatever currency the
 * page defaulted to.
 */
export function feeFromApi(
  course: Pick<ApiCourse, 'tuitionAmount' | 'tuitionCurrency' | 'tuitionIsEstimate'>,
  per: 'year' | 'course' = 'year',
): CourseFee | undefined {
  const amount = Number(course.tuitionAmount);
  if (!course.tuitionAmount || !course.tuitionCurrency || !Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }
  return { amount, currency: course.tuitionCurrency.trim(), per, estimate: course.tuitionIsEstimate === true };
}

/** "approx. £ 17,500" where the source says approximate; the figure alone otherwise. */
export function formatFee(fee: CourseFee): string {
  const money = formatMoney({ amount: fee.amount, currency: fee.currency });
  return fee.estimate ? `approx. ${money}` : money;
}

/** "data-sciences-and-big-data" -> "Data sciences and big data". */
export function formatSubject(slug: string): string {
  const words = slug.split('-').filter(Boolean).join(' ');
  return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : slug;
}

/** The soonest intake still open. */
export const firstOpenIntake = (intakes: readonly Intake[]): Intake | undefined =>
  intakes.find((intake) => intake.status !== 'closed');

export function fromApiCourse(course: ApiCourseDetail): CourseView {
  return {
    slug: course.slug,
    title: course.title,
    institutionName: course.institutionName,
    institutionSlug: course.institutionSlug,
    country: course.country,
    countryCode: course.countryCode,
    level: course.level,
    /* Left out on purpose. Imported rows carry the column's default, not a
       sourced mode, and a stated "full-time" that is really a default is a
       claim nobody can stand behind. */
    studyMode: undefined,
    disciplines: course.disciplines,
    durationMonths: course.durationMonths ?? undefined,
    fee: feeFromApi(course, course.tuitionPeriod),
    overview: course.overview?.trim() || undefined,
    highlights: course.highlights ?? [],
    careers: course.careers,
    campus: course.campus,
    intakes: course.intakes ?? [],
    entryRequirements: course.entryRequirements ?? [],
    englishTests: course.englishTests ?? [],
    scholarships: course.scholarships ?? [],
    offerResponseWeeks: course.offerResponseWeeks,
    fastTrackOffer: course.fastTrackOffer,
  };
}

export function fromBankCourse(course: Course): CourseView {
  return {
    slug: course.slug,
    title: course.title,
    institutionName: course.institutionName,
    institutionSlug: course.institutionSlug,
    country: course.country,
    countryCode: course.countryCode,
    level: course.level,
    studyMode: course.studyMode,
    disciplines: course.disciplines,
    durationMonths: course.durationMonths,
    fee: {
      amount: course.tuition.amount,
      currency: course.tuition.currency,
      per: course.tuition.per,
      estimate: false,
    },
    overview: course.overview,
    highlights: course.highlights,
    careers: course.careers,
    campus: course.campus,
    intakes: course.intakes,
    entryRequirements: course.entryRequirements,
    englishTests: course.englishTests,
    scholarships: course.scholarships,
    offerResponseWeeks: course.offerResponseWeeks,
    fastTrackOffer: course.fastTrackOffer,
  };
}

/**
 * Up to four facts a course card compares down a list — only ones the record
 * holds.
 *
 * The fee always shows, even as "Ask an advisor": it is the column a visitor
 * scans across cards. Everything else is left out when unknown, so an imported
 * course shows three real facts rather than four padded with placeholders — a
 * card of "Ask an advisor" says nothing except that the record is thin.
 */
export function cardFacts(course: ApiCourse): { label: string; value: string; urgent?: boolean }[] {
  const fee = feeFromApi(course);
  const intake = firstOpenIntake(course.intakes ?? []);
  const subject = course.disciplines[0];

  const facts: { label: string; value: string; urgent?: boolean }[] = [
    { label: 'Fee', value: fee ? formatFee(fee) : 'Ask an advisor' },
    { label: 'Study level', value: STUDY_LEVEL_LABELS[course.level] },
  ];
  if (intake) {
    facts.push({ label: 'Next intake', value: formatIntake(intake), urgent: intake.status === 'closing_soon' });
  }
  if (course.durationMonths) facts.push({ label: 'Duration', value: formatDuration(course.durationMonths) });
  if (subject) facts.push({ label: 'Subject', value: formatSubject(subject) });

  return facts.slice(0, 4);
}
