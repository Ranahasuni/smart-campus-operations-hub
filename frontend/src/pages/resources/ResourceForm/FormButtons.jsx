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
    <div className="form-actions" style={{ display: 'flex', width: '100%', gap: '20px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #6B7281' }}>
      <button
        type="button"
        className="btn-primary"
        onClick={() => navigate('/admin/resources')}
        disabled={loading}
        style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: '700', background: '#1F1F1F', color: '#FFFFFF', border: '1px solid #4B5563', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: '700', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
      >
        {loading ? 'Processing...' : (isEdit ? 'Update Resource' : 'Create Resource')}
      </button>
    </div>
  );
}
