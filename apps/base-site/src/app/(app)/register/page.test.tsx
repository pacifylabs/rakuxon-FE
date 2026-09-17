import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ThemeProvider } from '@rakuxon/ui';

const push = vi.fn();
const replace = vi.fn();
let query = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams(query),
}));

import RegisterPage from './page';

const SESSION_KEY = 'rakuxon.session';

const seedSession = () => {
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 'u1', email: 'ada@b.test', firstName: 'Ada', lastName: 'Lovelace', role: 'student' },
      expiresAt: Date.now() + 900_000,
    }),
  );
};

const renderApp = () =>
  render(
    <ThemeProvider>
      <AuthProvider baseUrl="https://api.test">
        <RegisterPage />
      </AuthProvider>
    </ThemeProvider>,
  );

beforeEach(() => {
  window.sessionStorage.clear();
  push.mockClear();
  replace.mockClear();
  query = '';
});

afterEach(() => vi.unstubAllGlobals());

describe('/register', () => {
  it('shows the registration form to a visitor with no session', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('sends an already signed-in visitor straight to the dashboard, carrying the university they were looking at', async () => {
    query = 'university=abdo-college';
    seedSession();

    renderApp();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard?university=abdo-college'));
    expect(screen.queryByRole('heading', { name: 'Create your account' })).not.toBeInTheDocument();
  });

  it('carries the course, not the university, when only a course was in the link', async () => {
    query = 'course=final-check-course';
    seedSession();

    renderApp();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard?course=final-check-course'));
  });
});
