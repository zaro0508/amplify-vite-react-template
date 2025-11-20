import { useEffect, useState, useRef } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Tus from '@uppy/tus';

// Import Uppy styles
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

interface FileUploaderProps {
  uploadEndpoint: string;
  onUploadComplete?: (file: any, response: any) => void;
  onUploadError?: (file: any, error: any) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

export default function FileUploader({
  uploadEndpoint,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes,
}: FileUploaderProps) {
  const dashboardMounted = useRef(false);
  const listenersAdded = useRef(false);
  
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
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
          note: `Upload a single file (max ${(maxFileSize / 1024 / 1024).toFixed(0)}MB)`,
        });
        dashboardMounted.current = true;
      }
    }
  }, [uppy, maxFileSize]);

  // Set up event listeners only once
  useEffect(() => {
    if (listenersAdded.current) return;

    const handleUploadSuccess = (file: any, response: any) => {
      console.log('Upload successful:', file?.name);
      if (onUploadComplete && file) {
        onUploadComplete(file, response);
      }
    };

    const handleUploadError = (file: any, error: any) => {
      console.error('Upload error:', error);
      if (onUploadError && file) {
        onUploadError(file, error);
      }
    };

    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('upload-error', handleUploadError);
    listenersAdded.current = true;

    return () => {
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('upload-error', handleUploadError);
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
