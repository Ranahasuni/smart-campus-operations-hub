import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * A reusable Toast notification component.
 * Displays temporary feedback with slide-up animation.
 */
const Toast = ({ show, message, type = 'success' }) => {
  if (!show) return null;

  return (
    <div 
      className={`toast animate-slide-up ${type}`}
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '12px',
        background: type === 'success' ? '#22c55e' : '#ef4444',
        color: '#1F1F1F',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: '600'
      }}
    >
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      {message}
    </div>
  );
};

export default Toast;
