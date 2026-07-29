import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lionstock_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lionstock_token') || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('lionstock_token', token);
    } else {
      localStorage.removeItem('lionstock_token');
    }
  }, [token]);

  const login = (authData) => {
    const payload = authData?.data ?? authData;
    const nextToken = payload?.token ?? authData?.token ?? null;
    const nextUser = payload?.user ?? authData?.user ?? null;

    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      localStorage.setItem('lionstock_token', nextToken);
    } else {
      localStorage.removeItem('lionstock_token');
    }

    if (nextUser) {
      localStorage.setItem('lionstock_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('lionstock_user');
    }

    navigate('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lionstock_token');
    localStorage.removeItem('lionstock_user');
    navigate('/login');
  };

  const isAuthenticated = () => Boolean(token);

  const hasRole = (role) => user?.role === role;

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated,
      hasRole,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
