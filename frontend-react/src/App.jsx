import { useState, useRef, useCallback } from 'react';

import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import StatsRow   from './components/StatsRow';
import InputCard  from './components/InputCard';
import Loader     from './components/Loader';
import ResultCard from './components/ResultCard';
import ErrorCard  from './components/ErrorCard';
import HistoryTab from './components/HistoryTab';
import PortsTab   from './components/PortsTab';

import { predictPort, humanizeError } from './api';

export default function App() {
  /* ── UI State ─────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('analyze');

  /* ── Analyze State ────────────────────────────────────────── */
  const [port, setPort]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  /* ── History ──────────────────────────────────────────────── */
  const [history, setHistory] = useState([]);
  const idCounter = useRef(0);

  /* ── Core analysis logic ──────────────────────────────────── */
  const runAnalysis = useCallback(async (portNum) => {
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const data = await predictPort(portNum);
      setResult(data);
      // Push to history
      setHistory((prev) => [
        ...prev,
        { id: ++idCounter.current, result: data, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Form submit ──────────────────────────────────────────── */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum < 0 || portNum > 65535) {
        setError('Please enter a valid port number between 0 and 65535.');
        return;
      }
      runAnalysis(portNum);
    },
    [port, runAnalysis],
  );

  /* ── Retry: re-run the same port ─────────────────────────── */
  const handleRetry = useCallback(() => {
    const portNum = parseInt(port, 10);
    if (!isNaN(portNum)) runAnalysis(portNum);
    else { setError(null); setResult(null); }
  }, [port, runAnalysis]);

  /* ── Reset ────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setPort('');
  }, []);

  /* ── History actions ──────────────────────────────────────── */
  const handleRerun = useCallback(
    (rerunPort) => {
      setPort(String(rerunPort));
      setActiveTab('analyze');
      runAnalysis(rerunPort);
    },
    [runAnalysis],
  );

  const handleClearHistory = useCallback(() => setHistory([]), []);

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <>
      {/* Animated background layers */}
      <div className="bg-grid"   aria-hidden="true" />
      <div className="bg-glow-1" aria-hidden="true" />
      <div className="bg-glow-2" aria-hidden="true" />

      <div className="app-shell">
        {/* Navbar */}
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main */}
        <main className="main-content">

          {/* ── ANALYZE TAB ── */}
          {activeTab === 'analyze' && (
            <>
              <Hero />

              {/* Summary stats (only when there's history) */}
              {history.length > 0 && <StatsRow history={history} />}

              {/* Input */}
              <InputCard
                port={port}
                setPort={setPort}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />

              {/* Loader */}
              {isLoading && <Loader />}

              {/* Result */}
              {result && !isLoading && (
                <ResultCard result={result} onReset={handleReset} />
              )}

              {/* Error */}
              {error && !isLoading && (
                <ErrorCard message={error} onRetry={handleRetry} />
              )}
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <>
              {history.length > 0 && <StatsRow history={history} />}
              <HistoryTab
                history={history}
                onClear={handleClearHistory}
                onRerun={handleRerun}
              />
            </>
          )}

          {/* ── PORTS REFERENCE TAB ── */}
          {activeTab === 'ports' && <PortsTab />}

        </main>

        {/* Footer */}
        <footer className="site-footer">
          <p>
            CyberShield · AI-Based Cybersecurity Incident Response System<br />
            CIC-IDS2018 Dataset · LSTM Deep Learning · Nash Equilibrium Game Theory
          </p>
        </footer>
      </div>
    </>
  );
}
