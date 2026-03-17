import { useState, useRef } from "react";

export default function FileUpload({ onUpload, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setResult({ error: "Only CSV files are supported." });
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const res = await onUpload(file);
      setResult(res);
    } catch (err) {
      setResult({ error: "Upload failed: " + err.message });
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h3>📁 Upload Dataset</h3>
        <p>Upload any CSV file to start exploring your data with AI-powered insights.</p>

        <div
          className={`upload-area ${dragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">☁️</div>
          <div className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <div className="upload-hint">CSV files only • Any dataset structure</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            id="file-input"
          />
        </div>

        {uploading && (
          <div className="loading-indicator" style={{ marginTop: 16 }}>
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="loading-text">Uploading and analyzing dataset...</span>
          </div>
        )}

        {result && !result.error && (
          <div className="dataset-info-bar" style={{ marginTop: 16, flexWrap: "wrap" }}>
            <span className="stat">✅ <strong>{result.filename}</strong> loaded</span>
            <span className="divider"></span>
            <span className="stat">📊 <strong>{result.rows}</strong> rows</span>
            <span className="divider"></span>
            <span className="stat">📋 <strong>{result.columns}</strong> columns</span>
          </div>
        )}

        {result && result.error && (
          <div className="message error" style={{ marginTop: 16 }}>
            {result.error}
          </div>
        )}

        <button className="modal-close-btn" onClick={onClose}>
          {result && !result.error ? "Done" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
