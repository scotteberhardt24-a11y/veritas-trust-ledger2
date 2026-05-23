"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  user_id: string;
  name: string;
  email: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (u: User) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) 
{
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("veritas_token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          user_id: payload.userId,
          name: "",
          email: "",
          role: payload.role,
        });
      } catch (e) {
        localStorage.removeItem("veritas_token");
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
