"use client";

import { useTheme } from "@/lib/theme";

export default function Header({ onOpenMenu }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <button className="menu-btn md:hidden" onClick={onOpenMenu} aria-label="Open menu">
        ☰
      </button>
      <div className="topbar-right">
        <span className="engine-pill">AI Engine Active</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span className={`theme-knob ${theme === "dark" ? "dark" : ""}`} />
          <span>{theme === "dark" ? "Dark" : "Light"}</span>
        </button>
      </div>
    </header>
  );
}
