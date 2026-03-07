import { analyzeEmailText, analyzeUrl } from "@/lib/detector";

const now = () => new Date().toISOString();

const state = {
  users: [
    { id: "u-1", email: "admin@truelinker.ai", password: "admin123", role: "admin", status: "registered", name: "Admin User" },
    { id: "u-2", email: "analyst@truelinker.ai", password: "analyst123", role: "analyst", status: "registered", name: "Security Analyst" },
    { id: "u-3", email: "pending@truelinker.ai", password: "pending123", role: "analyst", status: "pending", name: "Pending User" },
  ],
  scans: [],
  incidents: [
    {
      id: "inc-1",
      title: "Credential Harvesting Page",
      type: "phishing_url",
      severity: "critical",
      status: "open",
      description: "Detected fake banking login form.",
      affected_url: "http://secure-banking-login.xyz/verify",
      affected_domain: "secure-banking-login.xyz",
      risk_score: 92,
      created_at: now(),
    },
  ],
  blocklist: [
    { id: "blk-1", value: "secure-banking-login.xyz", addedBy: "admin@truelinker.ai", addedAt: now() },
  ],
  reports: [],
};

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function scoreToClassification(score) {
  if (score >= 70) return "phishing";
  if (score >= 40) return "suspicious";
  return "safe";
}

function riskToSeverity(score) {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function featureMap(result) {
  const host = result.features?.host || "";
  const suspiciousChars = /[@]|--|%40/.test(result.url || "");
  const subdomains = host.split(".").length > 3;
  const ipBased = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const urlLength = (result.url || "").length > 75;
  const tld = host.split(".").pop() || "";
  const suspiciousTld = ["xyz", "top", "click", "work", "gq", "tk", "ml", "ga", "cf"].includes(tld);
  const suspiciousKeywords = (result.details || []).some((d) => d.text.toLowerCase().includes("keyword"));
  const brandImpersonation = /paypal|amazon|apple|microsoft|bank|netflix/.test(result.url.toLowerCase());

  return {
    HTTPS: Boolean(result.features?.hasHttps),
    "Suspicious Chars": suspiciousChars,
    Subdomains: subdomains,
    "IP Based": ipBased,
    "URL Length": urlLength,
    "Suspicious TLD": suspiciousTld,
    "Suspicious Keywords": suspiciousKeywords,
    "Brand Impersonation": brandImpersonation,
  };
}

export function authenticate(email, password) {
  const user = state.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase() && u.password === password);
  if (!user) return null;
  const { password: _ignored, ...safeUser } = user;
  return safeUser;
}

export function getUserByEmail(email) {
  const user = state.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) return null;
  const { password: _ignored, ...safeUser } = user;
  return safeUser;
}

export function listScans() {
  return state.scans.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function listIncidents() {
  return state.incidents.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function listBlocklist() {
  return state.blocklist.slice().sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));
}

export function listReports() {
  return state.reports.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createBlocklist(value, addedBy) {
  const entry = {
    id: uid("blk"),
    value,
    addedBy: addedBy || "system",
    addedAt: now(),
  };
  state.blocklist.push(entry);
  return entry;
}

export function deleteBlocklist(id) {
  const idx = state.blocklist.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  state.blocklist.splice(idx, 1);
  return true;
}

export function createReport(payload) {
  const report = {
    id: uid("rep"),
    url: payload.url,
    reportedBy: payload.reportedBy || "anonymous",
    riskScore: payload.riskScore || 0,
    aiClassification: payload.aiClassification || "unknown",
    userClassification: payload.userClassification || "phishing",
    notes: payload.notes || "",
    status: "pending",
    createdAt: now(),
  };
  state.reports.push(report);
  return report;
}

export function updateReport(id, patch) {
  const report = state.reports.find((item) => item.id === id);
  if (!report) return null;
  Object.assign(report, patch, { updatedAt: now() });
  return report;
}

export function updateIncident(id, patch) {
  const incident = state.incidents.find((item) => item.id === id);
  if (!incident) return null;
  Object.assign(incident, patch, { updated_at: now() });
  return incident;
}

export function deleteIncident(id) {
  const idx = state.incidents.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  state.incidents.splice(idx, 1);
  return true;
}

export function scanUrl(rawUrl) {
  const result = analyzeUrl(rawUrl);
  if (!result.valid) {
    return { error: result.error || "Invalid URL" };
  }

  const classification = scoreToClassification(result.score);
  const scan = {
    id: uid("scan"),
    kind: "url",
    url: result.url,
    domain: result.features?.host || "unknown",
    risk_score: result.score,
    classification,
    threat_indicators: (result.details || []).map((d) => d.text),
    features: featureMap(result),
    analysis_summary:
      classification === "phishing"
        ? "Multiple high-confidence phishing indicators detected."
        : classification === "suspicious"
          ? "Mixed trust indicators detected. Manual verification recommended."
          : "No major phishing indicators were detected.",
    created_at: now(),
  };

  state.scans.push(scan);

  if (classification === "phishing") {
    state.incidents.push({
      id: uid("inc"),
      title: "Phishing URL Detected",
      type: "phishing_url",
      severity: riskToSeverity(scan.risk_score),
      status: "open",
      description: scan.analysis_summary,
      affected_url: scan.url,
      affected_domain: scan.domain,
      risk_score: scan.risk_score,
      created_at: scan.created_at,
    });
  }

  return scan;
}

export function scanEmail(content) {
  const result = analyzeEmailText(content);
  if (!result.valid) {
    return { error: result.error || "Invalid email payload" };
  }

  const strongest = result.links[0];
  const domain = strongest?.features?.host || "email-content";
  const risk_score = result.riskScore;
  const classification = scoreToClassification(risk_score);

  const scan = {
    id: uid("scan"),
    kind: "email",
    url: strongest?.url || "embedded-content",
    domain,
    risk_score,
    classification,
    threat_indicators: [
      ...result.keywords.map((k) => `Urgency keyword: ${k}`),
      ...result.links.filter((l) => l.riskLevel !== "low").map((l) => `Suspicious link: ${l.url}`),
    ],
    features: {
      HTTPS: strongest?.features?.hasHttps ?? false,
      "Suspicious Chars": Boolean(strongest && /[@]/.test(strongest.url)),
      Subdomains: Boolean(strongest && strongest.features?.host?.split(".").length > 3),
      "IP Based": Boolean(strongest && /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(strongest.features?.host || "")),
      "URL Length": Boolean(strongest && strongest.url.length > 75),
      "Suspicious TLD": Boolean(strongest && /(xyz|top|click|work)$/i.test(strongest.features?.host || "")),
      "Suspicious Keywords": result.keywords.length > 0,
      "Brand Impersonation": /bank|paypal|amazon|apple|microsoft/.test((content || "").toLowerCase()),
    },
    analysis_summary:
      classification === "phishing"
        ? "Email contains strong phishing patterns and suspicious intent language."
        : classification === "suspicious"
          ? "Email carries mixed indicators and should be reviewed manually."
          : "Email appears low risk based on current indicators.",
    created_at: now(),
  };

  state.scans.push(scan);

  if (classification === "phishing") {
    state.incidents.push({
      id: uid("inc"),
      title: "Phishing Email Detected",
      type: "phishing_url",
      severity: riskToSeverity(scan.risk_score),
      status: "open",
      description: scan.analysis_summary,
      affected_url: scan.url,
      affected_domain: scan.domain,
      risk_score: scan.risk_score,
      created_at: scan.created_at,
    });
  }

  return scan;
}
