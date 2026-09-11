import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import type { StudentDocument } from '@rakuxon/contract';

import { DocumentRow } from './DocumentRow';

function renderRow(document: StudentDocument | undefined) {
  return render(
    <AuthProvider baseUrl="https://api.test">
      <DocumentRow type="identity" label="Identity" document={document} onUploaded={vi.fn()} onDeleted={vi.fn()} />
    </AuthProvider>,
  );
}

const base: StudentDocument = {
  id: 'd1',
  type: 'identity',
  status: 'uploaded',
  originalFilename: 'passport.pdf',
  url: 'https://res.cloudinary.com/demo/raw/upload/v1/passport.pdf',
  bytes: 204800,
  mimeType: 'application/pdf',
  rejectionReason: null,
  createdAt: new Date().toISOString(),
};

describe('<DocumentRow/>', () => {
  it('shows the rejection reason and offers to upload a replacement', () => {
    renderRow({ ...base, status: 'rejected', rejectionReason: 'The scan is illegible.' });

    expect(screen.getByText('Rejected: The scan is illegible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload replacement/i })).toBeInTheDocument();
  });

  it('shows the filename, not a rejection reason, for an uploaded document', () => {
    renderRow(base);

    expect(screen.getByText(/passport\.pdf/)).toBeInTheDocument();
    expect(screen.queryByText(/^Rejected:/)).not.toBeInTheDocument();
  });

  it('offers a plain upload, not "replacement", when nothing has been uploaded yet', () => {
    renderRow(undefined);

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });
});
