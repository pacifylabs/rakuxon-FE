import type { Metadata } from 'next';

import { CtaBand, SectionBand } from '@rakuxon/ui';

import { SERVICES_CTA, SERVICES_HERO, resolveServiceIcon } from '@/content/services';
import { ROUTES, serviceRoute } from '@/content/routes';
import { fetchServices } from '@/lib/services/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Free educational consultancy, university applications, visa support, travel, pre-departure and ongoing support: the six services Rakuxon Ltd has run for eleven years.',
  alternates: { canonical: ROUTES.services },
};

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <>
      <SectionBand tone="muted" labelledBy="services-heading">
        <div className="mx-auto max-w-prose text-center">
          <p className="inline-flex items-center rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {SERVICES_HERO.eyebrow}
          </p>
          <h1
            id="services-heading"
            className="mt-6 font-heading text-3xl font-bold leading-tight text-text md:text-4xl"
          >
            {SERVICES_HERO.title}
          </h1>
          <p className="mt-6 text-lg text-text-muted">{SERVICES_HERO.subcopy}</p>
        </div>

        {services.length > 0 ? (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = resolveServiceIcon(service.iconName);
              return (
                <li key={service.id} className="h-full">
                  <a
                    href={serviceRoute(service.slug)}
                    className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-md bg-accent-soft text-primary">
                      <Icon size={20} aria-hidden="true" focusable="false" />
                    </span>
                    <h2 className="mt-5 font-heading text-lg font-semibold text-text">
                      {service.title}
                    </h2>
                    <p className="mt-2 flex-1 text-base text-text-muted">{service.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Learn more
                      <span aria-hidden="true">→</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-12 text-center text-base text-text-muted">
            Our services are being updated. Please check back shortly, or get in touch directly.
          </p>
        )}
      </SectionBand>

      <SectionBand tone="surface" labelledBy="services-cta-heading">
        <CtaBand
          headingId="services-cta-heading"
          heading={SERVICES_CTA.heading}
          subline={SERVICES_CTA.body}
          cta={{ label: SERVICES_CTA.ctaLabel, href: SERVICES_CTA.ctaHref }}
          reassurance={SERVICES_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
