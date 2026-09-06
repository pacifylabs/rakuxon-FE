import { PageHeader, SectionBand } from '@rakuxon/ui';

import type { LegalPageContent } from '@/content/legal';

/**
 * Renders a legal page's structure with every section body clearly marked as
 * awaiting legal review. Deliberately not written as prose: a document that
 * reads like a policy but was drafted by nobody is worse than an honest gap.
 */
export function LegalPage({ content, titleId }: { content: LegalPageContent; titleId: string }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={content.title} titleId={titleId} subcopy={content.intro} />

      <SectionBand labelledBy={`${titleId}-sections`}>
        <h2 id={`${titleId}-sections`} className="sr-only">
          {content.title} sections
        </h2>

        <div
          data-placeholder="true"
          role="note"
          className="rounded-lg border border-warning bg-surface p-6"
        >
          <p className="font-heading text-lg font-semibold text-text">
            Awaiting legal review — this is not a published document
          </p>
          <p className="mt-3 max-w-prose text-base text-text-muted">
            Nothing on this page is binding, and it should not be relied on. Each heading below
            records what the finished document must cover.{' '}
            <a
              href={content.contactHref}
              className="rounded-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              Contact us
            </a>{' '}
            with any question about how we handle your data in the meantime.
          </p>
        </div>

        <ol className="mt-10 flex flex-col gap-6">
          {content.sections.map((section, index) => (
            <li
              key={section.heading}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm"
            >
              <h3 className="font-heading text-lg font-semibold text-text">
                {index + 1}. {section.heading}
              </h3>
              <p className="mt-3 max-w-prose text-sm text-text-muted">
                <span className="font-semibold text-text">To be drafted: </span>
                {section.brief}
              </p>
            </li>
          ))}
        </ol>
      </SectionBand>
    </>
  );
}
