import React from 'react';
import { useNavigate } from 'react-router-dom';

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


export default function FormButtons({ isEdit, loading }) {
  const navigate = useNavigate();

  return (
    <div className="form-actions" style={{ display: 'flex', width: '100%', gap: '20px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate('/admin/resources')}
        disabled={loading}
        style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: '800', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', transition: 'all 0.25s' }}
      >
        Cancel Operations
      </button>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: '800', background: 'var(--brand-red-gradient)', color: '#ffffff', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-md)', transition: 'all 0.25s' }}
      >
        {loading ? 'Finalizing Sync...' : (isEdit ? 'Save Changes' : 'Register Faculty')}
      </button>
    </div>
  );
}
