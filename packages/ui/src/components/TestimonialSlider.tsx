'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TestimonialCard } from './TestimonialCard';

export interface SliderTestimonial {
  quote: string;
  name: string;
  detail: string;
  /** Optional: a real named client with no photograph renders initials. */
  src?: string;
  alt?: string;
}

export interface TestimonialSliderProps {
  testimonials: readonly SliderTestimonial[];
  /** Milliseconds between advances. */
  interval?: number;
  /** Marks the quotes as illustrative in the markup, without a visible caveat. */
  sample?: boolean;
  className?: string;
}

/**
 * Testimonial slider, three cards wide on desktop.
 *
 * Built on a scroll-snap container rather than a transform carousel, matching
 * the pattern used in the TrustBridge project. The browser does the work: it
 * swipes on touch, drags on a trackpad, scrolls with a wheel, and every quote
 * stays in the document in reading order and in the accessibility tree,
 * on-screen or not. A transform carousel has to reimplement all of that and
 * usually hides its off-screen slides.
 *
 * It advances on its own and stops the moment anyone engages: on hover, on
 * keyboard focus, while the tab is hidden, and permanently under
 * prefers-reduced-motion. WCAG 2.2.2 wants moving content to be pausable.
 */
export function TestimonialSlider({
  testimonials,
  interval = 5000,
  sample = false,
  className,
}: TestimonialSliderProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  /** The active card is whichever sits nearest the centre of the track. */
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const middle = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;

    for (const [index, child] of [...track.children].entries()) {
      const card = child as HTMLElement;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    }

    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [syncActive]);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;

    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;

    // Element.scrollTo is not universal; assigning scrollLeft keeps the
    // control working rather than throwing where it is missing.
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: 'smooth' });
    } else {
      track.scrollLeft = left;
    }

    setActive(index);
  }, []);

  useEffect(() => {
    if (paused || testimonials.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % testimonials.length;
        const track = trackRef.current;
        const card = track?.children[next] as HTMLElement | undefined;

        if (track && card) {
          const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
          if (typeof track.scrollTo === 'function') {
            track.scrollTo({ left, behavior: 'smooth' });
          } else {
            track.scrollLeft = left;
          }
        }

        return next;
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [paused, testimonials.length, interval]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const step = useCallback(
    (direction: -1 | 1) => {
      scrollTo(Math.min(testimonials.length - 1, Math.max(0, active + direction)));
    },
    [active, testimonials.length, scrollTo],
  );

  if (testimonials.length === 0) return null;

  const controlClasses =
    'inline-grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-primary transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none';

  return (
    <div
      className={clsx('relative', className)}
      data-sample={sample ? 'true' : undefined}
      data-paused={paused ? 'true' : 'false'}
      data-testimonial-slider=""
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/*
        The track is focusable and labelled: a scrollable region that cannot be
        focused is unreachable for anyone scrolling by keyboard. No overriding
        role, which would strip the list semantics and orphan the items.

        Cards are sized so three sit side by side on desktop, two on tablet and
        one on mobile, and `items-stretch` keeps all three the same height
        whatever the quote length.
      */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Student testimonials"
        className="flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto scroll-smooth px-1 pb-4 outline-offset-4 [-ms-overflow-style:none] [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial, index) => (
          <li
            key={testimonial.name}
            data-active={index === active ? 'true' : 'false'}
            className="w-full shrink-0 snap-center sm:w-1/2 lg:w-1/3"
          >
            <TestimonialCard
              quote={testimonial.quote}
              name={testimonial.name}
              detail={testimonial.detail}
              src={testimonial.src}
              alt={testimonial.alt}
              className="h-full"
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={active === 0}
          aria-label="Previous testimonial"
          className={controlClasses}
        >
          <ChevronLeft size={18} aria-hidden="true" focusable="false" />
        </button>

        <ul className="flex items-center gap-2" aria-hidden="true">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.name}>
              <span
                className={clsx(
                  'block h-2 rounded-full transition-all duration-base ease-standard motion-reduce:transition-none',
                  index === active ? 'w-6 bg-primary' : 'w-2 bg-border',
                )}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={active === testimonials.length - 1}
          aria-label="Next testimonial"
          className={controlClasses}
        >
          <ChevronRight size={18} aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}
