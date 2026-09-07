'use client';

import type { ReactNode } from 'react';

import type { Role } from '@rakuxon/contract';

import { RequireAuth } from './RequireAuth';

export interface GuardedPageProps {
  children: ReactNode;
  roles?: Role[];
  /** Called when the visitor is not signed in — typically a router redirect. */
  onUnauthenticated: () => void;
  /** Shown when signed in but holding the wrong role. */
  wrongRole?: ReactNode;
}

/**
 * The waiting and refusal states every authenticated page needs, in one place.
 *
 * A visitor with the wrong role is told so rather than bounced to sign-in:
 * sending an already-signed-in person back to a login form is a dead end they
 * cannot resolve by signing in again.
 */
export function GuardedPage({ children, roles, onUnauthenticated, wrongRole }: GuardedPageProps) {
  return (
    <RequireAuth
      roles={roles}
      fallback={<p className="p-8 text-base text-text-muted">Checking your session…</p>}
      denied={wrongRole ?? <p className="p-8 text-base text-text-muted">Redirecting to sign in…</p>}
      onUnauthenticated={onUnauthenticated}
    >
      {children}
    </RequireAuth>
  );
}
