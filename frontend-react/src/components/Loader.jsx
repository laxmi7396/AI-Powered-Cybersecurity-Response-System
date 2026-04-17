export default function Loader() {
  return (
    <div className="loader-wrap" aria-live="polite" aria-label="Analyzing port…">
      <div className="spinner-ring" aria-hidden="true" />
      <p className="loader-text">Running LSTM inference…</p>
      <div className="loader-progress" aria-hidden="true">
        <div className="loader-bar" />
      </div>
    </div>
  );
}
