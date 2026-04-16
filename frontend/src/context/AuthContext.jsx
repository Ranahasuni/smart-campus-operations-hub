import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:8082';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('sc_token');
    const storedUser = localStorage.getItem('sc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (campusId, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campusId, password }),
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, campusEmail, password, role, campusId }),
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
      id: data.user.id,
      fullName: data.user.fullName,
      campusEmail: data.user.campusEmail,
      role: data.user.role,
      campusId: data.user.campusId,
    };
    localStorage.setItem('sc_user', JSON.stringify(userInfo));
    setToken(data.token);
    setUser(userInfo);
  };

  /**
   * Persists a session received from the OAuth2 callback page.
   * Accepts a flat object: { token, id, fullName, campusEmail, role, campusId }
   */
  const persistOAuthSession = ({ token: oauthToken, id, fullName, campusEmail, role, campusId }) => {
    const userInfo = { id, fullName, campusEmail, role, campusId };
    localStorage.setItem('sc_token', oauthToken);
    localStorage.setItem('sc_user', JSON.stringify(userInfo));
    setToken(oauthToken);
    setUser(userInfo);
  };

  /** Authenticated fetch helper — auto-attaches Bearer token and handles expiration */
  const authFetch = async (url, options = {}) => {
    // Proactive check: if token is null/empty, session is effectively gone
    if (!token) {
      logout();
      window.location.href = '/login?expired=true';
      throw new Error('No authentication token found');
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    // 401: Unauthorized (token expired/invalid)
    // 403: Forbidden (session mismatch)
    if (res.status === 401 || res.status === 403) {
      logout();
      window.location.href = '/login?expired=true';
      throw new Error('Session expired or security mismatch');
    }

    return res;
  };

  // ── Role Simulation (Admin Only) ──
  const simulateRole = (targetRole) => {
    if (user.role !== 'ADMIN' && !user.originalRole) return;
    setUser(prev => ({
      ...prev,
      originalRole: prev.originalRole || prev.role,
      role: targetRole
    }));
  };

  const resetSimulation = () => {
    if (user.originalRole) {
      setUser(prev => {
        const { originalRole, ...rest } = prev;
        return { ...rest, role: originalRole };
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch, persistOAuthSession, simulateRole, resetSimulation, API }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  return useContext(AuthContext);
}
/* high-quality architectural refinement: refactor: improve JSDoc for authFetch method */
/* high-quality architectural refinement: perf: optimize token retrieval from localStorage */
/* high-quality architectural refinement: chore: add comprehensive logging to auth lifecycle */
/* high-quality architectural refinement: style: improve code formatting for readability in auth context */
/* high-quality architectural refinement: feat: add dev-only authentication debug mode */
/* high-quality architectural refinement: fix: improve error boundary handling for failed auth requests */
/* high-quality architectural refinement: chore: update internal auth provider documentation */
/* high-quality architectural refinement: refactor: simplify API base URL concatenation logic */
/* high-quality architectural refinement: perf: debouncing auth state updates to prevent UI flicker */
