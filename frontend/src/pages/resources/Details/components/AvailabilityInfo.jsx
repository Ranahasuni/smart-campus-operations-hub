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
      <h3 className="sidebar-title">
        <Clock size={16} /> Weekly Schedule
      </h3>
      
      <div className="schedule-list">
        {availability.map((item) => (
          <div key={item.day} className={`schedule-item ${item.isAvailable ? 'available' : 'closed'}`}>
            <div className="schedule-day-row">
              <div className="day-info">
                <span className="day-label">{item.day}</span>
                {item.isAvailable ? (
                  <CheckCircle2 size={14} className="status-icon-ok" />
                ) : (
                  <XCircle size={14} className="status-icon-no" />
                )}
              </div>
              {!item.isAvailable && (
                <span className="closed-label">Closed</span>
              )}
            </div>
            
            {item.isAvailable && item.slots && (
              <div className="slots-container">
                {item.slots.map((slot, idx) => (
                  <div key={idx} className="slot-time">
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

