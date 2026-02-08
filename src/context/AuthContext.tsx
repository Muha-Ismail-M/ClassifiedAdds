import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateToken, logout as dbLogout, generateToken, validateAdminCredentials } from '../lib/database';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    const valid = validateToken();
    setIsAuthenticated(valid);
    return valid;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (username: string, password: string): boolean => {
    if (validateAdminCredentials(username, password)) {
      generateToken();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    dbLogout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
