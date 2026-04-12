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
      <div className="maintenance-empty-state-pro">
        <History size={32} />
        <p>No previous maintenance records found for this operational unit.</p>
      </div>
    );
  }

  return (
    <div className="maintenance-history-section-pro">
      <div className="m-history-header-pro">
        <div className="m-icon-bg"><History size={22} /></div>
        <h3>OPERATIONAL MAINTENANCE LOG</h3>
      </div>

      {loading ? (
        <div className="m-loading-pro">Synchronizing logs...</div>
      ) : (
        <div className="m-history-list-pro">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="m-history-item-pro">
              <div className="m-item-main-pro">
                <div className="m-item-title-row-pro">
                  <span className="m-ticket-title-pro">{ticket.title}</span>
                  <span className={`m-status-badge-pro ${ticket.status.toLowerCase().replace('_', '-')}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="m-item-meta-pro">
                  <span><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Priority: {ticket.priority}</span>
                  <span>•</span>
                  <span className="m-ticket-id">{ticket.displayId || ticket.id.substring(0, 8)}</span>
                </div>
              </div>
              <a href={`/tickets/${ticket.id}`} className="m-view-link-pro" title="View Intelligence Profile">
                <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
