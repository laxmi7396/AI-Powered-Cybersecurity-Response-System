/**
 * api.js — CyberShield API layer
 * Calls FastAPI backend: GET /health, POST /predict
 *
 * Backend response schema (POST /predict):
 *   port: int
 *   threat_type: "BENIGN" | "Web Attack - Brute Force" | "Web Attack - SQL Injection" | "Web Attack - XSS"
 *   status: "SAFE" | "THREAT" | "UNKNOWN"
 *   is_safe: bool | null
 *   action: "Allow Connection" | "Block Source IP" | "Isolate Host"
 *   confidence: float (0–100)
 *   message: string
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Check backend health.
 * Returns { status: 'ok', model_loaded: bool }
 */
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/**
 * Predict threat for a given destination port.
 * @param {number} port - 0 to 65535
 */
export async function predictPort(port) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination_port: port }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Friendly error message from a caught error.
 */
export function humanizeError(err) {
  if (!err) return 'An unknown error occurred.';
  if (err.name === 'TimeoutError') {
    return 'Request timed out. The LSTM model may still be loading — please retry in a moment.';
  }
  if (
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('ERR_CONNECTION_REFUSED')
  ) {
    return 'Cannot reach the backend server. Make sure FastAPI is running on http://localhost:8000';
  }
  return `Analysis failed: ${err.message}`;
}
