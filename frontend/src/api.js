const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function sendQuery(query) {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchSchema() {
  const res = await fetch(`${API_BASE}/schema`);
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/datasets`);
  return res.json();
}

export async function loadDataset(filename) {
  const res = await fetch(`${API_BASE}/datasets/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  return res.json();
}
