import ChartRenderer from "./ChartRenderer";

export default function DashboardPanel({ charts }) {
  if (charts.length === 0) {
    return (
      <main className="dashboard-panel">
        <div className="welcome-state">
          <div className="welcome-icon">📊</div>
          <h2>Your insights will appear here</h2>
          <p>
            Ask a question about your data in the chat panel, and interactive
            charts and summaries will be generated instantly.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <div className="dataset-info-bar">
              <span className="stat">💡 <strong>Tip:</strong> Try "Show total revenue by region"</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-panel">
      {charts.map((chart, i) => (
        <div key={i} className="chart-card" id={`chart-card-${i}`}>
          <div className="chart-card-header">
            <h3 className="chart-card-title">{chart.title}</h3>
            <span className="chart-card-type">{chart.chart_type}</span>
          </div>
          {chart.summary && (
            <p className="chart-card-summary">{chart.summary}</p>
          )}
          <ChartRenderer
            data={chart.chart_data}
            chartType={chart.chart_type}
            yColumns={chart.y_columns}
          />
          <div className="dataset-info-bar" style={{ marginTop: 16 }}>
            <span className="stat">📋 <strong>{chart.rows_returned}</strong> data points</span>
            <span className="divider"></span>
            <span className="stat">📈 {chart.y_columns?.join(", ")}</span>
          </div>
        </div>
      ))}
    </main>
  );
}
