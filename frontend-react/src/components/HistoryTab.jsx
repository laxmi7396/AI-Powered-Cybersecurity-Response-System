import { shortThreatLabel, statusClass, statusEmoji } from '../constants';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function HistoryTab({ history, onClear, onRerun }) {
  if (history.length === 0) {
    return (
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">📋 Scan History</div>
            <div className="section-subtitle">Your recent port analyses</div>
          </div>
        </div>
        <div className="history-empty">
          <div className="history-empty-icon">📭</div>
          <p>No scans yet. Go to the Analyze tab to run your first port check.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">📋 Scan History</div>
          <div className="section-subtitle">{history.length} scans recorded this session</div>
        </div>
        <button className="clear-btn" onClick={onClear} title="Clear all history">
          🗑 Clear
        </button>
      </div>

      <div className="history-list">
        {[...history].reverse().map((entry) => {
          const { result, timestamp } = entry;
          const cls = statusClass(result);
          return (
            <div
              key={entry.id}
              className={`history-item ${cls}-item`}
              onClick={() => onRerun(result.port)}
              title={`Re-analyze port ${result.port}`}
            >
              {/* Status dot */}
              <span className={`history-status-dot ${cls}`} aria-hidden="true" />

              {/* Port number */}
              <div className="history-port">{result.port}</div>

              {/* Details */}
              <div className="history-details">
                <div className="history-threat">{shortThreatLabel(result.threat_type)}</div>
                <div className="history-action">⚖️ {result.action}</div>
              </div>

              {/* Meta */}
              <div className="history-meta">
                <div className="history-confidence">{result.confidence}%</div>
                <div className="history-time">{formatTime(timestamp)}</div>
              </div>

              {/* Emoji */}
              <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>
                {statusEmoji(result)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
