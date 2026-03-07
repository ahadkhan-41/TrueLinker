"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);

  async function load() {
    const data = await api.getReports();
    setItems(data.reports || []);
  }

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/access-restricted");
      return;
    }
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, router]);

  async function action(id, status) {
    await api.updateReport(id, { status });
    load();
  }

  return (
    <div className="stack">
      <h1>Admin Review</h1>
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Reported By</th>
                <th>Risk Score</th>
                <th>AI Classification</th>
                <th>User Classification</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.url}</td>
                  <td>{row.reportedBy}</td>
                  <td>{row.riskScore}</td>
                  <td>{row.aiClassification}</td>
                  <td>{row.userClassification}</td>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="row gap">
                    <button className="btn primary" onClick={() => action(row.id, "confirmed")}>Confirm</button>
                    <button className="btn ghost" onClick={() => action(row.id, "dismissed")}>Dismiss</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
