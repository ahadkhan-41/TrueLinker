export default function ThreatIndicators({ items = [] }) {
  if (!items.length) return <p className="muted">No threat indicators found.</p>;

  return (
    <div className="chip-wrap">
      {items.map((item) => (
        <span key={item} className="chip">
          {item}
        </span>
      ))}
    </div>
  );
}
