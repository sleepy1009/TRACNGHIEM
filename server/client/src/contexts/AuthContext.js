import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedDisplayName  = localStorage.getItem('displayName');
    if (token) {
      setIsAuthenticated(true);
      setDisplayName(storedDisplayName);
    }
  }, []);

  const login = (token, userDisplayName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('displayName', userDisplayName); 
    setIsAuthenticated(true);
    setDisplayName(userDisplayName);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    setIsAuthenticated(false);
    setDisplayName('');
  };
  const updateDisplayName = (newDisplayName) => {
    setDisplayName(newDisplayName);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, displayName, login, logout, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);