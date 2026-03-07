const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...JSON_HEADERS,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export const api = {
  getCurrentUser: () => request("/api/auth/me", { method: "GET" }),
  login: (credentials) => request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  scanUrl: (url) => request("/api/scan/url", { method: "POST", body: JSON.stringify({ url }) }),
  scanEmail: (email_content) => request("/api/scan/email", { method: "POST", body: JSON.stringify({ email_content }) }),
  getIncidents: () => request("/api/incidents", { method: "GET" }),
  updateIncident: (id, patch) => request(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteIncident: (id) => request(`/api/incidents/${id}`, { method: "DELETE" }),
  getBlocklist: () => request("/api/blocklist", { method: "GET" }),
  addBlocklist: (value) => request("/api/blocklist", { method: "POST", body: JSON.stringify({ value }) }),
  removeBlocklist: (id) => request(`/api/blocklist/${id}`, { method: "DELETE" }),
  getReports: () => request("/api/reports", { method: "GET" }),
  createReport: (payload) => request("/api/reports", { method: "POST", body: JSON.stringify(payload) }),
  updateReport: (id, patch) => request(`/api/reports/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};
