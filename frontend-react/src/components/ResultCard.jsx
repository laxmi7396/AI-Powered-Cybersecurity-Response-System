import { useEffect, useRef } from 'react';
import { statusClass, statusEmoji, verdictLabel, shortThreatLabel } from '../constants';

/**
 * Derives a badge CSS class for the threat type.
 */
function threatBadgeClass(threatType) {
  if (!threatType || threatType === 'BENIGN') return 'benign';
  if (threatType === 'Unknown') return 'unknown';
  return 'attack';
}

/**
 * Derives an action icon.
 */
function actionIcon(action) {
  if (action?.includes('Allow'))   return '✅';
  if (action?.includes('Block'))   return '🚫';
  if (action?.includes('Isolate')) return '🔒';
  return '⚙️';
}

export default function ResultCard({ result, onReset }) {
  const {
    port, threat_type, status, is_safe, action, confidence, message,
  } = result;

  const isUnknown  = status === 'UNKNOWN';
  const bannerCls  = statusClass(result);
  const emoji      = statusEmoji(result);
  const verdict    = verdictLabel(result);

  // Animate confidence bar on mount
  const barRef = useRef(null);
  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (barRef.current) barRef.current.style.width = `${confidence}%`;
      }, 80);
    });
  }, [confidence]);

  const isDanger = !is_safe && !isUnknown;

  return (
    <section className="card result-card" aria-live="polite">

      {/* ── Status Banner ── */}
      <div className={`status-banner ${bannerCls}`}>
        <span className="status-emoji" aria-hidden="true">{emoji}</span>
        <div className="status-info">
          <span className="status-verdict">{verdict}</span>
          <span className="status-msg">{message}</span>
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div className="details-grid">

        {/* Port */}
        <div className="detail-item">
          <span className="detail-label">📡 Destination Port</span>
          <span className="detail-value mono">{port}</span>
        </div>

        {/* Threat Type */}
        <div className="detail-item">
          <span className="detail-label">🎯 Threat Classification</span>
          <span className={`threat-badge ${threatBadgeClass(threat_type)}`}>
            {shortThreatLabel(threat_type)}
          </span>
        </div>

        {/* Defense Action (from Game Theory) */}
        <div className="detail-item">
          <span className="detail-label">⚖️ Game-Theory Defense</span>
          <span className="action-badge">
            {actionIcon(action)} {action}
          </span>
        </div>

        {/* Confidence */}
        <div className="detail-item">
          <span className="detail-label">📊 Model Confidence</span>
          <div className="confidence-wrapper">
            <div className="confidence-bar-bg">
              <div
                ref={barRef}
                className={`confidence-bar${isDanger ? ' danger' : ''}`}
                style={{ width: '0%' }}
                aria-valuenow={confidence}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <span className="detail-value confidence-pct">{confidence}%</span>
          </div>
        </div>
      </div>

      {/* ── Status Pills ── */}
      <div className="status-pills">
        <span className="status-pill">⚡ DRL Policy Updated</span>
        <span className="status-pill">🔁 Feedback Loop Active</span>
        <span className="status-pill">🧠 LSTM Inference Complete</span>
        <span className="status-pill">🎮 Game Theory Applied</span>
      </div>

      {/* ── Reset ── */}
      <button id="resetBtn" className="reset-btn" onClick={onReset}>
        ↩ Analyze Another Port
      </button>
    </section>
  );
}
