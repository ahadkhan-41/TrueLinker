"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ReportSpamModal({ open, onClose, scan }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!open || !scan) return null;

  async function submit() {
    setSaving(true);
    try {
      await api.createReport({
        url: scan.url,
        riskScore: scan.risk_score,
        aiClassification: scan.classification,
        userClassification: "phishing",
        notes,
      });
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Report as Spam</h3>
        <p className="muted">{scan.url}</p>
        <p className="muted">AI classification: {scan.classification}</p>
        <textarea
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          rows={4}
        />
        {done ? <p className="ok">Report submitted.</p> : null}
        <div className="row gap">
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn primary" onClick={submit} disabled={saving}>
            {saving ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
