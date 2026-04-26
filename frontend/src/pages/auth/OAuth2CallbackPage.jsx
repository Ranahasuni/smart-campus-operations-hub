import { useEffect, useState } from 'react';

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

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * OAuth2 Callback Page — /oauth2/callback
 *
 * The backend's OAuth2AuthenticationSuccessHandler redirects here after a
 * successful Google OAuth2 login, passing token + user info as query params.
 *
 * This component reads those params, persists the session, and redirects
 * the user to the appropriate dashboard based on their role.
 */
export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const { persistOAuthSession } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent multiple executions in Strict Mode
    if (window._oauth_processed) return;
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // If no token and no error, this might be a double-render; just ignore
    if (!token && !params.get('error')) return;

    window._oauth_processed = true;

    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setTimeout(() => {
        window._oauth_processed = false;
        navigate('/login');
      }, 3500);
      return;
    }

    const id         = params.get('id');
    const fullName   = params.get('fullName');
    const campusEmail = params.get('campusEmail');
    const role       = params.get('role');
    const campusId   = params.get('campusId');

    if (!token || !id || !role) {
      setError('Incomplete OAuth2 response received. Redirecting to login...');
      setTimeout(() => {
        window._oauth_processed = false;
        navigate('/login');
      }, 3000);
      return;
    }

    // Persist session using AuthContext helper
    persistOAuthSession({ token, id, fullName, campusEmail, role, campusId });

    // Success! Clear the flag so they can login again later if they log out
    setTimeout(() => { window._oauth_processed = false; }, 5000);

    // Role-based redirect
    if (role === 'ADMIN' || role === 'LECTURER') {
      navigate('/admin');
    } else if (role === 'STAFF' || role === 'TECHNICIAN') {
      navigate('/staff');
    } else {
      navigate('/');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F7F7F7, #F5E6E6)',
      fontFamily: "'Outfit', sans-serif",
      color: '#1F1F1F',
      gap: '1.5rem',
    }}>
      {error ? (
        <>
          <div style={{
            fontSize: '3rem',
            animation: 'pulse 1.5s infinite'
          }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', color: '#f87171', textAlign: 'center', maxWidth: '400px' }}>
            {error}
          </h2>
          <p style={{ color: '#6B7281', fontSize: '0.9rem' }}>Redirecting to login…</p>
        </>
      ) : (
        <>
          {/* Animated spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid rgba(192, 128, 128, 0.2)',
            borderTopColor: '#C08080',
            animation: 'spin 0.8s linear infinite',
          }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600' }}>
            Completing sign-in…
          </h2>
          <p style={{ color: '#6B7281', fontSize: '0.9rem' }}>
            Setting up your campus session
          </p>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
