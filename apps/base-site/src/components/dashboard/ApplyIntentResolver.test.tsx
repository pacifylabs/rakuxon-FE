import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ThemeProvider } from '@rakuxon/ui';

const replace = vi.fn();
let query = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(query),
}));

import { ApplyIntentResolver } from './ApplyIntentResolver';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function seedSession() {
  window.sessionStorage.setItem(
    'rakuxon.session',
    JSON.stringify({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 'u1', email: 'ada@b.test', firstName: 'Ada', lastName: 'Lovelace', role: 'student' },
      expiresAt: Date.now() + 900_000,
    }),
  );
}

const renderResolver = () =>
  render(
    <ThemeProvider>
      <AuthProvider baseUrl="https://api.test">
        <ApplyIntentResolver />
      </AuthProvider>
    </ThemeProvider>,
  );

beforeEach(() => {
  window.sessionStorage.clear();
  replace.mockClear();
  query = '';
  seedSession();
});

afterEach(() => vi.unstubAllGlobals());

describe('<ApplyIntentResolver/>', () => {
  it('does nothing when neither course nor university is in the URL', async () => {
    vi.stubGlobal('fetch', vi.fn());
    renderResolver();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(replace).not.toHaveBeenCalled();
  });

  it('creates a real application and lands on its detail page, when the course resolves', async () => {
    query = 'course=final-check-course';
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('/v1/catalogue/courses/')) return json(200, { id: 'course-uuid-1' });
      if (String(url).includes('/v1/applications')) return json(201, { id: 'app-uuid-1' });
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderResolver();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard/applications/app-uuid-1'));
  });

  it('falls back to the course page when the slug has no real catalogue record', async () => {
    query = 'course=sample-bank-only-course';
    const fetchMock = vi.fn(async () => json(404, {}));
    vi.stubGlobal('fetch', fetchMock);

    renderResolver();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/courses/sample-bank-only-course'),
    );
  });

  it('sends a university-only intent to that university\'s course list', async () => {
    query = 'university=abdo-college';
    vi.stubGlobal('fetch', vi.fn());

    renderResolver();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/universities/abdo-college#courses'),
    );
  });
});
