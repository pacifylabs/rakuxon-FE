import clsx from 'clsx';
import Image from 'next/image';

export interface TestimonialCardProps {
  quote: string;
  name: string;
  detail: string;
  /** Omit for a real, named client who has not supplied a photograph. */
  src?: string;
  alt?: string;
  className?: string;
}

/**
 * First and last initial: "Sarah Adebayo" → SA, "Amaka & Chinedu Eze" → AE.
 * Matches how rakuxon.com renders the same six people.
 */
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => /[a-z]/i.test(word));
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Client quote (docs/04b § 3.8).
 *
 * The avatar falls back to initials rather than a stock portrait. These are
 * named, identifiable people; putting a stranger's face beside a real person's
 * name and university misrepresents them, and no amount of "it's just a
 * placeholder" survives the moment someone recognises the photo.
 */
export function TestimonialCard({
  quote,
  name,
  detail,
  src,
  alt,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={clsx(
        'flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm',
        className,
      )}
    >
      <blockquote className="text-base text-text">
        <p>{quote}</p>
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        {src ? (
          <Image
            src={src}
            alt={alt ?? ''}
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-primary"
          >
            {initialsOf(name)}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-text">{name}</p>
          <p className="text-sm text-text-muted">{detail}</p>
        </div>
      </figcaption>
    </figure>
  );
}
