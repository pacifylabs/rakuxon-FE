'use client';

import { Bell, ChevronDown, MessageCircle, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppLink } from './AppLink';
import { EmptyState } from './EmptyState';
import { Wordmark } from './Wordmark';
import { initialsOf } from './TestimonialCard';

export interface AppShellNavItem {
  /** Omit on a group item (one with `children`) that has no overview page of its own. */
  href?: string;
  label: string;
  icon: LucideIcon;
  /** Renders as a `<details>` disclosure instead of a plain link — a group, not a destination. */
  children?: AppShellNavItem[];
}

export interface AppShellProps {
  navItems: AppShellNavItem[];
  /** Where the wordmark links to — typically the shell's own home. */
  homeHref: string;
  userName?: string;
  userEmail?: string;
  onSignOut: () => void;
  signOutLabel?: string;
  children: ReactNode;
}

function SidebarContent({
  navItems,
  userName,
  userEmail,
  onSignOut,
  signOutLabel = 'Sign out',
  onNavigate,
}: Omit<AppShellProps, 'children' | 'homeHref'> & { onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-on-primary">
          {userName ? initialsOf(userName) : '?'}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-text">
            {userName ?? 'Your account'}
          </p>
          <p className="truncate text-sm text-text-muted">{userEmail ?? ''}</p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.children && item.children.length > 0) {
            const hasActiveChild = item.children.some((child) => pathname === child.href);
            return (
              <details key={item.label} className="group" open={hasActiveChild}>
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-text hover:bg-surface-muted">
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform duration-fast ease-standard group-open:rotate-180" />
                </summary>
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-4">
                  {item.children.map((child) => {
                    const active = pathname === child.href;
                    return (
                      <AppLink
                        key={child.href}
                        href={child.href ?? '#'}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          active ? 'bg-primary text-on-primary' : 'text-text hover:bg-surface-muted'
                        }`}
                      >
                        {child.label}
                      </AppLink>
                    );
                  })}
                </div>
              </details>
            );
          }

          const active = pathname === item.href;
          return (
            <AppLink
              key={item.href}
              href={item.href ?? '#'}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                active ? 'bg-primary text-on-primary' : 'text-text hover:bg-surface-muted'
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </AppLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium text-text-muted hover:bg-surface-muted"
        >
          {signOutLabel}
        </button>
      </div>
    </div>
  );
}

/** A header icon button with a dropdown panel — the bell and the chat icon share this. */
function HeaderMenuButton({
  icon: Icon,
  label,
  panelTitle,
  panelDescription,
}: {
  icon: LucideIcon;
  label: string;
  panelTitle: string;
  panelDescription: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={label}
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[18rem] rounded-lg border border-border bg-surface p-2 shadow-lg">
          <EmptyState icon={Icon} title={panelTitle} description={panelDescription} />
        </div>
      )}
    </div>
  );
}

/**
 * The shell every authenticated, signed-in-user surface shares: a full-width
 * header, a sidebar on desktop (a slide-in overlay on mobile, opened from the
 * same header), and a content column that uses whatever space is left rather
 * than being capped to the marketing site's reading-width container. Session
 * and navigation are the caller's concern — this only lays out what it is
 * given, so it has no dependency on `@rakuxon/auth` and can be reused by any
 * app with a signed-in area (a student dashboard today, a partner or
 * institution workspace later) without those apps sharing an auth provider
 * or even a deployment.
 */
export function AppShell({
  navItems,
  homeHref,
  userName,
  userEmail,
  onSignOut,
  signOutLabel,
  children,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  /* A route change is the visitor telling us where they're going — the
     overlay staying open after that just blocks the page it navigated to. */
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const sidebarProps = { navItems, homeHref, userName, userEmail, onSignOut, signOutLabel };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            className="rounded-md p-2 text-text hover:bg-surface-muted lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <Wordmark href={homeHref} />
        </div>

        <div className="flex items-center gap-1">
          <HeaderMenuButton
            icon={Bell}
            label="Notifications"
            panelTitle="Nothing here yet"
            panelDescription="Updates on your applications and account will show up here."
          />
          <HeaderMenuButton
            icon={MessageCircle}
            label="Messages"
            panelTitle="No messages yet"
            panelDescription="Messages from your counsellor and admissions teams will show up here."
          />
        </div>
      </header>

      <div className="flex w-full lg:items-start">
        {/* Desktop: a permanent column. Mobile: a slide-in overlay, toggled by the header button. */}
        <aside className="hidden shrink-0 border-r border-border lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-[16rem]">
          <SidebarContent {...sidebarProps} />
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute inset-y-0 left-0 w-[16rem] max-w-[85vw] bg-surface shadow-lg">
              <div className="flex items-center justify-between border-b border-border p-5">
                <Wordmark href={homeHref} />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                  className="rounded-md p-2 text-text hover:bg-surface-muted"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              <SidebarContent {...sidebarProps} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
