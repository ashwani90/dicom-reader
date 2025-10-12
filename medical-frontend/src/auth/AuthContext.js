// src/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const res = await api.get('/auth/user/'); // cookies sent automatically
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
    // optional: set up interval to refresh access token before expiry
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    // server sets cookies; now fetch user
    await loadUser();
    return res;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register/', payload);
    return res;
  };

  const logout = async () => {
    await api.post('/auth/logout/');
    setUser(null);
  };

  const refresh = async () => {
    try {
      await api.post('/auth/refresh/');
      // after refresh, load user to ensure authorization
      await loadUser();
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
