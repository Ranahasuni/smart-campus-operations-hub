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

import { Monitor, Tag, MapPin, TrendingUp, Trophy } from 'lucide-react';

export default function MostBookedTable({ data = [], isDark }) {
  const getBadgeStyle = (type) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('MEETING')) return { color: '#C08080', bg: 'rgba(192, 128, 128, 0.08)' };
    if (t.includes('LAB')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
  };

  return (
    <div style={{
      background: '#F9FAFB',
      padding: '35px',
      borderRadius: '35px',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C08080', marginBottom: '4px' }}>
            <Trophy size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Performance Leaderboard</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-0.5px' }}>
            Top Performing Facilities
          </h3>
          <p style={{ color: '#6B7281', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
            Analyzed intelligence based on real-time campus utilization spikes
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ ...headerStyle, color: '#6B7281' }}><div style={headerFlex}><Monitor size={14} /> RESOURCE NAME</div></th>
              <th style={{ ...headerStyle, color: '#6B7281' }}><div style={headerFlex}><Tag size={14} /> CATEGORY</div></th>
              <th style={{ ...headerStyle, color: '#6B7281' }}><div style={headerFlex}><MapPin size={14} /> LOCATION</div></th>
              <th style={{ ...headerStyle, color: '#6B7281', textAlign: 'right' }}><div style={{ ...headerFlex, justifyContent: 'flex-end' }}><TrendingUp size={14} /> BOOKINGS</div></th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((item, idx) => {
              const badge = getBadgeStyle(item.type);
              const name = item.name || item.resourceName || 'Unknown Asset';
              const location = (item.building || item.location || 'N/A').toUpperCase();

              return (
                <tr key={idx} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.03)' }}>
                  <td style={{ ...cellStyle, fontWeight: '900', color: '#111827', fontSize: '1rem', borderRadius: '16px 0 0 16px' }}>
                    {name}
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      padding: '8px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900,
                      color: badge.color, background: badge.bg, textTransform: 'uppercase',
                      border: `1px solid ${badge.color}30`
                    }}>
                      {(item.type || 'N/A').replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, color: '#6B7280', fontWeight: 700, fontSize: '0.85rem' }}>
                    {location}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 18px', borderRadius: '14px',
                      background: '#F3F4F6', color: '#111827', fontWeight: 900, fontSize: '1.1rem',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      {item.count || 0}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headerFlex = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const headerStyle = {
  padding: '12px 16px',
  fontSize: '0.75rem',
  fontWeight: '950',
  letterSpacing: '1.5px'
};

const cellStyle = {
  padding: '24px 16px',
  fontSize: '0.9rem'
};
