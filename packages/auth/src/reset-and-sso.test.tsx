import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

import {
  AuthProvider,
  ConfirmPasswordResetForm,
  RequestPasswordResetForm,
  SignInForm,
  SsoButton,
  googleAuthorizeUrl,
} from './index';

/** SignInForm needs a provider for useAuth; the sign-in path is not exercised here. */
const SignInFormHarness = ({ above }: { above: React.ReactNode }) => (
  <AuthProvider baseUrl="https://api.test">
    <SignInForm subtitle="Sign in." onSignedIn={() => undefined} above={above} />
  </AuthProvider>
);

const json = (status: number, body: unknown = {}) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const withTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<RequestPasswordResetForm/>', () => {
  it('validates the address before sending anything', async () => {
    const fetchSpy = vi.fn(async () => json(204));
    vi.stubGlobal('fetch', fetchSpy);

    withTheme(<RequestPasswordResetForm baseUrl="https://api.test" />);
    await userEvent.click(screen.getByRole('button', { name: 'Email me a link' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('confirms without revealing whether the address exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(204)),
    );

    withTheme(<RequestPasswordResetForm baseUrl="https://api.test" />);
    await userEvent.type(screen.getByLabelText('Email address'), 'nobody@nowhere.test');
    await userEvent.click(screen.getByRole('button', { name: 'Email me a link' }));

    // The API answers 204 either way; the screen must not undo that.
    const confirmation = await screen.findByText(/If that address has an account/i);
    expect(confirmation).toBeInTheDocument();
    expect(screen.queryByText(/no account/i)).not.toBeInTheDocument();
  });

  it('posts to the reset endpoint', async () => {
    const fetchSpy = vi.fn(async () => json(204));
    vi.stubGlobal('fetch', fetchSpy);

    withTheme(<RequestPasswordResetForm baseUrl="https://api.test" />);
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.click(screen.getByRole('button', { name: 'Email me a link' }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.test/v1/auth/password-reset/request',
        expect.anything(),
      ),
    );
  });

  it('reports an unreachable server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    withTheme(<RequestPasswordResetForm baseUrl="https://api.test" />);
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@b.test');
    await userEvent.click(screen.getByRole('button', { name: 'Email me a link' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });
});

describe('<ConfirmPasswordResetForm/>', () => {
  it('enforces the same length the API enforces', async () => {
    const fetchSpy = vi.fn(async () => json(204));
    vi.stubGlobal('fetch', fetchSpy);

    withTheme(
      <ConfirmPasswordResetForm baseUrl="https://api.test" token="t" onComplete={vi.fn()} />,
    );
    await userEvent.type(screen.getByLabelText('New password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('completes and hands control back', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(204)),
    );
    const onComplete = vi.fn();

    withTheme(
      <ConfirmPasswordResetForm baseUrl="https://api.test" token="t" onComplete={onComplete} />,
    );
    await userEvent.type(screen.getByLabelText('New password'), 'a-brand-new-passphrase');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('explains a spent link without guessing which failure it was', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(401, { message: 'That reset link is not valid.' })),
    );

    withTheme(
      <ConfirmPasswordResetForm baseUrl="https://api.test" token="t" onComplete={vi.fn()} />,
    );
    await userEvent.type(screen.getByLabelText('New password'), 'a-brand-new-passphrase');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    // The API refuses to distinguish expired / used / unknown, so neither does this.
    expect(await screen.findByRole('alert')).toHaveTextContent(/expired or has already been used/i);
  });

  it('warns that other sessions end', () => {
    withTheme(
      <ConfirmPasswordResetForm baseUrl="https://api.test" token="t" onComplete={vi.fn()} />,
    );
    expect(screen.getByText(/signs you out everywhere else/i)).toBeInTheDocument();
  });
});

describe('<SignInForm/> alternative sign-in', () => {
  it('draws no separator when nothing sits above the form', () => {
    // An "or" with nothing above it reads as a rendering failure.
    const { container } = withTheme(
      <ThemeProvider>
        <SignInFormHarness above={null} />
      </ThemeProvider>,
    );
    expect(container.querySelector('[role="separator"]')).not.toBeInTheDocument();
  });

  it('draws the separator only alongside real content', () => {
    const { container } = withTheme(
      <ThemeProvider>
        <SignInFormHarness above={<button type="button">Continue with Google</button>} />
      </ThemeProvider>,
    );
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });
});

describe('googleAuthorizeUrl', () => {
  it('asks only for the claims the API maps onto a profile', () => {
    const url = new URL(googleAuthorizeUrl('client-1', 'https://app.test/cb', 'state-1'));
    expect(url.searchParams.get('scope')).toBe('openid email profile');
  });

  it('requests a code, carries the state, and forces account choice', () => {
    const url = new URL(googleAuthorizeUrl('client-1', 'https://app.test/cb', 'state-1'));
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('state-1');
    expect(url.searchParams.get('prompt')).toBe('select_account');
    expect(url.searchParams.get('redirect_uri')).toBe('https://app.test/cb');
  });

  it('carries no secret — this URL is built in a browser', () => {
    const url = googleAuthorizeUrl('client-1', 'https://app.test/cb', 'state-1');
    expect(url).not.toMatch(/secret/i);
  });
});

describe('<SsoButton/>', () => {
  it('renders nothing when no provider is configured', () => {
    // A visible button that cannot work reads as a broken account, not as a
    // missing deployment setting.
    const { container } = withTheme(<SsoButton redirectUri="https://app.test/cb" />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('navigates to the provider', async () => {
    const navigate = vi.fn();
    withTheme(
      <SsoButton clientId="client-1" redirectUri="https://app.test/cb" navigate={navigate} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate.mock.calls[0]?.[0]).toContain('accounts.google.com');
  });

  it('stores a state value, so the callback can refuse a foreign code', async () => {
    const navigate = vi.fn();
    withTheme(
      <SsoButton clientId="client-1" redirectUri="https://app.test/cb" navigate={navigate} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    const stored = window.sessionStorage.getItem('rakuxon.sso.state');
    expect(stored).toBeTruthy();
    expect(navigate.mock.calls[0]?.[0]).toContain(`state=${stored}`);
  });

  it('still navigates when storage is blocked', async () => {
    const navigate = vi.fn();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    withTheme(
      <SsoButton clientId="client-1" redirectUri="https://app.test/cb" navigate={navigate} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    // The callback will refuse for want of a stored state, which is the safe
    // direction to fail in.
    expect(navigate).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
