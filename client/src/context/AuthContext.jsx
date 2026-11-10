import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, setAuthToken, getApiErrorMessage } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await apiClient.post("/auth/register", { name, email, password });
    setAuthToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    setAuthToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await apiClient.patch("/auth/profile", payload);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const deleteAccount = useCallback(async () => {
    await apiClient.delete("/auth/account");
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout, updateProfile, deleteAccount, refresh: bootstrap }),
    [user, loading, register, login, logout, updateProfile, deleteAccount, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getApiErrorMessage };
