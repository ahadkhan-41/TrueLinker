import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="card auth-card stack">
        <h1>404</h1>
        <p className="muted">The requested page was not found.</p>
        <Link href="/Dashboard" className="btn primary">Go to Dashboard</Link>
      </section>
    </main>
  );
}
