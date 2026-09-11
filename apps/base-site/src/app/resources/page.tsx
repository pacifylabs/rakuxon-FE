import type { Metadata } from 'next';

import { CtaBand, PageHeader, SectionBand } from '@rakuxon/ui';

import { RESOURCES_CTA, RESOURCES_HEADER } from '@/content/resources';
import { fetchArticles, fetchCountries } from '@/lib/catalogue/api';

import { ResourceBrowser } from './ResourceBrowser';

/* Revalidated rather than static: publishing an article should show up here
   without a redeploy. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Guidance',
  description:
    'Practical guidance on choosing a university, writing an application and meeting visa requirements, written by advisors and sourced to the authorities that set the rules.',
};

type Search = Promise<Record<string, string | string[] | undefined>>;

const asString = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

export default async function ResourcesPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const tag = asString(params.tag);
  const country = asString(params.country).toUpperCase();
  const page = Number(asString(params.page)) || 1;

  /* In parallel: the destination chips do not depend on the results. */
  const [result, countries] = await Promise.all([
    fetchArticles({ tag, country, page, limit: 12 }),
    fetchCountries(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={RESOURCES_HEADER.eyebrow}
        title={RESOURCES_HEADER.title}
        titleId="resources-heading"
        subcopy={RESOURCES_HEADER.subcopy}
      />

      <SectionBand labelledBy="resources-browse-heading">
        <h2 id="resources-browse-heading" className="sr-only">
          Browse guidance
        </h2>
        <ResourceBrowser
          items={result.items}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          tags={result.tags}
          countries={countries}
          tag={tag}
          country={country}
          error={result.error}
        />
      </SectionBand>

      <SectionBand tone="surface" labelledBy="resources-cta-heading">
        <CtaBand
          headingId="resources-cta-heading"
          heading={RESOURCES_CTA.heading}
          subline={RESOURCES_CTA.subline}
          cta={RESOURCES_CTA.cta}
          reassurance={RESOURCES_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
