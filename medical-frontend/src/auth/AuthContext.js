// src/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import api from '../api';
import { sendRequest } from '../request';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const res = await sendRequest('get', '/api/auth/user/');
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
    const res = await sendRequest('post', '/api/token/', { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    // server sets cookies; now fetch user
    await loadUser();
    return res;
  };

  const register = async (payload) => {
    const res = await sendRequest('post', '/api/auth/register/', payload);
    return res;
  };

  const logout = async () => {
    await sendRequest('post', '/api/auth/logout/');
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const refresh = async () => {
    try {
      await sendRequest('post', '/api/auth/refresh/');
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
