import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const BACKEND = 'http://localhost:8082';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    campusId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check for expiration msg in URL
  const searchParams = new URLSearchParams(window.location.search);
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login(formData.campusId, formData.password);
      
      // Redirect based on role
      if (userData.role === 'ADMIN' || userData.role === 'LECTURER') {
        navigate('/admin');
      } else if (['STAFF', 'TECHNICIAN'].includes(userData.role)) {
        navigate('/staff');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Spring Security's OAuth2 initiation endpoint for Google
    window.location.href = `${BACKEND}/oauth2/authorization/google`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header text-center">
          <h1>Smart Campus</h1>
          <p>Sign in with your Campus ID</p>
        </div>

        {isExpired && !error && (
          <div className="auth-alert auth-alert-warning" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#fbbf24', padding: '12px', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>Session expired for security. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="auth-alert auth-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campus ID Input */}
          <div className="input-group">
            <label htmlFor="campusId">Campus ID</label>
            <div className="input-wrapper">
              <input
                id="campusId"
                type="text"
                className="input-field"
                value={formData.campusId}
                onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                placeholder="e.g. IT23864306 or LEC102"
                required
              />
              <User size={18} className="input-icon" />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="input-icon" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>students — continue with</span>
        </div>

        {/* Google OAuth2 Button — Students Only */}
        <button
          id="btn-google-login"
          onClick={handleGoogleLogin}
          className="btn-google"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Use your <strong style={{ color: '#94a3b8' }}>@my.sliit.lk</strong> account
        </p>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

