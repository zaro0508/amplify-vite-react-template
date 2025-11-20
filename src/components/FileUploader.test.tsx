import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import FileUploader from '../components/FileUploader';

// Mock Uppy
const mockUppyInstance = {
  use: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  cancelAll: vi.fn(),
  getFiles: vi.fn(() => []),
  setFileState: vi.fn(),
};

vi.mock('@uppy/core', () => ({
  default: vi.fn(function() {
    return mockUppyInstance;
  }),
}));

vi.mock('@uppy/dashboard', () => ({
  default: vi.fn(),
}));

vi.mock('aws-amplify/storage', () => ({
  uploadData: vi.fn(() => ({
    result: Promise.resolve({ path: 'test-path' }),
  })),
}));

describe('FileUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the file uploader container', () => {
    const { container } = render(
      <FileUploader
        onUploadComplete={vi.fn()}
        onUploadError={vi.fn()}
      />
    );

    const uploaderDiv = container.querySelector('.file-uploader');
    expect(uploaderDiv).toBeInTheDocument();
    
    const dashboardDiv = container.querySelector('#uppy-dashboard');
    expect(dashboardDiv).toBeInTheDocument();
  });

  it('accepts custom max file size', () => {
    const { container } = render(
      <FileUploader
        maxFileSize={5 * 1024 * 1024}
        onUploadComplete={vi.fn()}
        onUploadError={vi.fn()}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('accepts custom max number of files', () => {
    const { container } = render(
      <FileUploader
        maxNumberOfFiles={5}
        onUploadComplete={vi.fn()}
        onUploadError={vi.fn()}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('accepts allowed file types', () => {
    const { container } = render(
      <FileUploader
        allowedFileTypes={['image/*', '.pdf']}
        onUploadComplete={vi.fn()}
        onUploadError={vi.fn()}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('calls onUploadComplete when provided', () => {
    const onComplete = vi.fn();
    
    render(
      <FileUploader
        onUploadComplete={onComplete}
        onUploadError={vi.fn()}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onUploadError when provided', () => {
    const onError = vi.fn();
    
    render(
      <FileUploader
        onUploadComplete={vi.fn()}
        onUploadError={onError}
      />
    );

    expect(onError).not.toHaveBeenCalled();
  });
});
