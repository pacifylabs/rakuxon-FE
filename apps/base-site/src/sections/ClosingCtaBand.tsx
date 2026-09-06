import { GraduationCap } from 'lucide-react';

import { CtaBand, SectionBand } from '@rakuxon/ui';

import { CLOSING_CTA } from '@/content/home';

/** docs/04b § 3.10 — the bold deep-indigo closing block. */
export function ClosingCtaBand() {
  return (
    <SectionBand tone="surface" id="get-started" labelledBy="closing-cta-heading">
      <CtaBand
        icon={GraduationCap}
        headingId="closing-cta-heading"
        heading={CLOSING_CTA.heading}
        subline={CLOSING_CTA.subline}
        cta={CLOSING_CTA.cta}
        reassurance={CLOSING_CTA.reassurance}
      />
    </SectionBand>
  );
}
