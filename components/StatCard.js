export default function StatCard({ title, value, subtitle, color = "blue", trend }) {
  return (
    <article className={`card stat ${color}`}>
      <div className="stat-top">
        <p className="label">{title}</p>
        {trend ? <span className="trend">{trend}</span> : null}
      </div>
      <p className="stat-value">{value}</p>
      <p className="muted">{subtitle}</p>
    </article>
  );
}
