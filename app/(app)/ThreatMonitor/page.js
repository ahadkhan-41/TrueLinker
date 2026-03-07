"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function cls(score) {
  if (score >= 70) return "phishing";
  if (score >= 40) return "suspicious";
  return "safe";
}

export default function ThreatMonitorPage() {
  const [items, setItems] = useState([]);
  const [minRisk, setMinRisk] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const data = await api.getIncidents();
        setItems(data.incidents || []);
      } catch (err) {
        setError(err.message);
      }
      timer = setTimeout(load, 30000);
    }

    load();
    return () => clearTimeout(timer);
  }, []);

  const filtered = items.filter((item) => item.risk_score >= Number(minRisk));

  return (
    <div className="stack">
      <h1>Threat Monitor</h1>
      <section className="card row wrap gap">
        <label className="muted">Minimum risk:</label>
        <select className="input select" value={minRisk} onChange={(e) => setMinRisk(e.target.value)}>
          <option value={0}>All</option>
          <option value={40}>Suspicious+</option>
          <option value={70}>Phishing only</option>
        </select>
      </section>
      <section className="card">
        {error ? <p className="error">{error}</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Risk Score</th>
                <th>Classification</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.affected_domain}</td>
                  <td>{row.risk_score}</td>
                  <td><span className={`pill ${cls(row.risk_score)}`}>{cls(row.risk_score)}</span></td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
