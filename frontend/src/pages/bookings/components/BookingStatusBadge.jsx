import React from 'react';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}


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
