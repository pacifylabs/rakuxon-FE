import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

export interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Passed through to next/link. Leave unset for its default behaviour. */
  prefetch?: boolean;
}

/** Same-origin paths only. Anything else stays a plain anchor. */
const isInternal = (href: string) =>
  href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/api/');

/**
 * An internal link that navigates without reloading the page.
 *
 * Every link on the site was a bare <a>, so choosing a search result threw the
 * whole document away and rebuilt it — new HTML, new CSS parse, fonts and the
 * header re-rendered, and a visible white flash on a route the server had
 * already prerendered. next/link fetches the route in the background and swaps
 * the tree, so the same navigation is near-instant.
 *
 * External, mailto:, tel: and API paths fall through to <a>: next/link would
 * either mangle them or try to prefetch something that is not a page.
 */
export function AppLink({ href, prefetch, children, ...rest }: AppLinkProps) {
  if (!isInternal(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  );
}
