/**
 * StatsRow.jsx
 * Displays aggregate scan stats derived from history:
 *   Total Scans, Safe Ports, Threats Detected
 */
export default function StatsRow({ history }) {
  const total   = history.length;
  const safe    = history.filter((h) => h.result.is_safe === true).length;
  const threats = history.filter((h) => h.result.is_safe === false).length;

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-icon">🔬</div>
        <div className="stat-info">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Scans</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <div className="stat-value safe-color">{safe}</div>
          <div className="stat-label">Safe Ports</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🚨</div>
        <div className="stat-info">
          <div className="stat-value threat-color">{threats}</div>
          <div className="stat-label">Threats Found</div>
        </div>
      </div>
    </div>
  );
}
