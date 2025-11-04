import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // 1. Importa o useCallback
import * as apiService from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await apiService.loginUser(username, password);
    const newSessionId = response.data.sessionId;
    localStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    return newSessionId;
  };
  const logout = useCallback(() => {
    localStorage.removeItem('sessionId');
    setSessionId(null);
  }, []);

  const authValue = {
    sessionId,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};