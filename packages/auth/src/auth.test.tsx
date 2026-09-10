import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider, RequireAuth, useAuth } from './index';

const tokens = (over: Record<string, unknown> = {}) => ({
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresIn: 900,
  user: { id: 'u1', email: 'a@b.test', firstName: 'Ada', lastName: 'Lovelace', role: 'agency_admin', tenantId: 't1' },
  ...over,
});

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const spy = vi.fn(async (url: unknown, init?: unknown) =>
    handler(String(url), init as RequestInit),
  );
  vi.stubGlobal('fetch', spy);
  return spy;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function Probe() {
  const { user, ready, signIn, signOut, hasRole } = useAuth();
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <span data-testid="admin">{String(hasRole('agency_admin'))}</span>
      <button onClick={() => void signIn({ email: 'a@b.test', password: 'pw' })}>Sign in</button>
      <button onClick={() => void signOut()}>Sign out</button>
    </div>
  );
}

const renderAuth = (ui = <Probe />) =>
  render(<AuthProvider baseUrl="https://api.test">{ui}</AuthProvider>);

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('<AuthProvider/>', () => {
  it('starts signed out and becomes ready after reading storage', async () => {
    mockFetch(() => json(200, {}));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('signs in and exposes the user', async () => {
    mockFetch(() => json(200, tokens()));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.test'));
  });

  it('persists the session so a reload stays signed in', async () => {
    mockFetch(() => json(200, tokens()));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.test'));

    expect(window.sessionStorage.getItem('rakuxon.session')).toContain('refresh-1');
  });

  it('restores a stored session on mount', async () => {
    window.sessionStorage.setItem(
      'rakuxon.session',
      JSON.stringify({ ...tokens(), expiresAt: Date.now() + 900_000 }),
    );
    mockFetch(() => json(200, {}));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.test'));
  });

  it('surfaces a rejected sign-in instead of swallowing it', async () => {
    mockFetch(() => json(401, { message: 'Those credentials are not valid.' }));

    function Failing() {
      const { signIn } = useAuth();
      return (
        <button
          onClick={async () => {
            try {
              await signIn({ email: 'a@b.test', password: 'wrong' });
            } catch (error) {
              document.title = (error as Error).message;
            }
          }}
        >
          Try
        </button>
      );
    }

    renderAuth(<Failing />);
    await userEvent.click(screen.getByRole('button', { name: 'Try' }));
    await waitFor(() => expect(document.title).toBe('Those credentials are not valid.'));
  });

  it('signs out locally even when the logout call fails', async () => {
    let call = 0;
    mockFetch(() => {
      call += 1;
      return call === 1 ? json(200, tokens()) : json(500, { message: 'boom' });
    });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.test'));

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    // The user asked to leave; a failing network call must not keep them in.
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(window.sessionStorage.getItem('rakuxon.session')).toBeNull();
  });

  it('reports roles', async () => {
    mockFetch(() => json(200, tokens()));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('admin')).toHaveTextContent('true'));
  });

  it('signs out when a scheduled refresh is refused, rather than retrying', async () => {
    // The API revokes a whole token family on replay, so retrying a bad
    // refresh would turn one failure into a locked-out user.
    let call = 0;
    mockFetch(() => {
      call += 1;
      return call === 1 ? json(200, tokens({ expiresIn: 61 })) : json(401, { message: 'spent' });
    });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'));
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@b.test'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'), {
      timeout: 3000,
    });
  });

  it('refuses to be used outside a provider', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/must be used inside/);
    quiet.mockRestore();
  });
});

describe('<RequireAuth/>', () => {
  it('shows the fallback, and never the children, while the session is unknown', () => {
    /*
     * The provider's effect flushes synchronously under test, so the
     * not-ready window cannot be observed through a real render. The branch
     * still has to be right — a guard that renders children before it knows
     * puts protected content in the DOM — so it is exercised directly.
     */
    render(
      <AuthContext.Provider
        value={{
          user: null,
          ready: false,
          signIn: vi.fn(),
          registerAgency: vi.fn(),
          registerStudent: vi.fn(),
          registerViaOnboardingLink: vi.fn(),
          signOut: vi.fn(),
          hasRole: () => false,
          apiClient: {} as never,
        }}
      >
        <RequireAuth fallback={<p>Checking…</p>} denied={<p>Denied</p>}>
          <p>Secret</p>
        </RequireAuth>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Checking…')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.queryByText('Denied')).not.toBeInTheDocument();
  });

  it('denies a signed-out visitor and notifies the caller', async () => {
    mockFetch(() => json(200, {}));
    const onUnauthenticated = vi.fn();

    render(
      <AuthProvider baseUrl="https://api.test">
        <RequireAuth denied={<p>Denied</p>} onUnauthenticated={onUnauthenticated}>
          <p>Secret</p>
        </RequireAuth>
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('Denied')).toBeInTheDocument());
    expect(onUnauthenticated).toHaveBeenCalled();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('admits a signed-in user', async () => {
    window.sessionStorage.setItem(
      'rakuxon.session',
      JSON.stringify({ ...tokens(), expiresAt: Date.now() + 900_000 }),
    );
    mockFetch(() => json(200, {}));

    render(
      <AuthProvider baseUrl="https://api.test">
        <RequireAuth denied={<p>Denied</p>}>
          <p>Secret</p>
        </RequireAuth>
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('Secret')).toBeInTheDocument());
  });

  it('hides content from a signed-in user without the required role', async () => {
    window.sessionStorage.setItem(
      'rakuxon.session',
      JSON.stringify({
        ...tokens({ user: { ...tokens().user, role: 'counselor' } }),
        expiresAt: Date.now() + 900_000,
      }),
    );
    mockFetch(() => json(200, {}));

    render(
      <AuthProvider baseUrl="https://api.test">
        <RequireAuth roles={['agency_admin']} denied={<p>Denied</p>}>
          <p>Admin only</p>
        </RequireAuth>
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('Denied')).toBeInTheDocument());
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
  });
});
