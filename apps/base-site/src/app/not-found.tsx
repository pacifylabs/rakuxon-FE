import { PageHeader, SectionBand } from '@rakuxon/ui';

import { NAV_LINKS } from '@/content/site';
import { ROUTES } from '@/content/routes';

/** Honest dead end that offers the routes that do exist. */
export default function NotFound() {
  const destinations = [
    { label: 'Home', href: ROUTES.home },
    ...NAV_LINKS,
    { label: 'Contact', href: ROUTES.contact },
  ];

  return (
    <>
      <PageHeader
        eyebrow="404"
        title="We could not find that page"
        titleId="not-found-heading"
        subcopy="The link may be out of date, or the page may have moved. Here is everything else."
      />

      <SectionBand labelledBy="not-found-links-heading">
        <h2
          id="not-found-links-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Try one of these
        </h2>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <li key={destination.href}>
              <a
                href={destination.href}
                className="block rounded-lg border border-border bg-surface p-5 text-base font-semibold text-primary shadow-sm transition-shadow duration-base ease-standard hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {destination.label}
              </a>
            </li>
          ))}
        </ul>
      </SectionBand>
    </>
  );
}
