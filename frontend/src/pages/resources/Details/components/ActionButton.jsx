import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function ActionButton({ status, resourceId, activeIssueTicket, selectedDate }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAvailable = status === 'ACTIVE';

  const handleClick = () => {
    if (isAvailable) {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '';
      navigate(`/bookings/create/${resourceId}${dateParam}`);
    }
  };

  if (user?.role === 'TECHNICIAN') return null;

  // 🛡️ DYNAMIC LABELING
  const buttonLabel = isAvailable 
    ? 'Request Reservation' 
    : (status?.toUpperCase().includes('MAINT') || activeIssueTicket ? 'Under Maintenance' : 'Facility Unavailable');

  const buttonIcon = isAvailable 
    ? <CalendarCheck size={22} /> 
    : <AlertCircle size={22} />;

  return (
    <div className="action-btn-container">
      <button
        className="primary-action-btn-real"
        disabled={!isAvailable}
        onClick={handleClick}
        style={{ 
          opacity: isAvailable ? 1 : 0.7,
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          background: isAvailable ? '#6366f1' : '#94a3b8',
          border: isAvailable ? 'none' : '2px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isAvailable ? 'scale(1)' : 'scale(1)',
          filter: 'brightness(1)'
        }}
        onMouseEnter={(e) => isAvailable && (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
        onMouseLeave={(e) => isAvailable && (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
        aria-label={buttonLabel}
        title={isAvailable ? 'Click to proceed with your booking' : 'This facility is currently unavailable'}
      >
        {buttonIcon}
        <span>{buttonLabel}</span>
      </button>
      
    </div>
  );
}
