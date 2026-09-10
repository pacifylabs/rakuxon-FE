import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs, CtaBand, SectionBand } from '@rakuxon/ui';

import { SERVICES, SERVICES_CTA } from '@/content/services';
import { ROUTES, articleRoute, serviceRoute } from '@/content/routes';
import { fetchArticle } from '@/lib/catalogue/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ id: service.id }));
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const service = SERVICES.find((entry) => entry.id === id);
  if (!service) return {};

  return { title: service.metaTitle, description: service.metaDescription };
}

export default async function ServicePage({ params }: Params) {
  const { id } = await params;
  const service = SERVICES.find((entry) => entry.id === id);
  if (!service) notFound();

  /* The other services in the same strand — a visitor reading about visas is
     more likely to want applications next than a honeymoon package. */
  const related = SERVICES.filter(
    (entry) => entry.strand === service.strand && entry.id !== service.id,
  );

  /* Real guidance, not more service copy — fetched by slug rather than kept
     as a title/excerpt in services.ts, so an article edited or unpublished on
     the backend never goes stale here. Missing slugs (a typo, or an article
     that was later unpublished) are dropped rather than shown broken. */
  const relatedArticles = (
    await Promise.all((service.relatedArticleSlugs ?? []).map((slug) => fetchArticle(slug)))
  ).filter((article) => article !== null);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.description,
            provider: { '@type': 'Organization', name: 'Rakuxon' },
            areaServed: 'Worldwide',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: service.summary },
          }),
        }}
      />
      {service.faqs.length > 0 && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: service.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            }),
          }}
        />
      )}

      <SectionBand tone="muted" labelledBy="service-heading">
        <Breadcrumbs
          trail={[{ label: 'Services', href: ROUTES.services }]}
          current={service.title}
        />

        <div className="mt-6 flex items-start gap-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-accent-soft text-primary">
            <service.icon size={26} aria-hidden="true" focusable="false" />
          </span>
          <div>
            <h1
              id="service-heading"
              className="font-heading text-3xl font-bold leading-tight text-text md:text-4xl"
            >
              {service.title}
            </h1>
            <p className="mt-3 text-lg text-text-muted">{service.summary}</p>
          </div>
        </div>

        {/* Verbatim from rakuxon.com — the company's own description. */}
        <p className="mt-8 max-w-prose text-base text-text-muted">{service.description}</p>
      </SectionBand>

      <SectionBand labelledBy="service-included-heading">
        <h2
          id="service-included-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          What's included
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {service.whatsIncluded.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5"
            >
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              />
              <span className="text-base text-text-muted">{item}</span>
            </li>
          ))}
        </ul>
      </SectionBand>

      {relatedArticles.length > 0 && (
        <SectionBand tone="muted" labelledBy="service-guidance-heading">
          <h2
            id="service-guidance-heading"
            className="font-heading text-2xl font-bold text-text md:text-3xl"
          >
            Guidance worth reading first
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <li key={article.slug} className="h-full">
                <a
                  href={articleRoute(article.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="text-sm text-text-muted">
                    {article.readMinutes ? `${article.readMinutes} min read` : 'Guidance'}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-semibold text-text">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2 flex-1 text-sm text-text-muted">{article.excerpt}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      <SectionBand labelledBy="service-faq-heading">
        <h2
          id="service-faq-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Frequently asked questions
        </h2>
        <dl className="mt-8 flex max-w-prose flex-col gap-8">
          {service.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-heading text-lg font-semibold text-text">{faq.question}</dt>
              <dd className="mt-2 text-base text-text-muted">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionBand>

      {related.length > 0 && (
        <SectionBand tone="muted" labelledBy="related-services-heading">
          <h2
            id="related-services-heading"
            className="font-heading text-2xl font-bold text-text md:text-3xl"
          >
            {service.strand === 'education' ? 'Related services' : 'Also in travel and tourism'}
          </h2>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <li key={entry.id} className="h-full">
                <a
                  href={serviceRoute(entry.id)}
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-accent-soft text-primary">
                    <entry.icon size={20} aria-hidden="true" focusable="false" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-semibold text-text">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-base text-text-muted">{entry.summary}</p>
                </a>
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      <SectionBand tone="surface" labelledBy="service-cta-heading">
        <CtaBand
          headingId="service-cta-heading"
          heading={SERVICES_CTA.heading}
          subline={SERVICES_CTA.body}
          cta={{ label: SERVICES_CTA.ctaLabel, href: SERVICES_CTA.ctaHref }}
          reassurance={SERVICES_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
