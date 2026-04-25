import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const BACKEND = 'http://127.0.0.1:8082';

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
        navigate('/profile');
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    // Redirect to Spring Security's OAuth2 initiation endpoint for Microsoft
    window.location.href = `${BACKEND}/oauth2/authorization/microsoft`;
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
          <span>or continue with</span>
        </div>

        {/* Microsoft OAuth2 Button (Disabled until credentials configured) */}
        <button
          id="btn-microsoft-login"
          onClick={handleMicrosoftLogin}
          className="btn-microsoft"
          style={{ 
            borderColor: 'rgba(100, 116, 139, 0.4)',
            background: 'rgba(100, 116, 139, 0.05)',
            opacity: 0.6,
            cursor: 'not-allowed'
          }}
          type="button"
          disabled
          title="Microsoft Sign-in is coming soon"
        >
          <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <rect fill="#f3f3f3" width="10.5" height="10.5"/>
            <rect fill="#f3f3f3" x="12.5" width="10.5" height="10.5"/>
            <rect fill="#f3f3f3" y="12.5" width="10.5" height="10.5"/>
            <rect fill="#f3f3f3" x="12.5" y="12.5" width="10.5" height="10.5"/>
            <path fill="#f25022" d="M0 0h10.5v10.5H0z"/>
            <path fill="#7fba00" d="M12.5 0H23v10.5H12.5z"/>
            <path fill="#00a1f1" d="M0 12.5h10.5V23H0z"/>
            <path fill="#ffb900" d="M12.5 12.5H23V23H12.5z"/>
          </svg>
          Continue with Microsoft (Coming Soon)
        </button>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

