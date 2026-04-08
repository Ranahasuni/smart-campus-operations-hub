import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:8082';

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

  const login = async (campusId, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ campusId, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid credentials');
    }
    const data = await res.json();
    persistSession(data);
    return data.user;
  };

  const register = async (fullName, campusEmail, password, role = 'STUDENT', campusId = '') => {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fullName, campusEmail, password, role, campusId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    persistSession(data);
    return data.user;
  };


  const logout = () => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    setToken(null);
    setUser(null);
  };

  const persistSession = (data) => {
    localStorage.setItem('sc_token', data.token);
    const userInfo = {
      id:          data.user.id,
      fullName:    data.user.fullName,
      campusEmail: data.user.campusEmail,
      role:        data.user.role,
      campusId:    data.user.campusId,
    };
    localStorage.setItem('sc_user', JSON.stringify(userInfo));
    setToken(data.token);
    setUser(userInfo);
  };

  /** Authenticated fetch helper — auto-attaches Bearer token and handles expiration */
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      logout();
      window.location.href = '/login?expired=true';
      throw new Error('Session expired');
    }

    return res;
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
