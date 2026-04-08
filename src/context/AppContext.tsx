import React, { createContext, useContext, useState, useEffect } from 'react';
import { petsApi, newsApi, fundraisersApi, settingsApi, authApi } from '../api/client';

interface AppContextType {
  pets: any[];
  news: any[];
  fundraisers: any[];
  settings: any;
  loading: boolean;
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  updateUser: (data: any) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [pets, setPets] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jandos_token'));

  // Restore user session on mount if token exists
  useEffect(() => {
    if (token && !user) {
      authApi.me()
        .then(({ user: userData }) => setUser(userData))
        .catch(() => {
          // Token invalid/expired — let tryRefresh handle it on next request
          // Don't clear token here; the request interceptor will handle it
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for forced logout events (from request interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('jandos:logout', handleLogout);
    return () => window.removeEventListener('jandos:logout', handleLogout);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [petsRes, fundraisersRes, newsRes, settingsRes] = await Promise.all([
        petsApi.getAll(),
        fundraisersApi.getAll(),
        newsApi.getAll(),
        settingsApi.getAll(),
      ]);

      setPets(petsRes.data || []);
      setFundraisers(fundraisersRes || []);
      setNews(newsRes.data || []);
      setSettings(settingsRes || {});
    } catch {
      // silently fail — UI stays with empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('jandos_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: any) => {
    setUser((prev: any) => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider value={{
      pets,
      news,
      fundraisers,
      settings,
      loading,
      user,
      token,
      login,
      logout,
      updateUser,
      refreshData: fetchData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
