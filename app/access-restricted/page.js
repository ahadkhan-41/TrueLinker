"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AccessRestrictedPage() {
  const { logout } = useAuth();
  return (
    <main className="auth-page">
      <section className="card auth-card stack">
        <h1>Access Restricted</h1>
        <p className="muted">Your account is authenticated but not registered for platform access.</p>
        <div className="row gap">
          <Link href="/Dashboard" className="btn ghost">Try Dashboard</Link>
          <button className="btn danger" onClick={logout}>Sign Out</button>
        </div>
      </section>
    </main>
  );
}
