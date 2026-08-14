import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { TOKEN_KEY, USER_KEY } from '../api/client.js';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setInitializing(false);
  }, []);

  const persist = useCallback((auth) => {
    // auth = { token, tokenType, userID, name, email, role }
    const nextUser = {
      userID: auth.userID,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    };
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(auth.token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const auth = await authApi.login(credentials);
      return persist(auth);
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    // Registration returns AuthResponse but we intentionally do NOT auto-login;
    // the flow redirects the user to /login per spec.
    return authApi.register(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role || null,
      isAuthenticated: Boolean(token && user),
      initializing,
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
