import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AvailabilityInfo({ availability }) {
  if (!availability || availability.length === 0) {
    return (
      <div className="sidebar-card">
        <h3 className="sidebar-title"><Clock size={16} /> Weekly Schedule</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Synchronizing with operational live feeds...</p>
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
