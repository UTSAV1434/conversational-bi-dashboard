import { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import DashboardPanel from "./components/DashboardPanel";
import FileUpload from "./components/FileUpload";
import { sendQuery, uploadCSV, fetchHealth } from "./api";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [charts, setCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [datasetName, setDatasetName] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.dataset_loaded) {
          setDatasetName(data.dataset_name);
        }
      })
      .catch(() => {
        setMessages([
          {
            type: "error",
            text: "⚠️ Cannot connect to the backend. Make sure the Flask server is running on http://localhost:5000",
          },
        ]);
      });
  }, []);

  const handleSendQuery = async (query) => {
    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setIsLoading(true);

    try {
      const result = await sendQuery(query);

      if (result.error) {
        setMessages((prev) => [
          ...prev,
          { type: "error", text: result.error },
        ]);
      } else {
        // Add assistant message with summary
        setMessages((prev) => [
          ...prev,
          {
            type: "assistant",
            text: `📊 ${result.title}\n\n${result.summary}`,
          },
        ]);

        // Add chart to dashboard
        setCharts((prev) => [result, ...prev]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Failed to process query: " + err.message },
      ]);
    }

    setIsLoading(false);
  };

  const handleUpload = async (file) => {
    const result = await uploadCSV(file);
    if (!result.error) {
      setDatasetName(result.filename);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: `✅ Dataset "${result.filename}" loaded successfully!\n📊 ${result.rows} rows × ${result.columns} columns\n📋 Columns: ${result.column_names.join(", ")}\n\nYou can now ask questions about this data!`,
        },
      ]);
      // Clear previous charts since dataset changed
      setCharts([]);
    }
    return result;
  };

  return (
    <div className="app">
      <Header
        datasetName={datasetName}
        onUploadClick={() => setShowUpload(true)}
      />
      <div className="app-body">
        <ChatPanel
          messages={messages}
          onSendQuery={handleSendQuery}
          isLoading={isLoading}
        />
        <DashboardPanel charts={charts} />
      </div>
      {showUpload && (
        <FileUpload
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
