import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AvailabilityInfo({ availability }) {
  // HARD-CODED FORCE STYLES
  const boxBackground = { background: '#e2e8f0', borderRadius: '32px', padding: '28px', border: '2px solid #6366f1', marginBottom: '32px' };
  const titleStyle = { color: '#000000', fontSize: '1.25rem', fontWeight: '950', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' };
  const cardStyle = { background: '#ffffff', borderRadius: '20px', padding: '16px', marginBottom: '14px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
  const dayStyle = { color: '#000000', fontWeight: '950', fontSize: '0.85rem', width: '70px', flexShrink: 0, textAlign: 'center' };
  const timeStyle = { color: '#6366f1', fontSize: '0.95rem', fontWeight: '950' };

  if (!availability || availability.length === 0) {
    return (
      <div style={boxBackground}>
        <h3 style={titleStyle}><Clock size={18} /> Weekly Schedule</h3>
        <p style={{ color: '#64748b', fontWeight: '800' }}>Waiting for operational data...</p>
      </div>
    );
  }

  return (
    <div style={boxBackground}>
      <h3 style={titleStyle}>
        <Clock size={20} color="#6366f1" /> Weekly Schedule
      </h3>
      
      <div className="schedule-days-container">
        {availability.map((item) => (
          <div key={item.day} style={{ ...cardStyle, opacity: item.isAvailable ? 1 : 0.7 }}>
            {/* LEFT: DAY */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '70px' }}>
              <span style={dayStyle}>{item.day}</span>
              {item.isAvailable ? (
                <CheckCircle2 size={16} color="#22c55e" strokeWidth={3} />
              ) : (
                <XCircle size={16} color="#94a3b8" strokeWidth={3} />
              )}
            </div>

            {/* DIVIDER */}
            <div style={{ width: '1.5px', height: '40px', background: '#e2e8f0', margin: '0 16px' }} />

            {/* RIGHT: TIMES */}
            <div style={{ flexGrow: 1 }}>
              {item.isAvailable ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {item.slots?.map((slot, idx) => (
                    <div key={idx} style={timeStyle}>
                      {slot.startTime} — {slot.endTime}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '900' }}>NOT AVAILABLE</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
