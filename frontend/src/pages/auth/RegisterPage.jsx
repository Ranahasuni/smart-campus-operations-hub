import React, { useState } from 'react';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}

import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, CreditCard, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    campusEmail: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    campusId: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Available roles from backend Role enum
  const roles = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'STAFF', label: 'Campus Staff (Caretaker)' },
    { value: 'TECHNICIAN', label: 'Technician' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.fullName, formData.campusEmail, formData.password, formData.role, formData.campusId);
      
      setSuccess('Registration successful! Launching your smart campus hub...');
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h1>Join Hub</h1>
          <p>Create your smart campus account</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ background: '#FFFFFF', padding: '48px 40px', borderRadius: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Account Created!</h2>
              <p style={{ color: '#6B7281', fontSize: '1.05rem', fontWeight: '500', marginBottom: '40px', lineHeight: '1.5' }}>{success}</p>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#111827', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', padding: '10px 20px' }}>Enter Hub</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                required
              />
              <User size={18} className="input-icon" />
            </div>
          </div>

          {/* Campus Email */}
          <div className="input-group">
            <label htmlFor="campusEmail">Campus Email</label>
            <div className="input-wrapper">
              <input
                id="campusEmail"
                type="email"
                value={formData.campusEmail}
                onChange={(e) => setFormData({ ...formData, campusEmail: e.target.value })}
                placeholder="name@campus.edu"
                required
              />
              <Mail size={18} className="input-icon" />
            </div>
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label htmlFor="role">Account Type</label>
            <div className="input-wrapper">
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <Shield size={18} className="input-icon" />
            </div>
          </div>

          {/* Campus ID */}
          <div className="input-group">
            <label htmlFor="campusId">Campus ID</label>
            <div className="input-wrapper">
              <input
                id="campusId"
                type="text"
                value={formData.campusId}
                onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                placeholder="e.g. IT23864306 or LEC102"
                required
              />
              <CreditCard size={18} className="input-icon" />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <Lock size={18} className="input-icon" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
