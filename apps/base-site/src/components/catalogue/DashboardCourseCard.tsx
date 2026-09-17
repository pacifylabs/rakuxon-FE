'use client';

import { CourseCard } from '@rakuxon/ui';

import { applyHref, courseRoute } from '@/content/routes';
import { useApplyToCourse } from '@/lib/applications/useApplyToCourse';
import type { ApiCourse } from '@/lib/catalogue/api';
import { cardFacts } from '@/lib/catalogue/course-view';

/**
 * The dashboard-mode counterpart to a plain `CourseCard` — used where
 * `InstitutionDetail` (an async Server Component) renders a course card
 * directly rather than through `CourseBrowser`, so the client-side apply
 * call has to live in its own small client component instead.
 */
export function DashboardCourseCard({ course }: { course: ApiCourse }) {
  const { apply } = useApplyToCourse();

  return (
    <CourseCard
      title={course.title}
      institution={course.institutionName}
      countryCode={course.countryCode}
      href={courseRoute(course.slug)}
      applyHref={applyHref({ course: course.slug })}
      onApplyClick={() => apply(course)}
      badge={course.fastTrackOffer ? 'Fast-track offer' : undefined}
      facts={cardFacts(course)}
    />
  );
}
