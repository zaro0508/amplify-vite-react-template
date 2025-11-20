import FileUploader from "./components/FileUploader";

function App() {
  const handleUploadComplete = (files: any[]) => {
    console.log("Files uploaded successfully:", files);
    const fileNames = files.map(f => f.file.name).join(', ');
    alert(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully: ${fileNames}`);
  };

  const handleUploadError = (file: any, error: any) => {
    console.error("Upload failed:", error);
    alert(`Upload failed for "${file.name}": ${error.message || 'Unknown error'}`);
  };

  return (
    <main>
      <div style={{ marginTop: '2rem' }}>
        <h2>File Upload</h2>
        <FileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFileSize={10 * 1024 * 1024}
          maxNumberOfFiles={10}
          allowedFileTypes={['image/*', '.pdf', '.doc', '.docx']}
        />
      </div>
    </main>
  );
}

export default App;
