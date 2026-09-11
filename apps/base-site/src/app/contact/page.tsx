import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

import { IconBubble, PageHeader, SectionBand } from '@rakuxon/ui';

import { CONTACT_HEADER, CONTACT_IMAGE, CONTACT_ROUTES } from '@/content/contact';
import { ROUTES } from '@/content/routes';
import { CONTACT_EMAIL } from '@/content/site';

import { ContactPanel } from './ContactPanel';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Rakuxon, whether you are a student, a recruitment partner, or an institution.',
  alternates: { canonical: ROUTES.contact },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={CONTACT_HEADER.eyebrow}
        title={CONTACT_HEADER.title}
        titleId="contact-heading"
        subcopy={CONTACT_HEADER.subcopy}
      />

      <SectionBand labelledBy="contact-form-heading">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2
              id="contact-form-heading"
              className="font-heading text-2xl font-bold text-text md:text-3xl"
            >
              Send us a message
            </h2>
            <p className="mt-4 max-w-prose text-base text-text-muted">
              We answer every message from a real person, usually within two working days.
            </p>

            <Suspense fallback={null}>
              <ContactPanel />
            </Suspense>
          </div>

          <div>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
              <Image
                src={CONTACT_IMAGE.src}
                alt={CONTACT_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <h3 className="mt-10 font-heading text-lg font-semibold text-text">
              Who you will reach
            </h3>
            <ul className="mt-6 flex flex-col gap-6">
              {CONTACT_ROUTES.map((route) => (
                <li key={route.title} className="flex items-start gap-4">
                  <IconBubble icon={route.icon} tone={route.tone} size="lg" />
                  <div>
                    <h4 className="font-heading text-base font-semibold text-text">
                      {route.title}
                    </h4>
                    <p className="mt-1 text-sm text-text-muted">{route.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-sm text-text-muted">
              Prefer email?{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </SectionBand>
    </>
  );
}
