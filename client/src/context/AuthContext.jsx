import { createContext, useEffect, useMemo, useState } from "react";
import { getMyProfileApi } from "../api/authApi";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await getMyProfileApi();
        setUser(data?.data?.user || null);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = (tokenValue, userData) => {
  localStorage.setItem("token", tokenValue);

  setUser({
    ...userData,
    roleType: userData?.role || userData?.roleType,
  });
};

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}