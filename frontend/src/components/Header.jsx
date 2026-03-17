export default function Header({ datasetName, onUploadClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">⚡</div>
        <div>
          <div className="header-title">InsightAI</div>
          <div className="header-subtitle">Conversational Business Intelligence</div>
        </div>
      </div>
      <div className="header-right">
        {datasetName && (
          <div className="dataset-badge">
            <span className="dot"></span>
            <span>{datasetName}</span>
          </div>
        )}
        <button className="upload-btn" onClick={onUploadClick} id="upload-dataset-btn">
          📁 Upload Dataset
        </button>
      </div>
    </header>
  );
}
