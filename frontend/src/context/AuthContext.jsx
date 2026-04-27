import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, register as registerApi } from '../api/auth';
import api from '../api/axiosInstance';

function isTokenValid(token) {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => {
    const token = localStorage.getItem('access_token');
    // If token exists but is expired, clear it so we start fresh
    if (token && !isTokenValid(token)) {
      // Don't remove refresh_token - axiosInstance will try to refresh it
      return null;
    }
    return token || null;
  });

  // Keep axios defaults in sync with context token on every change
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem('access_token', accessToken);
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Listen for token updates from the axiosInstance refresh interceptor
  // The interceptor writes a new token to localStorage; sync it back into context
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('access_token');
      if (token && isTokenValid(token)) {
        setAccessToken(token);
      } else if (!token) {
        setAccessToken(null);
      }
    };
    // Poll localStorage every 2 seconds to catch token updates from axios interceptor
    // (storage event doesn't fire in the same tab)
    const interval = setInterval(handleStorageChange, 2000);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = Boolean(accessToken) && isTokenValid(accessToken);

  const getUser = useCallback(() => {
    if (!accessToken) return null;
    try { return jwtDecode(accessToken); } catch { return null; }
  }, [accessToken]);

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    // Update axios defaults immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    setAccessToken(data.access);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await registerApi(userData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access}`;
    setAccessToken(data.tokens.access);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, getUser, accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
