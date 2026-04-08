import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, AlertTriangle, XCircle, Zap } from 'lucide-react';

export default function ActionButton({ status, resourceId }) {
  const navigate = useNavigate();

  const getButtonConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          text: 'Request Reservation',
          icon: <CalendarCheck size={20} />,
          bg: '#0f172a',
          color: '#fff',
          disabled: false,
          onClick: () => navigate(`/bookings/create/${resourceId}`)
        };
      case 'MAINTENANCE':
        return {
          text: 'Under Maintenance',
          icon: <AlertTriangle size={20} />,
          bg: '#e2e8f0',
          color: '#94a3b8',
          disabled: true,
          onClick: null
        };
      case 'OUT_OF_SERVICE':
        return {
          text: 'Facility Offline',
          icon: <XCircle size={20} />,
          bg: '#fee2e2',
          color: '#ef4444',
          disabled: true,
          onClick: null
        };
      default:
        return {
          text: 'Status Unknown',
          icon: <Zap size={20} />,
          bg: '#f1f5f9',
          color: '#64748b',
          disabled: true,
          onClick: null
        };
    }
  };

  const cfg = getButtonConfig();

  return (
    <div className="action-btn-container">
      <button 
        className="primary-action-btn"
        disabled={cfg.disabled}
        onClick={cfg.onClick}
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.icon} {cfg.text}
      </button>
      {!cfg.disabled && (
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>
          * Reservations are subject to approval
        </p>
      )}
    </div>
  );
}
