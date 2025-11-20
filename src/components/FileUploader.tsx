import { useEffect, useState, useRef } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import { uploadData } from 'aws-amplify/storage';

// Import Uppy styles
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

interface FileUploaderProps {
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (file: any, error: any) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  maxNumberOfFiles?: number; // Allow multiple files
}

export default function FileUploader({
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

    // Custom upload handler for AWS Amplify Storage
    const handleUpload = async () => {
      const files = uppy.getFiles();
      
      for (const file of files) {
        try {
          const result = await uploadData({
            path: `uploads/${file.name}`,
            data: file.data as File,
          }).result;
          
          handleUploadSuccess(file, { 
            status: 200, 
            body: { path: result.path },
            uploadURL: result.path 
          });
        } catch (error: any) {
          handleUploadError(file, {
            name: 'UploadError',
            message: error?.message || 'Upload failed',
            details: error?.toString()
          });
        }
      }
      
      handleComplete({ successful: uploadedFiles, failed: [] });
    };

    uppy.on('upload', handleUpload);
    uppy.on('upload-error', handleUploadError);
    listenersAdded.current = true;

    return () => {
      uppy.off('upload', handleUpload);
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
