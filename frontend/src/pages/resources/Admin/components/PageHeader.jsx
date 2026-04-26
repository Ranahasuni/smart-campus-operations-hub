import React from 'react';

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

import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function PageHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
          Resource <span style={{ color: '#C08080' }}>Management</span>
        </h1>
        <p style={{ color: '#6B7281', marginTop: '8px', fontSize: '1rem', fontWeight: '500' }}>
          Search, monitor and configure all campus facilities and inventory from a unified dashboard.
        </p>
      </div>
      <Link to="/admin/resources/new" style={{ 
        background: 'linear-gradient(135deg, #C08080 0%, #A86A6A 100%)',
        color: '#1F1F1F', textDecoration: 'none', padding: '14px 28px', borderRadius: '14px',
        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 10px 25px rgba(192, 128, 128, 0.3)',
        transition: 'transform 0.2s'
      }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
         onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <Plus size={20} /> Add New Resource
      </Link>
    </div>
  );
}
