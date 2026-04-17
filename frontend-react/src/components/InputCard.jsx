import { QUICK_PORTS } from '../constants';

export default function InputCard({ port, setPort, onSubmit, isLoading }) {
  return (
    <section className="card" aria-label="Port analysis form">
      <div className="card-header">
        <div className="card-header-icon">🔍</div>
        <div className="card-header-text">
          <h2>Analyze Destination Port</h2>
          <p>Enter a TCP/UDP port number (0 – 65535) to run the LSTM threat analysis.</p>
        </div>
      </div>

      <form
        id="analyzeForm"
        className="analyze-form"
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <div className="input-group">
          <label htmlFor="portInput" className="input-label">
            Destination Port
          </label>
          <div className="input-wrapper">
            <span className="input-icon">⚡</span>
            <input
              type="number"
              id="portInput"
              name="port"
              className="port-input"
              placeholder="e.g. 53, 80, 443, 8080"
              min="0"
              max="65535"
              required
              aria-describedby="portHint"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>
          <span id="portHint" className="input-hint">
            Valid range: 0 – 65535 &nbsp;·&nbsp; Common: 53 (DNS), 80 (HTTP), 443 (HTTPS), 22 (SSH), 8080 (Alt-HTTP)
          </span>
        </div>

        <button
          type="submit"
          id="analyzeBtn"
          className="analyze-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <span>Analyze Port</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      {/* Quick-select pills */}
      <div className="quick-ports">
        <span className="quick-label">Quick test:</span>
        {QUICK_PORTS.map((p) => (
          <button
            key={p}
            type="button"
            className="pill"
            onClick={() => setPort(String(p))}
            aria-label={`Select port ${p}`}
          >
            {p}
          </button>
        ))}
      </div>
    </section>
  );
}
