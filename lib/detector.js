/**
 * Real-time phishing detection: URL & text feature extraction + ML-style scoring.
 * Uses research-backed heuristics and weighted scoring (no external API).
 */

// Suspicious TLDs often used in phishing
const SUSPICIOUS_TLDS = new Set([
  "tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click",
  "link", "online", "site", "website", "space", "pw", "cc", "ru",
  "su", "buzz", "rest", "fit", "loan", "win", "racing", "stream"
]);

// Keywords in URL that often appear in phishing
const PHISH_KEYWORDS = [
  "login", "signin", "sign-in", "account", "verify", "secure",
  "bank", "paypal", "amazon", "apple", "microsoft", "netflix",
  "update", "suspend", "confirm", "urgent", "click", "password",
  "credential", "ssn", "tax", "refund", "prize", "winner"
];

// Shortening / redirect services (higher risk when URL is only short link)
const SHORT_DOMAINS = new Set([
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd",
  "buff.ly", "adf.ly", "j.mp", "tr.im", "cutt.ly", "short.io"
]);

function tryParseUrl(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL("https://" + trimmed);
    } catch {
      return null;
    }
  }
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

/**
 * Extract numeric features and flags from a URL for scoring.
 */
export function extractUrlFeatures(urlString) {
  const url = tryParseUrl(urlString);
  if (!url) return null;

  const host = url.hostname.toLowerCase();
  const path = url.pathname + url.search;
  const fullUrl = url.href;
  const domainParts = host.split(".");

  // Subdomains count (e.g. a.b.c.evil.com => 4)
  const numSubdomains = Math.max(0, domainParts.length - 2);
  const tld = domainParts[domainParts.length - 1] || "";

  // IP as hostname
  const ipV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hasIp = ipV4.test(host) || host.startsWith("[") || /^\[?[\da-f:.]+\]?$/i.test(host);

  // Hyphens in domain (legit sites rarely have many)
  const hyphenCount = (host.match(/-/g) || []).length;

  // Digits in hostname
  const digitCount = (host.replace(/\D/g, "").length);

  // Suspicious TLD
  const suspiciousTld = SUSPICIOUS_TLDS.has(tld);

  // HTTPS
  const hasHttps = url.protocol === "https:";

  // Suspicious keywords in host + path
  const lower = (host + path).toLowerCase();
  const keywordHits = PHISH_KEYWORDS.filter((k) => lower.includes(k));

  // Shortener
  const isShortener = domainParts.length >= 2 &&
    SHORT_DOMAINS.has(domainParts.slice(-2).join(".")) ||
    SHORT_DOMAINS.has(host);

  // Unusual symbols
  const hasAtSymbol = fullUrl.includes("@");
  const doubleSlashInPath = (path.match(/\/[^/]*\/\//) !== null);

  // URL length (long = more suspicious)
  const urlLength = fullUrl.length;

  return {
    urlLength,
    numSubdomains,
    hasIp,
    hyphenCount,
    digitCount,
    suspiciousTld,
    hasHttps,
    keywordHits: keywordHits.length,
    keywords: keywordHits,
    isShortener,
    hasAtSymbol,
    doubleSlashInPath,
    host,
    path,
  };
}

/**
 * Compute risk score 0–100 from features (higher = more likely phishing).
 * Weights tuned to approximate ML-style decision boundary.
 */
function scoreUrlFeatures(features) {
  let score = 0;

  if (features.hasIp) score += 25;
  if (features.suspiciousTld) score += 18;
  if (features.hasAtSymbol) score += 22;
  if (features.doubleSlashInPath) score += 15;

  score += Math.min(features.numSubdomains * 6, 20);
  score += Math.min(features.hyphenCount * 4, 12);
  score += Math.min(features.digitCount * 2, 10);
  score += Math.min(features.keywordHits * 5, 25);
  if (features.isShortener) score += 12;
  if (features.urlLength > 100) score += 8;
  if (features.urlLength > 150) score += 6;

  if (features.hasHttps) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyze URL and return risk result with explanation.
 */
export function analyzeUrl(urlString) {
  const features = extractUrlFeatures(urlString);
  if (!features) {
    return {
      valid: false,
      error: "Invalid or empty URL",
      score: null,
      riskLevel: null,
      details: [],
    };
  }

  const score = scoreUrlFeatures(features);
  let riskLevel;
  if (score >= 70) riskLevel = "high";
  else if (score >= 40) riskLevel = "medium";
  else riskLevel = "low";

  const details = [];
  if (features.hasIp) details.push({ text: "URL uses IP address instead of domain", risk: "high" });
  if (features.suspiciousTld) details.push({ text: `Suspicious TLD (${features.host.split(".").pop()})`, risk: "high" });
  if (features.hasAtSymbol) details.push({ text: "Unusual @ symbol in URL", risk: "high" });
  if (features.keywordHits > 0) details.push({ text: `Phishing-related keywords: ${features.keywords.join(", ")}`, risk: features.keywordHits > 2 ? "high" : "medium" });
  if (features.numSubdomains > 1) details.push({ text: `Multiple subdomains (${features.numSubdomains})`, risk: "medium" });
  if (features.hyphenCount >= 2) details.push({ text: `Multiple hyphens in domain (${features.hyphenCount})`, risk: "medium" });
  if (features.isShortener) details.push({ text: "URL shortening service (link target unknown)", risk: "medium" });
  if (features.hasHttps) details.push({ text: "Valid HTTPS", risk: "low" });

  return {
    valid: true,
    url: urlString.trim(),
    score,
    riskLevel,
    details,
    features: {
      host: features.host,
      hasHttps: features.hasHttps,
      keywordCount: features.keywordHits,
    },
  };
}

/**
 * Analyze email/plain text for phishing indicators (links + urgency/keywords).
 */
export function analyzeEmailText(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, error: "No text provided", links: [], keywords: [], riskScore: 0 };
  }

  const lower = text.toLowerCase();
  const links = [];
  const urlRegex = /https?:\/\/[^\s<>"']+|(?:www\.)[^\s<>"']+/gi;
  let m;
  const seen = new Set();
  while ((m = urlRegex.exec(text)) !== null) {
    const raw = m[0];
    const normalized = raw.startsWith("www.") ? "https://" + raw : raw;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      const result = analyzeUrl(normalized);
      if (result.valid) links.push({ url: result.url, ...result });
    }
  }

  const urgencyKeywords = ["urgent", "immediately", "suspend", "verify", "confirm", "account", "password", "click here", "act now"];
  const foundKeywords = urgencyKeywords.filter((k) => lower.includes(k));

  const linkScore = links.length ? Math.max(...links.map((l) => l.score)) : 0;
  const keywordScore = Math.min(foundKeywords.length * 12, 40);
  const riskScore = Math.min(100, Math.round(linkScore * 0.7 + keywordScore * 0.3));

  return {
    valid: true,
    links,
    keywords: foundKeywords,
    riskScore,
    riskLevel: riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low",
  };
}

/**
 * Analyze a bare domain or IP address (infrastructure-level check).
 */
export function analyzeDomainOrIp(input) {
  if (!input || typeof input !== "string" || !input.trim()) {
    return {
      valid: false,
      error: "Domain or IP is required",
      score: null,
      riskLevel: null,
      details: [],
    };
  }

  const result = analyzeUrl(input.trim());

  if (!result.valid) {
    return {
      ...result,
      error: "Invalid domain or IP address",
    };
  }

  return {
    ...result,
    domain: result.features?.host || input.trim(),
  };
}
