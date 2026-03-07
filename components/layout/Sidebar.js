"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/Dashboard", label: "Dashboard", icon: "◫" },
  { href: "/URLScanner", label: "URL Scanner", icon: "🔗" },
  { href: "/EmailScanner", label: "Email Scanner", icon: "✉" },
  { href: "/ThreatMonitor", label: "Threat Monitor", icon: "⚠" },
  { href: "/Incidents", label: "Incidents", icon: "●" },
  { href: "/Blocklist", label: "Blocklist", icon: "⛔" },
  { href: "/AdminReview", label: "Admin Review", icon: "⚑", admin: true },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {open ? <button className="overlay md:hidden" onClick={onClose} aria-label="Close menu" /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">🛡</div>
          <div>
            <p className="brand-title">TrueLinker</p>
            <p className="brand-subtitle">AI Security Suite</p>
          </div>
        </div>

        <div className="status-card">
          <div className="status-dot" />
          <div>
            <p className="status-title">System Active</p>
            <p className="status-subtitle">Real-time protection enabled</p>
          </div>
        </div>

        <p className="nav-label">Navigation</p>
        <nav className="nav-list">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.admin ? <span className="badge-admin">ADMIN</span> : null}
                {active ? <span className="nav-chevron">›</span> : null}
              </Link>
            );
          })}
        </nav>

        <button className="signout" onClick={logout}>
          Sign Out
        </button>
      </aside>
    </>
  );
}
