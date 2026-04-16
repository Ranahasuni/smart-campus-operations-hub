import React from 'react';

/**
 * A reusable status badge for bookings.
 * Standardizes colors and labels across the application.
 */
const BookingStatusBadge = ({ status }) => {
  const getStatusLabel = (s) => {
    switch (s) {
      case 'APPROVED': return 'Upcoming';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return s;
    }
  };

  return (
    <span className={`status-badge status-${status}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default BookingStatusBadge;
