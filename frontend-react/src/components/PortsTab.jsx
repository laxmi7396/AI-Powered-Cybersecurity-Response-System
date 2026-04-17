import { KNOWN_PORTS, shortThreatLabel } from '../constants';

const CATEGORIES = [
  { key: 'BENIGN',                     label: '✅ Safe / Benign', cls: 'safe-port',   badge: 'badge-safe'    },
  { key: 'Web Attack - Brute Force',   label: '💥 Brute Force',   cls: 'threat-port', badge: 'badge-threat'  },
  { key: 'Web Attack - SQL Injection', label: '🗃️ SQL Injection', cls: 'threat-port', badge: 'badge-threat'  },
  { key: 'Web Attack - XSS',           label: '🕷️ XSS Attack',   cls: 'threat-port', badge: 'badge-warning' },
];

export default function PortsTab() {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">🗂️ Known Port Reference</div>
          <div className="section-subtitle">
            Ports with model-defined threat behaviors (from model_service.py heuristics)
          </div>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const ports = KNOWN_PORTS.filter((p) => p.threatClass === cat.key);
        return (
          <div key={cat.key} style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              {cat.label}
            </h3>
            <div className="ports-grid">
              {ports.map((p) => (
                <div key={p.port} className={`port-ref-card ${cat.cls}`}>
                  <div className="port-ref-number">{p.port}</div>
                  <div className="port-ref-name">{p.name}</div>
                  <div className="port-ref-class">{p.protocol}</div>
                  <span className={`port-ref-badge ${cat.badge}`}>
                    {shortThreatLabel(cat.key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(0,222,222,.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          ℹ️ <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> Classifications above reflect the synthetic mode heuristics in <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', background: 'rgba(0,222,222,.08)', padding: '1px 5px', borderRadius: '3px' }}>model_service.py</code>.
          When the real CIC-IDS2018 CSV is loaded, predictions use actual dataset rows and may differ.
          Ports not listed will produce a model-inferred prediction.
        </p>
      </div>
    </div>
  );
}
