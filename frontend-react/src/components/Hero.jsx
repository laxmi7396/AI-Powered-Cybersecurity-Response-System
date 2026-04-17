export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span>⚡</span>
        <span>LSTM · CIC-IDS2018 · Game Theory</span>
      </div>
      <h1 className="hero-title">
        Port Threat <span className="gradient-text">Analyzer</span>
      </h1>
      <p className="hero-subtitle">
        AI-powered network intrusion detection using deep LSTM learning.
        Enter any TCP/UDP destination port to receive an instant threat verdict
        with a Game-Theoretic defense recommendation.
      </p>
    </section>
  );
}
