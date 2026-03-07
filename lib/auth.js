"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
});

function protectedPath(pathname) {
  return pathname !== "/login";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const result = await api.getCurrentUser();
      setUser(result.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (isLoading) return;
    if (!user && protectedPath(pathname)) {
      router.replace("/login");
      return;
    }
    if (user && pathname === "/login") {
      router.replace("/Dashboard");
      return;
    }
    if (user && user.status !== "registered" && pathname !== "/access-restricted") {
      router.replace("/access-restricted");
    }
  }, [user, pathname, router, isLoading]);

  const login = useCallback(async (credentials) => {
    const result = await api.login(credentials);
    setUser(result.user || null);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
