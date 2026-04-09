import React from 'react';
import { Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function AvailabilityInfo({ availability }) {
  if (!availability || availability.length === 0) {
    return (
      <div className="sidebar-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={18} color="#6366f1" /> Operating Hours
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No availability data synchronized.</p>
      </div>
    );
  }

  return (
    <div className="sidebar-card">
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={18} color="#6366f1" /> Weekly Schedule
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {availability.map((item) => (
          <div key={item.day} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '14px',
            background: item.isAvailable ? '#f8fafc' : '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            opacity: item.isAvailable ? 1 : 0.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.9rem', width: '35px', color: item.isAvailable ? '#0f172a' : '#94a3b8' }}>
                  {item.day}
                </span>
                {item.isAvailable ? (
                  <CheckCircle2 size={14} color="#22c55e" />
                ) : (
                  <XCircle size={14} color="#94a3b8" />
                )}
              </div>
              {!item.isAvailable && (
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>Closed</span>
              )}
            </div>
            
            {item.isAvailable && item.slots && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '45px' }}>
                {item.slots.map((slot, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6366f1' }}>
                    {slot.startTime} — {slot.endTime}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

