import { ImageCard, Reveal, SectionBand } from '@rakuxon/ui';

import { COURSE_PATHS } from '@/content/home';
import { ROUTES } from '@/content/routes';

/**
 * Four ways into the catalogue. Each card is a real search, so it lands on
 * results rather than a dead end.
 */
export function CoursePaths() {
  return (
    <SectionBand id="paths" labelledBy="paths-heading">
      <h2
        id="paths-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Where do you want to start?
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Four routes into the same catalogue. Pick whichever question you have first.
      </p>

      <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COURSE_PATHS.map((path, index) => (
          <li key={path.title} className="h-full">
            <Reveal delay={index * 80}>
              <ImageCard
                src={path.src}
                alt={path.alt}
                href={`${ROUTES.explore}?${path.query}`}
                aspect="aspect-[4/3]"
              >
                <h3 className="font-heading text-lg font-semibold text-text">{path.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{path.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
                  Browse
                  <span aria-hidden="true">→</span>
                </span>
              </ImageCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
