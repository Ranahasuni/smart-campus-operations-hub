import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

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

        {/* Public registration is disabled - accounts are created by Admin */}
      </div>
    </div>
  );
}
