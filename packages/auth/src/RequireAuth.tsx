'use client';

import type { ReactNode } from 'react';

import type { Role } from '@rakuxon/contract';

import { useAuth } from './AuthProvider';

export interface RequireAuthProps {
  children: ReactNode;
  /** When given, the user must also hold one of these roles. */
  roles?: Role[];
  /** Rendered while the stored session is being read. */
  fallback?: ReactNode;
  /** Rendered when the visitor may not see the children. */
  denied?: ReactNode;
  onUnauthenticated?: () => void;
}

/**
 * Route protection.
 *
 * Renders nothing but the fallback until the session has actually been read —
 * rendering children first and hiding them afterwards would put protected
 * content in the DOM, however briefly.
 *
 * This is a convenience, not a security boundary. The API authorises every
 * request on its own; this only decides what to draw.
 */
export function RequireAuth({
  children,
  roles,
  fallback = null,
  denied = null,
  onUnauthenticated,
}: RequireAuthProps) {
  const { user, ready, hasRole } = useAuth();

  if (!ready) return <>{fallback}</>;

  if (!user) {
    onUnauthenticated?.();
    return <>{denied}</>;
  }

  if (roles?.length && !hasRole(...roles)) return <>{denied}</>;

  return <>{children}</>;
}
