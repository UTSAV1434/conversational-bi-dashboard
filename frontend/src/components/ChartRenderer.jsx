import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const CHART_COLORS = [
  "#6366f1", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: 12, margin: "2px 0" }}>
          {entry.name}: {typeof entry.value === "number"
            ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function ChartRenderer({ data, chartType, yColumns }) {
  if (!data || data.length === 0) return null;

  const keys = yColumns && yColumns.length > 0
    ? yColumns
    : Object.keys(data[0]).filter((k) => k !== "name");

  if (chartType === "pie") {
    const pieKey = keys[0];
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={pieKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={3}
              animationBegin={0}
              animationDuration={800}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "line") {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => typeof v === "number" ? v.toLocaleString() : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "area") {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              {keys.map((key, i) => (
                <linearGradient key={key} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => typeof v === "number" ? v.toLocaleString() : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={`url(#gradient-${i})`}
                strokeWidth={2}
                animationDuration={800}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === "table") {
    const allKeys = Object.keys(data[0]);
    return (
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {allKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {allKeys.map((key) => (
                  <td key={key}>
                    {typeof row[key] === "number"
                      ? row[key].toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Default: bar chart
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            tickFormatter={(v) => typeof v === "number" ? v.toLocaleString() : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {keys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
