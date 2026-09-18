import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DropzoneUploader } from './DropzoneUploader';

function makeFile(name = 'photo.png', type = 'image/png') {
  return new File(['content'], name, { type });
}

describe('<DropzoneUploader/>', () => {
  it('opens the file browser when the dropzone is clicked', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading={false} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('uploads the file dropped onto the dropzone', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading={false} />);

    const file = makeFile();
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('uploads the file chosen via click-to-browse', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading={false} />);

    const file = makeFile();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('shows the drag-active state while a file is dragged over it', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading={false} />);

    const button = screen.getByRole('button');
    fireEvent.dragEnter(button);
    expect(button.className).toContain('bg-accent-soft');

    fireEvent.dragLeave(button);
    expect(button.className).not.toContain('bg-accent-soft');
  });

  it('does not accept a drop while disabled', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading={false} disabled />);

    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [makeFile()] } });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('does not accept a drop while uploading', () => {
    const onUpload = vi.fn();
    render(<DropzoneUploader label="Photo" onUpload={onUpload} uploading />);

    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [makeFile()] } });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('renders an error message when given one', () => {
    render(
      <DropzoneUploader
        label="Photo"
        onUpload={vi.fn()}
        uploading={false}
        error="Upload failed."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed.');
  });

  it('renders the current file name for the document variant', () => {
    render(
      <DropzoneUploader
        label="Passport"
        variant="document"
        fileMeta={{ name: 'passport.pdf', bytes: 2_400_000 }}
        onUpload={vi.fn()}
        uploading={false}
      />,
    );
    expect(screen.getByText('passport.pdf')).toBeInTheDocument();
    expect(screen.getByText('· 2.4 MB')).toBeInTheDocument();
  });

  it('renders as a compact trigger with no preview when layout is inline', () => {
    render(
      <DropzoneUploader label="Replace" layout="inline" onUpload={vi.fn()} uploading={false} />,
    );
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
  });
});
