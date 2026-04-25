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

import { Building2, CheckCircle2, AlertTriangle, XCircle, Home } from 'lucide-react';

export default function SummaryCards({ stats }) {
  const cards = [
    {
      title: 'Total Resources',
      value: stats.totalResources || 0,
      icon: <Home size={24} />,
      color: '#C08080',
      bg: 'rgba(192, 128, 128, 0.1)'
    },
    {
      title: 'Active Assets',
      value: stats.activeResources || 0,
      icon: <CheckCircle2 size={24} />,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)'
    },
    {
      title: 'In Maintenance',
      value: stats.maintenanceResources || 0,
      icon: <AlertTriangle size={24} />,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.1)'
    },
    {
      title: 'Out of Service',
      value: stats.outOfServiceResources || 0,
      icon: <XCircle size={24} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          background: 'rgba(192, 128, 128, 0.06)',
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid rgba(192, 128, 128, 0.06)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#6B7281', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>{card.title}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1F1F1F', margin: 0 }}>{card.value}</h3>
            </div>
            <div style={{
              width: '54px', height: '54px', borderRadius: '16px',
              background: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${card.color}30`,
              boxShadow: `0 0 20px ${card.color}20`
            }}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
