import React from 'react';
import { Clock, CalendarX, Loader2, Info } from 'lucide-react';

export default function ReservedSlots({ bookings, selectedDate, isMaintenance, isOffline, loading }) {
  if (loading) {
    return (
      <div className="availability-card" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', gap: '12px' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>SYNCING SCHEDULE...</span>
      </div>
    );
  }

  // 🏥 THE "CORRECT WAY": Distinguish between Technical repairs and Administrative offline
  if (isMaintenance || isOffline) {
    const isMaint = !!isMaintenance;
    return (
      <div className="availability-card" style={{ 
        marginTop: '20px', 
        border: '1px solid ' + (isMaint ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'), 
        background: isMaint ? 'rgba(239, 68, 68, 0.05)' : 'rgba(99, 102, 241, 0.05)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          {isMaint ? (
            <CalendarX size={20} style={{ color: '#ef4444' }} />
          ) : (
            <Info size={20} style={{ color: '#6366f1' }} />
          )}
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1rem', 
            fontWeight: '800', 
            color: isMaint ? '#ef4444' : '#6366f1' 
          }}>
            {isMaint ? 'Service Suspended' : 'Facility Offline'}
          </h3>
        </div>
        <div style={{ 
          padding: '16px', 
          textAlign: 'center', 
          background: isMaint ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '12px' 
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.85rem', 
            color: isMaint ? '#ef4444' : '#6366f1', 
            fontWeight: '600', 
            lineHeight: '1.5' 
          }}>
            {isMaint 
              ? 'Reservations are temporarily disabled while technical repairs or active maintenance tickets are in progress.' 
              : 'This facility is currently offline for administrative scheduling and is not accepting new reservations.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Clock size={20} className="text-accent" style={{ color: '#6366f1' }} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Occupancy Status</h3>
      </div>

      <div className="slots-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {bookings.length > 0 ? (
          bookings.map((b) => (
            <div key={b.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
            }}>
              <span style={{ fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Reserved</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)}</span>
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px dashed rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 4px', color: '#22c55e', fontSize: '1rem', fontWeight: '800' }}>Available for Reservation</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>No overlaps found on {selectedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
