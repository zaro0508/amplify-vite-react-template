import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock FileUploader component
vi.mock('./components/FileUploader', () => ({
  default: ({ onUploadComplete, onUploadError }: any) => (
    <div data-testid="file-uploader">
      <button
        onClick={() => onUploadComplete([
          { file: { name: 'test.txt' }, response: { status: 200 } }
        ])}
      >
        Trigger Upload Success
      </button>
      <button
        onClick={() => onUploadError(
          { name: 'error.txt' },
          { message: 'Upload failed' }
        )}
      >
        Trigger Upload Error
      </button>
    </div>
  ),
}));

describe('App', () => {
  it('renders the file upload heading', () => {
    render(<App />);
    
    const heading = screen.getByRole('heading', { name: /file upload/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the FileUploader component', () => {
    render(<App />);
    
    const uploader = screen.getByTestId('file-uploader');
    expect(uploader).toBeInTheDocument();
  });

  it('shows success alert when files are uploaded', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const successButton = screen.getByText('Trigger Upload Success');
    await user.click(successButton);
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('uploaded successfully')
    );
    
    alertSpy.mockRestore();
  });

  it('shows error alert when upload fails', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);
    
    const errorButton = screen.getByText('Trigger Upload Error');
    await user.click(errorButton);
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Upload failed')
    );
    
    alertSpy.mockRestore();
  });

  it('logs upload success to console', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<App />);
    
    const successButton = screen.getByText('Trigger Upload Success');
    await user.click(successButton);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Files uploaded successfully:',
      expect.any(Array)
    );
    
    consoleSpy.mockRestore();
  });

  it('logs upload errors to console', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    const errorButton = screen.getByText('Trigger Upload Error');
    await user.click(errorButton);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Upload failed:',
      expect.objectContaining({ message: 'Upload failed' })
    );
    
    consoleSpy.mockRestore();
  });
});
