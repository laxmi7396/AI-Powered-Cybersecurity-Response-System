export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="error-card" aria-live="assertive" role="alert">
      <div className="error-icon">⚠️</div>
      <p className="error-text">{message}</p>
      <button id="retryBtn" className="retry-btn" onClick={onRetry}>
        🔄 Try Again
      </button>
    </div>
  );
}
