// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe, clearToken } from '../services/api';
import { registerForPushNotifications } from '../services/notifications';

interface User {
  user_id:       string;
  name:          string;
  email:         string;
  role:          string;
  tier:          string;
  truscore:      number;
  serial:        string;
  jobs_completed:number;
  success_rate:  number;
  avg_rating:    number;
  balance:       number;
  total_earned:  number;
  is_verified:   boolean;
  avatar_url?:   string;
}

interface AuthCtx {
  user:      User | null;
  loading:   boolean;
  loggedIn:  boolean;
  refresh:   () => Promise<void>;
  logout:    () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true, loggedIn: false,
  refresh: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const token = await SecureStore.getItemAsync('veritas_token');
      if (!token) { setUser(null); setLoading(false); return; }
      const me = await getMe();
      setUser(me);
      // Register push token after successful login
      registerForPushNotifications().catch(() => {});
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loggedIn: !!user, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
