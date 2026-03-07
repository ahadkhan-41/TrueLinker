"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

function colorClass(item) {
  if (item.classification === "phishing") return "danger";
  if (item.classification === "suspicious") return "warn";
  return "safe";
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getIncidents(), api.getReports()])
      .then(([incidentData, reportData]) => {
        setIncidents(incidentData.incidents || []);
        setReports(reportData.reports || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const stats = useMemo(() => {
    const threats = incidents.filter((item) => item.risk_score >= 70).length;
    const suspicious = incidents.filter((item) => item.risk_score >= 40 && item.risk_score < 70).length;
    const open = incidents.filter((item) => item.status === "open").length;
    return { scans: incidents.length + reports.length, threats, suspicious, open };
  }, [incidents, reports]);

  return (
    <div className="stack">
      <div className="row wrap between">
        <h1>Dashboard</h1>
        <div className="row gap">
          <Link href="/URLScanner" className="btn primary">Scan URL</Link>
          <Link href="/EmailScanner" className="btn ghost">Scan Email</Link>
        </div>
      </div>

      <section className="grid cards-4">
        <StatCard title="Total Scans" value={stats.scans} subtitle="Across URL and email" color="blue" />
        <StatCard title="Threats Detected" value={stats.threats} subtitle="High confidence" color="red" />
        <StatCard title="Suspicious" value={stats.suspicious} subtitle="Needs review" color="amber" />
        <StatCard title="Open Incidents" value={stats.open} subtitle="Unresolved issues" color="emerald" />
      </section>

      <section className="grid charts">
        <article className="card span-2">
          <h2>Threat Activity</h2>
          <div className="activity-bars">
            {incidents.slice(0, 8).map((item) => (
              <div key={item.id} className="bar-row">
                <span>{item.affected_domain}</span>
                <div className="bar-track">
                  <div className={`bar-fill ${colorClass({ classification: item.risk_score >= 70 ? "phishing" : item.risk_score >= 40 ? "suspicious" : "safe" })}`} style={{ width: `${item.risk_score}%` }} />
                </div>
                <span>{item.risk_score}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <h2>Distribution</h2>
          <p className="muted">Phishing: {stats.threats}</p>
          <p className="muted">Suspicious: {stats.suspicious}</p>
          <p className="muted">Safe: {Math.max(stats.scans - stats.threats - stats.suspicious, 0)}</p>
        </article>
      </section>

      <section className="card">
        <h2>Recent Scans</h2>
        {error ? <p className="error">{error}</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Classification</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 10).map((item) => (
                <tr key={item.id}>
                  <td>{item.affected_domain}</td>
                  <td><span className={`pill ${colorClass({ classification: item.risk_score >= 70 ? "phishing" : item.risk_score >= 40 ? "suspicious" : "safe" })}`}>{item.risk_score >= 70 ? "phishing" : item.risk_score >= 40 ? "suspicious" : "safe"}</span></td>
                  <td>{item.risk_score}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
