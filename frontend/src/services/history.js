const KEY = "dangerous_person_detection_history_v2";
export function getHistory() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function addHistory(entry) {
  const rows = [entry, ...getHistory()].slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("detection-history-updated"));
}
export function clearHistory() { localStorage.removeItem(KEY); window.dispatchEvent(new Event("detection-history-updated")); }
