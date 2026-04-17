import React from 'react';
import { Info } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import BookingActionButtons from './BookingActionButtons';
import BookingMetaRow from './BookingMetaRow';
import ArrivalAction from './ArrivalAction';

const CATEGORY_MAP = {
  TEACHING_VENUE: { name: 'Teaching Venue', icon: '📖' },
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️' },
  SEMINAR_ROOM: { name: 'Seminar Room', icon: '🗣️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference', icon: '🎥' },
  LAB: { name: 'Lab', icon: '🧪' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀' },
};

/**
 * A standalone component for a single booking card.
 * Encapsulates meta-data, actions, and status.
 */
const BookingCard = ({ 
  booking, 
  onUpdate, 
  onCancelAction, 
  onReportMissingQR, 
  isBookingActive 
}) => {
  return (
    <div className="glass-card booking-card">
      <div className="resource-icon-box">
        {CATEGORY_MAP[booking.resourceType]?.icon || '📍'}
      </div>

      <div className="booking-info-main">
        <div className="resource-name-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
              {(booking.resourceNames || [booking.resourceName || 'Unnamed Unit']).join(', ')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 800 }}>
              {booking.bookingCode || `RSV-${new Date(booking.date).getFullYear()}-${booking.id?.slice(-5).toUpperCase()}`}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>
              {booking.resourceType}
            </span>
          </div>
        </div>
        
        <BookingMetaRow 
          date={booking.date}
          startTime={booking.startTime}
          endTime={booking.endTime}
          attendees={booking.expectedAttendees}
        />

        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
          <strong>Purpose:</strong> {booking.purpose}
        </div>

        {/* ARRIVAL SECURE CONTROL */}
        {(isBookingActive(booking) || booking.isCheckedIn) && (
          <ArrivalAction 
            booking={booking} 
            onCheckIn={onReportMissingQR} 
          />
        )}

        {booking.status === 'REJECTED' && booking.rejectionReason && (
          <div className="rejection-reason-box">
            <Info size={14} style={{ marginRight: '8px' }} />
            <strong>Note:</strong> {booking.rejectionReason}
          </div>
        )}
      </div>

      <div className="booking-status-box">
        <BookingStatusBadge status={booking.status} />
        
        <BookingActionButtons 
          booking={booking}
          onUpdate={onUpdate}
          onCancelAction={onCancelAction}
          onReportMissingQR={onReportMissingQR}
          isBookingActive={isBookingActive}
        />
      </div>
    </div>
  );
};

export default BookingCard;
