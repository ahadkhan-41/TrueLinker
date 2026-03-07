"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="app-content">
        <Header onOpenMenu={() => setOpen(true)} />
        <main className="main-area">{children}</main>
      </div>
    </div>
  );
}
