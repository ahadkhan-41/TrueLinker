function color(score) {
  if (score >= 67) return "#ef4444";
  if (score >= 34) return "#f59e0b";
  return "#10b981";
}

export default function RiskScoreGauge({ score = 0, classification = "safe" }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="gauge-wrap">
      <div
        className="gauge"
        style={{
          background: `conic-gradient(${color(pct)} ${pct * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
        }}
      >
        <div className="gauge-inner">
          <strong>{pct}</strong>
          <span>/100</span>
        </div>
      </div>
      <p className="muted capitalize">{classification}</p>
    </div>
  );
}
