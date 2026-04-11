import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AvailabilityInfo({ availability }) {
  if (!availability || availability.length === 0) {
    return (
      <div className="sidebar-schedule-box">
        <h3 className="schedule-title-forced"><Clock size={18} /> Weekly Schedule</h3>
        <p style={{ color: '#64748b', fontWeight: '800', textAlign: 'center' }}>Waiting for operational data...</p>
      </div>
    );
  }

  return (
    <div className="sidebar-schedule-box">
      <h3 className="schedule-title-forced">
        <Clock size={20} color="#6366f1" /> Weekly Schedule
      </h3>
      
      <div className="schedule-days-container">
        {availability.map((item) => (
          <div key={item.day} className="availability-day-card-pro" style={{ opacity: item.isAvailable ? 1 : 0.7 }}>
            {/* LEFT: DAY */}
            <div className="availability-day-indicator">
              <span className="availability-day-label">{item.day}</span>
              {item.isAvailable ? (
                <CheckCircle2 size={16} color="#22c55e" strokeWidth={3} />
              ) : (
                <XCircle size={16} color="#94a3b8" strokeWidth={3} />
              )}
            </div>

            {/* DIVIDER */}
            <div className="availability-divider-line" />

            {/* RIGHT: TIMES */}
            <div className="availability-slots-list">
              {item.isAvailable ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {item.slots?.map((slot, idx) => (
                    <div key={idx} className="availability-time-slot">
                      {slot.startTime} — {slot.endTime}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="not-available-label">NOT AVAILABLE</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
