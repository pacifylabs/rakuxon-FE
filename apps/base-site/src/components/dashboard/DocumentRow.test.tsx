import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@rakuxon/auth';
import { ToastProvider } from '@rakuxon/ui';
import type { StudentDocument } from '@rakuxon/contract';

import { DocumentRow } from './DocumentRow';

function renderRow(document: StudentDocument | undefined) {
  return render(
    <ToastProvider>
      <AuthProvider baseUrl="https://api.test">
        <DocumentRow
          type="identity"
          label="Identity"
          document={document}
          onUploaded={vi.fn()}
          onDeleted={vi.fn()}
        />
      </AuthProvider>
    </ToastProvider>,
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
  it('shows the rejection reason and a dropzone to upload a replacement', () => {
    renderRow({ ...base, status: 'rejected', rejectionReason: 'The scan is illegible.' });

    expect(screen.getByText(/Rejected: The scan is illegible\./)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /drag and drop, or click to browse/i }),
    ).toBeInTheDocument();
  });

  it('shows the filename, not a rejection reason, for an uploaded document', () => {
    renderRow(base);

    expect(screen.getByText(/passport\.pdf/)).toBeInTheDocument();
    expect(screen.queryByText(/^Rejected:/)).not.toBeInTheDocument();
  });

  it('offers a real drag-and-drop dropzone, not a plain button, when nothing has been uploaded yet', () => {
    renderRow(undefined);

    const dropzone = screen.getByRole('button', { name: /drag and drop, or click to browse/i });
    expect(dropzone).toBeInTheDocument();
    // The document type's own label still identifies which slot this is.
    expect(screen.getByText('Identity')).toBeInTheDocument();
  });
});
