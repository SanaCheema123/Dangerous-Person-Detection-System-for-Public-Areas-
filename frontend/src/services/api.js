export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.message || `Request failed (${response.status})`);
  return data;
}

export async function checkHealth() {
  return parseResponse(await fetch(`${API_BASE}/health`));
}

export async function predictImage(file, confidence = 0.25) {
  const body = new FormData();
  body.append("file", file);
  body.append("confidence", String(confidence));
  return parseResponse(await fetch(`${API_BASE}/predict-image`, { method: "POST", body }));
}

export async function predictVideo(file, confidence = 0.25) {
  const body = new FormData();
  body.append("file", file);
  body.append("confidence", String(confidence));
  return parseResponse(await fetch(`${API_BASE}/predict-video`, { method: "POST", body }));
}

export function backendFile(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}
