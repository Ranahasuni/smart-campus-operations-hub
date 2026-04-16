import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

/**
 * A reusable meta-data row for booking cards.
 * Displays date, time range, and attendee count.
 */
const BookingMetaRow = ({ date, startTime, endTime, attendees }) => {
  return (
    <div className="booking-meta-row">
      <div className="meta-item">
        <Calendar size={14} /> {date}
      </div>
      <div className="meta-item">
        <Clock size={14} /> {startTime?.substring(0, 5)} - {endTime?.substring(0, 5)}
      </div>
      <div className="meta-item">
        <Users size={14} /> {attendees} Attendees
      </div>
    </div>
  );
};

export default BookingMetaRow;
