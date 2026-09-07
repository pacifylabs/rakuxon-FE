import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ThemeProvider } from '@rakuxon/ui';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }));

import DashboardPage from './dashboard/page';
import LoginPage from './login/page';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const session = (role: string) => ({
  accessToken: 'a',
  refreshToken: 'r',
  expiresIn: 900,
  user: { id: 'u1', email: 'user@b.test', fullName: 'Test User', role, tenantId: 't1' },
  expiresAt: Date.now() + 900_000,
});

const signedInAs = (role: string) =>
  window.sessionStorage.setItem('rakuxon.session', JSON.stringify(session(role)));

const renderApp = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <AuthProvider baseUrl="https://api.test">{ui}</AuthProvider>
    </ThemeProvider>,
  );

beforeEach(() => {
  window.sessionStorage.clear();
  push.mockClear();
  replace.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => json(200, { status: 'ok', dependencies: { database: 'up' } })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('institution-portal sign-in', () => {
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

describe('institution-portal dashboard', () => {
  it('sends a signed-out visitor to sign in, showing nothing protected', async () => {
    renderApp(<DashboardPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Application inbox')).not.toBeInTheDocument();
  });

  it('admits a institution_user', async () => {
    signedInAs('institution_user');
    renderApp(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'Application inbox' })).toBeInTheDocument();
  });

  it.each(['agency_admin', 'counselor', 'student'])(
    'refuses a %s, who is signed in but out of scope',
    async (role) => {
      signedInAs(role);
      renderApp(<DashboardPage />);

      // Told, not bounced: sending a signed-in person back to a login form is
      // a dead end they cannot resolve by signing in again.
      expect(
        await screen.findByRole('heading', { name: /not for your account/i }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Application inbox' })).not.toBeInTheDocument();
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it('reports API health', async () => {
    signedInAs('institution_user');
    renderApp(<DashboardPage />);
    const badge = await screen.findByRole('status');
    await waitFor(() => expect(badge).toHaveAttribute('data-status', 'ok'));
  });
});
