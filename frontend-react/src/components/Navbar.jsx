import { useHealthCheck, HEALTH_LABELS } from '../hooks/useHealthCheck';

const TABS = [
  { id: 'analyze',  label: '🔍 Analyze' },
  { id: 'history',  label: '📋 History' },
  { id: 'ports',    label: '🗂️ Port Reference' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const healthStatus = useHealthCheck();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="nav-logo">
        <span className="nav-logo-icon">🛡️</span>
        <span className="nav-logo-text">CyberShield</span>
      </div>

      {/* Tab navigation */}
      <div className="nav-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Backend status */}
      <div className="status-badge">
        <span className={`pulse-dot ${healthStatus}`} aria-hidden="true" />
        <span aria-live="polite">{HEALTH_LABELS[healthStatus]}</span>
      </div>
    </nav>
  );
}
