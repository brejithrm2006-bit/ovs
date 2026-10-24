import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('votepulse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('votepulse_token'));
  const [loading, setLoading] = useState(true);

  // Initialize or refresh session
  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (isMounted && res.user) {
            setUser(res.user);
            localStorage.setItem('votepulse_user', JSON.stringify(res.user));
          }
        } catch (err) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('votepulse_token');
            localStorage.removeItem('votepulse_user');
          }
        }
      }
      if (isMounted) setLoading(false);
    }

    loadUser();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('votepulse_auth_expired', handleExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('votepulse_auth_expired', handleExpired);
    };
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.auth.login(identifier, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('votepulse_token', res.access_token);
    localStorage.setItem('votepulse_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.auth.register(payload);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('votepulse_token', res.access_token);
    localStorage.setItem('votepulse_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('votepulse_token');
      localStorage.removeItem('votepulse_user');
    }
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await api.auth.getMe();
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('votepulse_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch {
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCandidate: user?.role === 'candidate',
    isVoter: user?.role === 'voter',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
