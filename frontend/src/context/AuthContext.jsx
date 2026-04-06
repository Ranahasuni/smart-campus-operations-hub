import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:8081';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('sc_token');
    const storedUser  = localStorage.getItem('sc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid credentials');
    }
    const data = await res.json();
    persistSession(data);
    return data;
  };

  const register = async (name, email, password, role = 'STUDENT') => {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    setToken(null);
    setUser(null);
  };

  const persistSession = (data) => {
    localStorage.setItem('sc_token', data.token);
    localStorage.setItem('sc_user', JSON.stringify({
      id:    data.userId,
      name:  data.name,
      email: data.email,
      role:  data.role,
    }));
    setToken(data.token);
    setUser({ id: data.userId, name: data.name, email: data.email, role: data.role });
  };

  /** Authenticated fetch helper — auto-attaches Bearer token */
  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
