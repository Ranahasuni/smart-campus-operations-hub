import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * A reusable empty state component for lists.
 * Standardizes the "nothing found" UI across the app.
 */
const EmptyState = ({ 
  icon: Icon = History, 
  title = "No data found", 
  message = "We couldn't find any records matching your criteria.",
  actionLabel = "Go Back",
  onAction,
  actionPath
}) => {
  const navigate = useNavigate();

  const handlePress = () => {
    if (onAction) onAction();
    if (actionPath) navigate(actionPath);
  };

  return (
    <div className="glass-card empty-state" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center', 
      padding: '60px 20px' 
    }}>
      <Icon size={64} style={{ color: '#475569', marginBottom: '20px', opacity: 0.5 }} />
      <h3 style={{ color: '#4B5563', fontSize: '1.5rem', marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: '#6B7281', maxWidth: '400px', margin: '0 0 24px 0' }}>{message}</p>
      
      {(onAction || actionPath) && (
        <button 
          className="action-btn" 
          style={{ 
            marginTop: '10px', 
            width: 'auto', 
            background: '#C08080', 
            color: '#1F1F1F',
            padding: '12px 24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
          onClick={handlePress}
        >
          {actionLabel} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
