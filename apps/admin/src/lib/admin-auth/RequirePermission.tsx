'use client';

import type { ReactNode } from 'react';

import { useAdminAuth } from './AdminAuthProvider';

export interface RequirePermissionProps {
  children: ReactNode;
  /** When given, the admin must hold every one of these keys. Omit to just require sign-in. */
  permissions?: string[];
  /** Rendered while the stored session is being read. */
  fallback?: ReactNode;
  /** Rendered when the visitor is signed in but not authorised. */
  denied?: ReactNode;
  onUnauthenticated?: () => void;
}

/**
 * Route protection for the admin app — the mirror of `@rakuxon/auth`'s
 * `RequireAuth`, gating on permission keys instead of a role.
 *
 * A convenience, not a security boundary: the API authorises every request
 * on its own (`AdminJwtAuthGuard` + `PermissionGuard`); this only decides
 * what to draw.
 */
export function RequirePermission({
  children,
  permissions,
  fallback = null,
  denied = null,
  onUnauthenticated,
}: RequirePermissionProps) {
  const { admin, ready, hasPermission } = useAdminAuth();

  if (!ready) return <>{fallback}</>;

  if (!admin) {
    onUnauthenticated?.();
    return <>{denied}</>;
  }

  if (permissions?.length && !hasPermission(...permissions)) return <>{denied}</>;

  return <>{children}</>;
}
