import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

/**
 * A reusable error banner component.
 * Standardizes the look of inline error messages.
 */
const ErrorBanner = ({ message, onClose, type = 'error' }) => {
  if (!message) return null;

  return (
    <div className={`error-banner ${type}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
      marginBottom: '20px',
      fontSize: '0.9rem',
      fontWeight: '500'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} />
        {message}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
