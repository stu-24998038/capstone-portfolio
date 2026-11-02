import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const TOKEN_KEY = 'folio.token';
const AuthContext = createContext(null);

const readStoredToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private browsing. The in-memory session
    // still works for the current tab.
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(readStoredToken()));

  useEffect(() => {
    let active = true;

    if (!token) {
      setUser(null);
      setInitializing(false);
      return () => {
        active = false;
      };
    }

    setInitializing(true);
    api
      .me(token)
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        persistToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const startSession = useCallback((data) => {
    persistToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setInitializing(false);
    return data.user;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await api.login(credentials);
      return startSession(data);
    },
    [startSession]
  );

  const register = useCallback(
    async (details) => {
      const data = await api.register(details);
      return startSession(data);
    },
    [startSession]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setToken(null);
    setUser(null);
    setInitializing(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
