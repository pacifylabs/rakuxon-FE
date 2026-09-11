import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }), usePathname: () => '/dashboard' }));

import { AdminAuthProvider } from '@/lib/admin-auth';
import DashboardLayout from './dashboard/layout';
import DashboardPage from './dashboard/page';
import LoginPage from './login/page';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const adminSession = (permissions: string[] = []) => ({
  accessToken: 'a',
  refreshToken: 'r',
  admin: { id: 'admin-1', email: 'admin@rakuxon.com', firstName: 'Test', lastName: 'Admin', permissions },
  expiresAt: Date.now() + 900_000,
});

const signedInWith = (permissions: string[] = []) =>
  window.sessionStorage.setItem('rakuxon.admin.session', JSON.stringify(adminSession(permissions)));

const renderApp = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <AdminAuthProvider baseUrl="https://api.test">{ui}</AdminAuthProvider>
    </ThemeProvider>,
  );

beforeEach(() => {
  window.sessionStorage.clear();
  push.mockClear();
  replace.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/dashboard/summary')) {
        return json(200, {
          totalTenants: 0,
          totalInstitutions: 0,
          totalCourses: 0,
          totalArticles: 0,
          totalStudents: 0,
          totalApplications: 0,
          tenantsByStatus: [],
          institutionsByStatus: [],
          applicationsByStatus: [],
          studentsWithCompleteProfile: 0,
          studentsWithIncompleteProfile: 0,
        });
      }
      return json(200, { status: 'ok', dependencies: { database: 'up' } });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('admin sign-in', () => {
  it('renders a labelled sign-in form', () => {
    renderApp(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('offers no self-registration, because these accounts are provisioned', () => {
    renderApp(<LoginPage />);
    expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
  });
});

describe('admin dashboard', () => {
  it('sends a signed-out visitor to sign in, showing nothing protected', async () => {
    renderApp(
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Platform administration')).not.toBeInTheDocument();
  });

  it('admits any signed-in admin, regardless of which permissions they hold', async () => {
    signedInWith([]);
    renderApp(
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>,
    );
    expect(await screen.findByRole('heading', { name: 'Platform administration' })).toBeInTheDocument();
  });

  it('marks the shell as Admin and puts the signed-in name in a header account menu', async () => {
    signedInWith(['tenants.view', 'tenants.approve']);
    renderApp(
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>,
    );
    await screen.findByRole('heading', { name: 'Platform administration' });

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByLabelText('Account menu for Test Admin')).toBeInTheDocument();
  });

  it('reports API health', async () => {
    signedInWith([]);
    renderApp(
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>,
    );
    const badge = await screen.findByRole('status');
    await waitFor(() => expect(badge).toHaveAttribute('data-status', 'ok'));
  });

  it('navigates the dashboard nav, which stays visible regardless of permissions', async () => {
    signedInWith([]);
    renderApp(
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>,
    );
    await screen.findByRole('heading', { name: 'Platform administration' });
    const nav = within(screen.getByRole('navigation', { name: 'Primary' }));
    expect(nav.getByRole('link', { name: /tenants/i })).toBeInTheDocument();
    expect(nav.getByRole('link', { name: /admins/i })).toBeInTheDocument();
  });
});
