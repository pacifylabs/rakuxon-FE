import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ThemeProvider, ToastProvider } from '@rakuxon/ui';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'app-1' }),
}));

import ApplicationDetailPage from './page';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function seedSession() {
  window.localStorage.setItem(
    'rakuxon.session',
    JSON.stringify({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: {
        id: 'u1',
        email: 'ada@b.test',
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: 'student',
      },
      expiresAt: Date.now() + 900_000,
    }),
  );
}

const document = {
  id: 'doc-1',
  type: 'identity',
  status: 'uploaded',
  originalFilename: 'passport.pdf',
  url: 'https://res.cloudinary.com/demo/raw/upload/v1/passport.pdf',
  bytes: 204800,
  mimeType: 'application/pdf',
  rejectionReason: null,
  createdAt: new Date().toISOString(),
};

function draftApplication(attachedDocumentIds: string[] = []) {
  const missingDocumentTypes = ['identity', 'academic_certificate', 'english_test'].filter(
    (type) => !(type === 'identity' && attachedDocumentIds.includes('doc-1')),
  );
  return {
    id: 'app-1',
    status: 'draft',
    studentId: 's1',
    courseId: 'c1',
    institutionId: 'i1',
    createdAt: new Date().toISOString(),
    submittedAt: null,
    attachedDocumentIds,
    missingDocumentTypes,
    readyToSubmit: missingDocumentTypes.length === 0,
  };
}

function renderPage() {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider baseUrl="https://api.test">
          <ApplicationDetailPage />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  seedSession();
});

afterEach(() => vi.unstubAllGlobals());

describe('<ApplicationDetailPage/>', () => {
  it('offers to attach a document already on file, rather than only a fresh upload', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const href = String(url);
      const method = init?.method ?? 'GET';
      if (href.endsWith('/v1/applications/app-1') && method === 'GET') {
        return json(200, draftApplication());
      }
      if (href.endsWith('/v1/documents')) return json(200, [document]);
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();

    expect(await screen.findByText('Already on file: passport.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attach to this application' })).toBeInTheDocument();
  });

  it('attaches the document and reflects it as attached, once confirmed', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const href = String(url);
      const method = init?.method ?? 'GET';
      if (href.endsWith('/v1/applications/app-1') && method === 'GET') {
        return json(200, draftApplication());
      }
      if (href.endsWith('/v1/documents')) return json(200, [document]);
      if (href.endsWith('/v1/applications/app-1/documents/doc-1') && method === 'POST') {
        return json(200, draftApplication(['doc-1']));
      }
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();

    const attachButton = await screen.findByRole('button', { name: 'Attach to this application' });
    await userEvent.click(attachButton);

    expect(await screen.findByText(/passport\.pdf/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detach' })).toBeInTheDocument();
  });

  it('keeps submit disabled until every required document is attached', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const href = String(url);
      if (href.endsWith('/v1/applications/app-1')) return json(200, draftApplication());
      if (href.endsWith('/v1/documents')) return json(200, []);
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();

    const submit = await screen.findByRole('button', { name: 'Submit application' });
    expect(submit).toBeDisabled();
    expect(
      screen.getByText('Every required document needs to be attached and approved before you can submit.'),
    ).toBeInTheDocument();
  });

  it('shows a document as pending review, not approved, once attached but not yet reviewed', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const href = String(url);
      const method = init?.method ?? 'GET';
      if (href.endsWith('/v1/applications/app-1') && method === 'GET') {
        return json(200, draftApplication(['doc-1']));
      }
      if (href.endsWith('/v1/documents')) return json(200, [document]);
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();

    expect(await screen.findByText(/Pending review/)).toBeInTheDocument();
    // Not attachable again — it's already attached, just not approved yet.
    expect(screen.queryByRole('button', { name: 'Attach to this application' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detach' })).toBeInTheDocument();
  });

  it('offers to attach an already-approved document without an extra review step', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const href = String(url);
      if (href.endsWith('/v1/applications/app-1')) return json(200, draftApplication());
      if (href.endsWith('/v1/documents')) return json(200, [{ ...document, status: 'approved' }]);
      return json(404, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();

    expect(await screen.findByText('Already approved: passport.pdf')).toBeInTheDocument();
  });
});
