"use client";

import { useState } from "react";
import LoadingCard from "@/components/LoadingCard";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import ThreatIndicators from "@/components/ThreatIndicators";
import ReportSpamModal from "@/components/ReportSpamModal";
import { api } from "@/lib/api";

const examples = [
  "https://google.com",
  "http://secure-banking-login.xyz/verify",
  "http://192.168.1.2/login",
];

export default function UrlScannerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);

  async function onScan(nextUrl = url) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = await api.scanUrl(nextUrl);
      setResult(payload);
      setUrl(nextUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <h1>URL Scanner</h1>
      <section className="card stack">
        <div className="row gap">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder="Enter URL to scan..." />
          <button className="btn primary" onClick={() => onScan()} disabled={loading}>
            Scan
          </button>
        </div>
        <div className="row wrap gap">
          {examples.map((example) => (
            <button key={example} className="btn chip-btn" onClick={() => onScan(example)} disabled={loading}>
              {example}
            </button>
          ))}
        </div>
      </section>

      {loading ? <LoadingCard message="Analyzing URL for threats..." /> : null}
      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <section className="card stack">
          <div className="row between wrap">
            <RiskScoreGauge score={result.risk_score} classification={result.classification} />
            <div className="stack">
              <p><strong>Scanned URL:</strong> {result.url}</p>
              <p><strong>Domain:</strong> {result.domain}</p>
              <p>{result.analysis_summary}</p>
              <button className="btn danger" onClick={() => setShowReport(true)}>Report as Spam</button>
            </div>
          </div>
          <h3>Threat Indicators</h3>
          <ThreatIndicators items={result.threat_indicators} />
          <h3>Feature Analysis</h3>
          <div className="grid features">
            {Object.entries(result.features).map(([name, active]) => (
              <div key={name} className="feature-item">
                <span>{name}</span>
                <span className={active ? "ok" : "error"}>{active ? "Yes" : "No"}</span>
              </div>
            ))}
          </div>
          <ReportSpamModal open={showReport} onClose={() => setShowReport(false)} scan={result} />
        </section>
      ) : null}
    </div>
  );
}
