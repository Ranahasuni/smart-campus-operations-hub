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

import { Pencil, Trash2, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * A reusable component for booking action buttons.
 * Handles visibility logic based on status and arrival windows.
 */
const BookingActionButtons = ({ 
  booking, 
  onUpdate, 
  onCancelAction, 
  onReportMissingQR, 
  onShowQR,
  isBookingActive 
}) => {
  const active = isBookingActive(booking);
  const { user } = useAuth();
  const canCancelApproved = user && (user.role === 'ADMIN' || user.role === 'LECTURER');

  return (
    <div className="booking-actions">
      {booking.status === 'PENDING' && (
        <>
          <button 
            className="action-btn btn-update"
            onClick={() => onUpdate(booking.id)}
          >
            <Pencil size={14} /> Update
          </button>
          <button 
            className="action-btn btn-withdraw"
            onClick={() => onCancelAction(booking.id, 'PENDING')}
          >
            <Trash2 size={14} /> Withdraw
          </button>
        </>
      )}

      {booking.status === 'APPROVED' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canCancelApproved && (
            <button 
              className="action-btn btn-cancel"
              onClick={() => onCancelAction(booking.id, 'APPROVED')}
            >
              <XCircle size={14} /> Cancel
            </button>
          )}
          <button 
            className="action-btn btn-show-qr"
            onClick={() => onShowQR(booking)}
            style={{ 
              background: 'rgba(192, 128, 128, 0.15)', 
              color: '#C08080', 
              border: '1px solid rgba(192, 128, 128, 0.3)',
              fontWeight: '800'
            }}
          >
            Digital ID
          </button>
        </div>
      )}

      {booking.status === 'APPROVED' && !booking.isCheckedIn && (
        <button 
          className="action-btn btn-report-issue"
          title="Report physical QR signage missing or scanner broken"
          onClick={() => onReportMissingQR(booking.id)}
          style={{ 
            background: 'rgba(192, 128, 128, 0.05)', 
            color: '#6B7281', 
            border: '1px solid rgba(192, 128, 128, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px'
          }}
        >
          <AlertTriangle size={14} /> Signage Issue?
        </button>
      )}
    </div>
  );
};

export default BookingActionButtons;
