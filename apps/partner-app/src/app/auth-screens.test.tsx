import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ThemeProvider } from '@rakuxon/ui';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }));

import DashboardPage from './dashboard/page';
import LoginPage from './login/page';
import RegisterPage from './register/page';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const tokens = (over: Record<string, unknown> = {}) => ({
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresIn: 900,
  user: {
    id: 'u1',
    email: 'ada@b.test',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'agency_admin',
    tenantId: 't1',
  },
  ...over,
});

function mockFetch(handler: () => Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => handler()),
  );
}

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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('login screen', () => {
  it('labels every control', () => {
    mockFetch(() => json(200, {}));
    renderApp(<LoginPage />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('validates before sending anything to the server', async () => {
    const fetchSpy = vi.fn(async () => json(200, tokens()));
    vi.stubGlobal('fetch', fetchSpy);

    renderApp(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('links each error to its field for assistive technology', async () => {
    mockFetch(() => json(200, tokens()));
    renderApp(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const email = screen.getByLabelText('Email address');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('rejects a malformed address without a round trip', async () => {
    const fetchSpy = vi.fn(async () => json(200, tokens()));
    vi.stubGlobal('fetch', fetchSpy);

    renderApp(<LoginPage />);
    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('signs in and moves to the dashboard', async () => {
    mockFetch(() => json(200, tokens()));
    renderApp(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-battery');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  });

  it('announces a rejected sign-in and stays put', async () => {
    mockFetch(() => json(401, { message: 'Those credentials are not valid.' }));
    renderApp(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Those credentials are not valid.');
    expect(push).not.toHaveBeenCalled();
  });

  it('reports an unreachable server distinctly from a refusal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    renderApp(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.type(screen.getByLabelText('Password'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });
});

describe('register screen', () => {
  const fill = async () => {
    await userEvent.type(screen.getByLabelText('Agency name'), 'Northwind');
    await userEvent.type(screen.getByLabelText('Subdomain'), 'northwind');
    await userEvent.type(screen.getByLabelText('First name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Last name'), 'Lovelace');
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-battery');
  };

  it('mirrors the API subdomain rule rather than waiting for a 400', async () => {
    const fetchSpy = vi.fn(async () => json(201, tokens()));
    vi.stubGlobal('fetch', fetchSpy);

    renderApp(<RegisterPage />);
    await userEvent.type(screen.getByLabelText('Subdomain'), 'Not Valid');
    await userEvent.click(screen.getByRole('button', { name: 'Create workspace' }));

    expect(screen.getByText('Use 3–40 lowercase letters, digits or hyphens.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('enforces the password length the API enforces', async () => {
    mockFetch(() => json(201, tokens()));
    renderApp(<RegisterPage />);
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Create workspace' }));

    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
  });

  it('registers and moves to the dashboard', async () => {
    mockFetch(() => json(201, tokens()));
    renderApp(<RegisterPage />);
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Create workspace' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  });

  it('puts a taken subdomain on the field that caused it', async () => {
    mockFetch(() => json(409, { message: 'That subdomain is already taken.' }));
    renderApp(<RegisterPage />);
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Create workspace' }));

    // Not a detached banner: the user needs to know which box to change.
    await waitFor(() =>
      expect(screen.getByText('That subdomain is already taken.')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Subdomain')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dashboard', () => {
  const signedIn = (role = 'agency_admin') =>
    window.sessionStorage.setItem(
      'rakuxon.session',
      JSON.stringify({
        ...tokens({ user: { ...tokens().user, role } }),
        expiresAt: Date.now() + 900_000,
      }),
    );

  it('redirects a signed-out visitor and shows nothing protected', async () => {
    mockFetch(() => json(200, {}));
    renderApp(<DashboardPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
  });

  it('greets a signed-in user', async () => {
    signedIn();
    mockFetch(() => json(200, { status: 'ok', dependencies: { database: 'up' } }));
    renderApp(<DashboardPage />);

    expect(await screen.findByText(/Welcome back, Ada/)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows agency administration to an admin', async () => {
    signedIn('agency_admin');
    mockFetch(() => json(200, { status: 'ok', dependencies: { database: 'up' } }));
    renderApp(<DashboardPage />);

    expect(
      await screen.findByRole('heading', { name: 'Agency administration' }),
    ).toBeInTheDocument();
  });

  it('hides agency administration from a counselor', async () => {
    signedIn('counselor');
    mockFetch(() => json(200, { status: 'ok', dependencies: { database: 'up' } }));
    renderApp(<DashboardPage />);

    await screen.findByText(/Welcome back/);
    expect(
      screen.queryByRole('heading', { name: 'Agency administration' }),
    ).not.toBeInTheDocument();
  });

  it('reports API health, distinguishing degraded from unreachable', async () => {
    signedIn();
    mockFetch(() => json(200, { status: 'ok', dependencies: { database: 'down' } }));
    renderApp(<DashboardPage />);

    const badge = await screen.findByRole('status');
    await waitFor(() => expect(badge).toHaveAttribute('data-status', 'degraded'));
  });

  it('reports an unreachable API', async () => {
    signedIn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    renderApp(<DashboardPage />);

    const badge = await screen.findByRole('status');
    await waitFor(() => expect(badge).toHaveAttribute('data-status', 'unreachable'));
  });
});
