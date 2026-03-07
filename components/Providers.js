"use client";

import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";

function Gate({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-page text-muted">
        <p>Loading security suite...</p>
      </div>
    );
  }

  return children;
}

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate>{children}</Gate>
      </AuthProvider>
    </ThemeProvider>
  );
}
