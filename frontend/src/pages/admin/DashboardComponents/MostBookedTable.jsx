import React from 'react';
import { Monitor, Tag, MapPin, TrendingUp, Trophy } from 'lucide-react';

export default function MostBookedTable({ data = [], isDark }) {
  const getBadgeStyle = (type) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('MEETING')) return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' };
    if (t.includes('LAB')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
  };

  return (
    <div style={{
      background: '#ffffff',
      padding: '35px',
      borderRadius: '35px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.03)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#6366f1' }}></div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '4px' }}>
            <Trophy size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Performance Leaderboard</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Top Performing Facilities
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
            Analyzed intelligence based on real-time campus utilization spikes
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={headerStyle}><div style={headerFlex}><Monitor size={14} /> RESOURCE NAME</div></th>
              <th style={headerStyle}><div style={headerFlex}><Tag size={14} /> CATEGORY</div></th>
              <th style={headerStyle}><div style={headerFlex}><MapPin size={14} /> LOCATION</div></th>
              <th style={{ ...headerStyle, textAlign: 'right' }}><div style={{ ...headerFlex, justifyContent: 'flex-end' }}><TrendingUp size={14} /> BOOKINGS</div></th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((item, idx) => {
              const badge = getBadgeStyle(item.type);
              const name = item.name || item.resourceName || 'Unknown Asset';
              const location = item.building || item.location || 'N/A';
              const count = item.count || 0;

              return (
                <tr key={idx} style={{ background: '#f8fafc', borderRadius: '16px' }}>
                  <td style={{ ...cellStyle, fontWeight: '900', color: '#0f172a', fontSize: '1rem', borderRadius: '16px 0 0 16px' }}>
                    {name}
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      padding: '8px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900,
                      color: badge.color, background: badge.bg, textTransform: 'uppercase',
                      border: `1px solid ${badge.color}20`
                    }}>
                      {(item.type || 'N/A').replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, color: '#475569', fontWeight: 700, fontSize: '0.85rem' }}>
                    {location}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 18px', borderRadius: '14px',
                      background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: '1.1rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
  color: '#0f172a', // Much darker for bold authority
  fontSize: '0.75rem',
  fontWeight: '950',
  letterSpacing: '1.5px'
};

const cellStyle = {
  padding: '24px 16px',
  fontSize: '0.9rem'
};
