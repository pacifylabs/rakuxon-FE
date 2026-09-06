import Image from 'next/image';
import { CirclePlay, GraduationCap, PiggyBank } from 'lucide-react';

import { HeroSearch } from './HeroSearch';
import {
  AvatarStack,
  Button,
  EyebrowPill,
  HeroFloatingCard,
  IconBubble,
  ProgressRing,
} from '@rakuxon/ui';

import {
  HERO,
  HERO_AVATARS,
  HERO_DEADLINE_CARD,
  HERO_FIGURE,
  HERO_MATCH_CARD,
} from '@/content/home';

/** docs/04b § 3.1 — two-column hero with floating live-data cards. */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-heading" className="w-full bg-bg px-5 pb-20 pt-12 md:pt-16">
      {/*
        Columns stretch: a centred media column left a gap above and below the
        figure whenever the copy ran taller, which read as a misalignment.
      */}
      <div className="mx-auto grid w-full max-w-content gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
        <div className="flex flex-col justify-center">
          <EyebrowPill>{HERO.eyebrow}</EyebrowPill>

          <h1
            id="hero-heading"
            className="mt-6 font-heading text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-hero"
          >
            {HERO.headlineLine1}
            <span className="block text-primary">{HERO.headlineLine2}</span>
          </h1>

          <p className="mt-6 max-w-prose text-lg text-text-muted">{HERO.subcopy}</p>

          {/* Search is the primary action on this page, so it sits above the CTAs. */}
          <div className="mt-8">
            <HeroSearch />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={HERO.primaryCta.href} size="lg">
              {HERO.primaryCta.label}
            </Button>
            <Button href={HERO.secondaryCta.href} size="lg" variant="ghost">
              <CirclePlay size={20} strokeWidth={2} aria-hidden="true" focusable="false" />
              {HERO.secondaryCta.label}
            </Button>
          </div>

          <AvatarStack className="mt-8" avatars={HERO_AVATARS} caption={HERO.socialProof} />
        </div>

        {/*
          `lg:flex` only. Making this a flex container at every width laid the
          figure and both floating cards out in a row on mobile, where the
          cards are still in normal flow.
        */}
        <div className="relative lg:flex">
          {/* Soft tinted blob behind the figure — CSS, not an image (§ 3.1). */}
          {/*
            Desktop only. Below lg the floating cards sit in normal flow, and an
            absolutely positioned sibling paints over them — which tinted the
            white cards and dropped their text below the contrast threshold.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 bottom-12 top-4 hidden rounded-full bg-accent-soft blur-xl lg:block"
          />

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-media">
            <Image
              src={HERO_FIGURE.src}
              alt={HERO_FIGURE.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/*
            Floating UI. Static and illustrative — `sample` marks both cards in
            the DOM and for screen readers (§ 3.1).
          */}
          <HeroFloatingCard
            title={HERO_MATCH_CARD.title}
            action={HERO_MATCH_CARD.action}
            sample
            className="mt-4 lg:absolute lg:-right-4 lg:top-6 lg:mt-0 lg:w-card-float"
          >
            <div className="flex items-center gap-3">
              <ProgressRing value={HERO_MATCH_CARD.score} />
              <p className="text-sm font-semibold text-text">{HERO_MATCH_CARD.verdict}</p>
            </div>
          </HeroFloatingCard>

          <HeroFloatingCard
            title={HERO_DEADLINE_CARD.title}
            action={HERO_DEADLINE_CARD.action}
            sample
            className="mt-4 lg:absolute lg:-left-6 lg:bottom-10 lg:mt-0 lg:w-card-float"
          >
            {/* The urgent tint is reserved for time pressure; a countdown is exactly that. */}
            <p className="font-heading text-2xl font-bold text-tint-urgent">
              {HERO_DEADLINE_CARD.countdown}
            </p>
            <p className="mt-1 text-sm text-text-muted">{HERO_DEADLINE_CARD.university}</p>
          </HeroFloatingCard>

          {/* Two decorative bubbles overlapping the figure (§ 3.1). */}
          <IconBubble
            icon={GraduationCap}
            size="lg"
            className="absolute left-4 top-4 hidden shadow-md lg:grid"
          />
          <IconBubble
            icon={PiggyBank}
            size="lg"
            className="absolute right-6 bottom-6 hidden shadow-md lg:grid"
          />
        </div>
      </div>
    </section>
  );
}
