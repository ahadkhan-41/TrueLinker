"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function IncidentsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [selected, setSelected] = useState(null);

  async function load() {
    const data = await api.getIncidents();
    setItems(data.incidents || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function patch(id, nextStatus) {
    await api.updateIncident(id, { status: nextStatus });
    load();
  }

  async function remove(id) {
    await api.deleteIncident(id);
    setSelected(null);
    load();
  }

  const filtered = items.filter((item) => {
    if (status !== "all" && item.status !== status) return false;
    if (severity !== "all" && item.severity !== severity) return false;
    return true;
  });

  return (
    <div className="stack">
      <h1>Incidents</h1>
      <section className="card row wrap gap">
        <select className="input select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </section>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Domain</th>
                <th>Risk</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className="clickable">
                  <td>{row.title}</td>
                  <td>{row.type}</td>
                  <td>{row.severity}</td>
                  <td>{row.status}</td>
                  <td>{row.affected_domain}</td>
                  <td>{row.risk_score}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <p className="muted">{selected.description}</p>
            <p><strong>URL:</strong> {selected.affected_url}</p>
            <div className="row wrap gap">
              <button className="btn ghost" onClick={() => patch(selected.id, "acknowledged")}>Acknowledge</button>
              <button className="btn primary" onClick={() => patch(selected.id, "closed")}>Close</button>
              <button className="btn danger" onClick={() => remove(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
