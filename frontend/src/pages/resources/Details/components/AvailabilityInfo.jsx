import React from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function AvailabilityInfo({ days, from, to }) {
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="sidebar-card">
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={18} color="#6366f1" /> Operating Hours
      </h3>
      
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
          {from || '08:00'} — {to || '18:00'}
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Calendar size={18} color="#6366f1" /> Available Days
      </h3>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {allDays.map(day => {
          const isActive = days && days.includes(day);
          return (
            <div key={day} style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              background: isActive ? '#6366f1' : '#f1f5f9',
              color: isActive ? '#fff' : '#94a3b8',
              border: isActive ? 'none' : '1px solid #e2e8f0'
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
