import { LogoBar } from '@rakuxon/ui';

import { TRUST_BAR } from '@/content/home';

/**
 * docs/04b § 3.2 — the white card straddling the hero and the section beneath.
 * The negative margin is what makes it overlap.
 */
export function TrustLogoBar() {
  return (
    <div className="w-full px-5">
      <div className="mx-auto -mt-12 w-full max-w-content">
        <LogoBar label={TRUST_BAR.label} logos={TRUST_BAR.logos} />
      </div>
    </div>
  );
}
