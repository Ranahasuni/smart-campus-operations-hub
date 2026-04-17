import React from 'react';
import { Pencil, Trash2, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * A reusable component for booking action buttons.
 * Handles visibility logic based on status and arrival windows.
 */
const BookingActionButtons = ({ 
  booking, 
  onUpdate, 
  onCancelAction, 
  onReportMissingQR, 
  isBookingActive 
}) => {
  const active = isBookingActive(booking);

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
        <button 
          className="action-btn btn-cancel"
          onClick={() => onCancelAction(booking.id, 'APPROVED')}
        >
          <XCircle size={14} /> Cancel
        </button>
      )}

      {booking.status === 'APPROVED' && active && (
        <button 
          className="action-btn btn-confirm-arrival"
          title="I am physically here. Confirm arrival."
          onClick={() => onReportMissingQR(booking.id)}
          style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            color: '#22c55e', 
            border: '1px solid rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px'
          }}
        >
          <CheckCircle2 size={14} /> I'm Here
        </button>
      )}

      {booking.status === 'APPROVED' && !booking.isCheckedIn && (
        <button 
          className="action-btn btn-report-issue"
          title="Report physical QR signage missing or scanner broken"
          onClick={() => onReportMissingQR(booking.id)}
          style={{ 
            background: 'rgba(99, 102, 241, 0.05)', 
            color: '#94a3b8', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px'
          }}
        >
          <AlertTriangle size={14} /> Signage Issue?
        </button>
      )}

      {booking.isCheckedIn && (
        <div className="check-in-verified-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: '800', fontSize: '0.8rem', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
           <CheckCircle2 size={14} /> Arrived
        </div>
      )}
    </div>
  );
};

export default BookingActionButtons;
