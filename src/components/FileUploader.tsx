import { useEffect, useState, useRef } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Tus from '@uppy/tus';

// Import Uppy styles
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

interface FileUploaderProps {
  uploadEndpoint: string;
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (file: any, error: any) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  maxNumberOfFiles?: number; // Allow multiple files
}

export default function FileUploader({
  uploadEndpoint,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes,
  maxNumberOfFiles = 10, // Default to 10 files
}: FileUploaderProps) {
  const dashboardMounted = useRef(false);
  const listenersAdded = useRef(false);
  
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: maxNumberOfFiles,
        maxFileSize: maxFileSize,
        allowedFileTypes: allowedFileTypes,
      },
      autoProceed: false,
    })
      .use(Tus, {
        endpoint: uploadEndpoint,
      })
  );

  // Mount dashboard only once
  useEffect(() => {
    if (!dashboardMounted.current) {
      const dashboardElement = document.getElementById('uppy-dashboard');
      if (dashboardElement) {
        uppy.use(Dashboard, {
          inline: true,
          target: dashboardElement,
          proudlyDisplayPoweredByUppy: false,
          height: 350,
          note: `Upload up to ${maxNumberOfFiles} file${maxNumberOfFiles > 1 ? 's' : ''} (max ${(maxFileSize / 1024 / 1024).toFixed(0)}MB each)`,
        });
        dashboardMounted.current = true;
      }
    }
  }, [uppy, maxFileSize, maxNumberOfFiles]);

  // Set up event listeners only once
  useEffect(() => {
    if (listenersAdded.current) return;

    const uploadedFiles: any[] = [];

    const handleUploadSuccess = (file: any, response: any) => {
      console.log('Upload successful:', file?.name);
      if (file) {
        uploadedFiles.push({ file, response });
      }
    };

    const handleUploadError = (file: any, error: any) => {
      console.error('Upload error:', error);
      if (onUploadError && file) {
        onUploadError(file, error);
      }
    };

    const handleComplete = (result: any) => {
      console.log('All uploads complete:', result);
      if (onUploadComplete && uploadedFiles.length > 0) {
        onUploadComplete(uploadedFiles);
      }
      // Clear the array for next upload batch
      uploadedFiles.length = 0;
    };

    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('upload-error', handleUploadError);
    uppy.on('complete', handleComplete);
    listenersAdded.current = true;

    return () => {
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('upload-error', handleUploadError);
      uppy.off('complete', handleComplete);
      uppy.cancelAll();
      listenersAdded.current = false;
    };
  }, [uppy, onUploadComplete, onUploadError]);

  return (
    <div className="file-uploader">
      <div id="uppy-dashboard"></div>
    </div>
  );
}
