import { useState, useRef, useEffect } from "react";

const SAMPLE_QUERIES = [
  "Show total revenue by region",
  "Monthly sales trend over time",
  "Top 10 products by revenue",
  "Compare profit across categories",
  "Revenue by region for Q3 2024",
  "Units sold distribution",
];

export default function ChatPanel({ messages, onSendQuery, isLoading }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendQuery(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (query) => {
    if (isLoading) return;
    onSendQuery(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <h3>💬 Ask your data</h3>
        <p>Type a question in plain English</p>
      </div>

      <div className="suggested-queries">
        <div className="suggested-queries-title">Try asking</div>
        <div className="suggested-queries-list">
          {SAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              className="suggested-query-btn"
              onClick={() => handleSuggestionClick(q)}
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message assistant">
            <div className="msg-label">InsightAI</div>
            Hi! 👋 I can help you explore your data. Upload a CSV or ask a question about the loaded dataset.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            {msg.type === "user" && <div className="msg-label">You</div>}
            {msg.type === "assistant" && <div className="msg-label">InsightAI</div>}
            {msg.type === "error" && <div className="msg-label">Error</div>}
            {msg.text}
          </div>
        ))}

        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="loading-text">Analyzing your data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Ask about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            id="query-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isLoading}
            id="send-query-btn"
          >
            ➤
          </button>
        </div>
      </form>
    </aside>
  );
}
