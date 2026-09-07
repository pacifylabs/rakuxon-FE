import { CirclePlay } from 'lucide-react';

import { AvatarStack, Button, LogoBar } from '@rakuxon/ui';

import { HERO, HERO_AVATARS, TRUST_BAR } from '@/content/home';

import { HeroBackdrop } from './HeroBackdrop';
import { HeroSearch } from './HeroSearch';

/** Full-viewport hero: copy, search, then the trust bar pinned to the bottom. */
export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-screen w-full flex-col px-5 pb-16 pt-12 md:pb-20 md:pt-16"
    >
      {/* The hero draws the map at full strength; the layout's page-wide copy
          sits behind it at 40%. */}
      <HeroBackdrop />

      <div className="mx-auto flex w-full max-w-content flex-1 flex-col items-center justify-center text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {HERO.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-[18ch] font-heading text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-hero"
        >
          {HERO.headlineLine1}
          <span className="relative block text-primary">
            {HERO.headlineLine2}
            {/* Hand-drawn underline: the one flourish, and it tracks the text. */}
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="absolute inset-x-0 -bottom-1 h-2.5 w-full text-accent"
            >
              <path
                d="M2 8C60 3 130 2 190 5c40 2 80 3 108 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-prose text-lg text-text-muted">{HERO.subcopy}</p>

        <div className="mt-8 w-full">
          <HeroSearch />
        </div>

        {/* The consultancy's span in three beats — what the six services add up to. */}
        <ol className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-text-muted">
          {HERO.journey.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-border">
                  →
                </span>
              )}
              <span className="rounded-full border border-border bg-surface/70 px-3 py-1">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={HERO.primaryCta.href} size="lg">
            {HERO.primaryCta.label}
          </Button>
          <Button href={HERO.secondaryCta.href} size="lg" variant="ghost">
            <CirclePlay size={20} strokeWidth={2} aria-hidden="true" focusable="false" />
            {HERO.secondaryCta.label}
          </Button>
        </div>

        <AvatarStack className="mt-10" avatars={HERO_AVATARS} caption={HERO.socialProof} />
      </div>

      <div className="mx-auto mt-10 w-full max-w-content md:mt-12">
        <LogoBar label={TRUST_BAR.label} logos={TRUST_BAR.logos} />
      </div>
    </section>
  );
}
