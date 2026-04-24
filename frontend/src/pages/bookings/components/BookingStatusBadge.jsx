import React from 'react';

/**
 * A reusable status badge for bookings.
 * Standardizes colors and labels across the application.
 */
const BookingStatusBadge = ({ status }) => {
  const getStatusLabel = (s) => {
    switch (s) {
      case 'APPROVED': return 'Upcoming';
      case 'PENDING': return 'Pending Review';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      case 'CHECKED_IN': return 'Checked In';
      case 'CHECKED_OUT': return 'Completed';
      case 'NO_SHOW': return 'No Show';
      default: return s ? s.replace('_', ' ') : 'Unknown';
    }
  };

  return (
    <span className={`status-badge status-${status}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default BookingStatusBadge;
