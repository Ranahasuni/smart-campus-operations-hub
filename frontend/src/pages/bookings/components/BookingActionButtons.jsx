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
  onShowQR,
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="action-btn btn-cancel"
            onClick={() => onCancelAction(booking.id, 'APPROVED')}
          >
            <XCircle size={14} /> Cancel
          </button>
          <button 
            className="action-btn btn-show-qr"
            onClick={() => onShowQR(booking)}
            style={{ 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: '#818cf8', 
              border: '1px solid rgba(99, 102, 241, 0.3)',
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
    </div>
  );
};

export default BookingActionButtons;
