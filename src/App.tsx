import FileUploader from "./components/FileUploader";

function App() {
  const handleUploadComplete = (file: any, response: any) => {
    console.log("File uploaded successfully:", file.name);
    console.log("Server response:", response);
    alert(`File "${file.name}" uploaded successfully!`);
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
          uploadEndpoint="https://tusd.tusdemo.net/files/"
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFileSize={10 * 1024 * 1024}
          allowedFileTypes={['image/*', '.pdf', '.doc', '.docx']}
        />
      </div>
    </main>
  );
}

export default App;
