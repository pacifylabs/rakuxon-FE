'use client';

import clsx from 'clsx';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

export interface NavLink {
  label: string;
  href: string;
  /** Rendered as a dropdown on desktop and a disclosure on mobile, instead of a plain link. */
  children?: readonly NavLink[];
}

export interface HeaderProps {
  navLinks: readonly NavLink[];
  logIn: NavLink;
  getStarted: NavLink;
  className?: string;
}

const NAV_LINK_CLASSES =
  'rounded-sm text-sm font-medium text-text-muted transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none';

/** A parent nav item with children — its own link, plus a toggle that opens a dropdown of them. */
function NavDropdown({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <li ref={containerRef} className="relative flex items-center">
      {/* The label itself still navigates to the overview page — only the
          chevron opens the dropdown, so neither affordance costs the other. */}
      <a href={link.href} className={NAV_LINK_CLASSES}>
        {link.label}
      </a>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} ${link.label} menu`}
        className="ml-1 rounded-sm p-1 text-text-muted transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        <ChevronDown
          aria-hidden="true"
          focusable="false"
          size={14}
          className={clsx('transition-transform duration-fast ease-standard', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-20 mt-2 min-w-[12rem] rounded-lg border border-border bg-surface p-2 shadow-lg">
          {link.children?.map((child) => (
            <li key={child.label}>
              <a
                href={child.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-text transition-colors duration-fast ease-standard hover:bg-accent-soft hover:text-primary motion-reduce:transition-none"
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** The same item on mobile — a native disclosure, so it needs no extra state. */
function MobileNavItem({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  if (!link.children) {
    return (
      <li>
        <a href={link.href} className={NAV_LINK_CLASSES} onClick={onNavigate}>
          {link.label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <details className="group">
        <summary
          className={clsx(NAV_LINK_CLASSES, 'flex cursor-pointer list-none items-center gap-1')}
        >
          {link.label}
          <ChevronDown
            aria-hidden="true"
            focusable="false"
            size={14}
            className="transition-transform duration-fast ease-standard group-open:rotate-180"
          />
        </summary>
        <ul className="mt-3 flex flex-col gap-3 border-l border-border pl-4">
          {/* The overview page itself — <summary> only toggles, so this is
              its one direct link on mobile, the same as the desktop label. */}
          <li>
            <a href={link.href} className={NAV_LINK_CLASSES} onClick={onNavigate}>
              All {link.label.toLowerCase()}
            </a>
          </li>
          {link.children.map((child) => (
            <li key={child.label}>
              <a href={child.href} className={NAV_LINK_CLASSES} onClick={onNavigate}>
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * Sticky translucent global header (docs/04b § 2).
 *
 * Below `lg` the nav collapses behind a disclosure button rather than being
 * hidden outright, so every destination stays reachable on a phone.
 */
export function Header({ navLinks, logIn, getStarted, className }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={clsx(
        'sticky top-0 z-10 w-full border-b border-border bg-surface/85 backdrop-blur',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-3 md:px-0">
        <Wordmark href="/" />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) =>
              link.children ? (
                <NavDropdown key={link.href} link={link} />
              ) : (
                <li key={link.href}>
                  <a href={link.href} className={NAV_LINK_CLASSES}>
                    {link.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href={logIn.href} variant="ghost" className="hidden sm:inline-flex">
            {logIn.label}
          </Button>
          <Button href={getStarted.href}>{getStarted.label}</Button>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="header-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-text transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none lg:hidden"
          >
            {open ? (
              <X size={20} aria-hidden="true" focusable="false" />
            ) : (
              <Menu size={20} aria-hidden="true" focusable="false" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="header-mobile-nav"
        aria-label="Primary mobile"
        hidden={!open}
        className="border-t border-border bg-surface px-5 py-4 lg:hidden"
      >
        <ul className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <MobileNavItem key={link.href} link={link} onNavigate={() => setOpen(false)} />
          ))}
          <li className="sm:hidden">
            <a href={logIn.href} className={NAV_LINK_CLASSES} onClick={() => setOpen(false)}>
              {logIn.label}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
