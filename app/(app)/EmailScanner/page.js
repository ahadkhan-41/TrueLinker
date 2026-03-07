"use client";

import { useState } from "react";
import LoadingCard from "@/components/LoadingCard";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import ThreatIndicators from "@/components/ThreatIndicators";
import { api } from "@/lib/api";

export default function EmailScannerPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function scan() {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const payload = await api.scanEmail(content);
      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <h1>Email Scanner</h1>
      <section className="card stack">
        <textarea
          className="input"
          rows={8}
          placeholder="Paste email headers/body..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="row">
          <button className="btn primary" onClick={scan} disabled={loading || !content.trim()}>
            Scan Email
          </button>
        </div>
      </section>

      {loading ? <LoadingCard message="Analyzing email for threats..." /> : null}
      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <section className="card stack">
          <div className="row between wrap">
            <RiskScoreGauge score={result.risk_score} classification={result.classification} />
            <div>
              <p><strong>Domain:</strong> {result.domain}</p>
              <p><strong>Summary:</strong> {result.analysis_summary}</p>
            </div>
          </div>
          <ThreatIndicators items={result.threat_indicators} />
        </section>
      ) : null}
    </div>
  );
}
