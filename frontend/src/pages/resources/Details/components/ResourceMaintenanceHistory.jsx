import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  History, 
  ExternalLink, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import '../../../../styles/maintenance-history.css';

export default function ResourceMaintenanceHistory({ tickets, loading }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <AlertCircle size={14} />;
      case 'IN_PROGRESS': return <Clock size={14} />;
      case 'RESOLVED':
      case 'COMPLETED': return <CheckCircle2 size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (!loading && tickets.length === 0) {
    return (
      <div className="maintenance-empty-state">
        <History size={24} />
        <p>No previous maintenance records found for this resource.</p>
      </div>
    );
  }

  return (
    <div className="maintenance-history-section">
      <div className="m-history-header">
        <History size={20} />
        <h3>Maintenance History</h3>
      </div>

      {loading ? (
        <div className="m-loading">Fetching logs...</div>
      ) : (
        <div className="m-history-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="m-history-item">
              <div className="m-item-main">
                <div className="m-item-title-row">
                  <span className="m-ticket-title">{ticket.title}</span>
                  <span className={`m-status-badge ${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="m-item-meta">
                  <span><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Priority: {ticket.priority}</span>
                </div>
              </div>
              <a href={`/tickets/${ticket.id}`} className="m-view-link" title="View Full Ticket">
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
