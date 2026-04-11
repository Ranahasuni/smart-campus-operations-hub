import React from 'react';
import { MapPin, Users, Building, Layers, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Online', bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'MAINTENANCE': return { label: 'Maintenance', bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      case 'OUT_OF_SERVICE': return { label: 'Offline', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { label: status, bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const statusCfg = getStatusConfig(resource.status);

  return (
    <div className="info-content">
      <div className="badge-group">
        <span className="type-badge">
          {resource.type}
        </span>
        <span className={`status-badge status-${resource.status?.toLowerCase()}`}>
          {statusCfg.label}
        </span>
        
        {/* TOP MARKS: SMART TICKET LINK */}
        {resource.status === 'ACTIVE' && (
          <Link 
            to={`/tickets/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`}
            className="report-issue-link"
          >
            <AlertTriangle size={14} /> Report Issue?
          </Link>
        )}
      </div>

      <h1 className="resource-detail-title">{resource.name}</h1>
      <p className="resource-description">{resource.description}</p>

      <div className="resource-specs-grid">
        <div className="spec-card">
          <div className="spec-icon">
            <Users size={20} />
          </div>
          <div className="spec-text">
            <div className="spec-label">Capacity</div>
            <div className="spec-value">{resource.capacity} Seats</div>
          </div>
        </div>

        <div className="spec-card">
          <div className="spec-icon">
            <Building size={20} />
          </div>
          <div className="spec-text">
            <div className="spec-label">Building</div>
            <div className="spec-value">{resource.building}</div>
          </div>
        </div>

        <div className="spec-card">
          <div className="spec-icon">
            <Layers size={20} />
          </div>
          <div className="spec-text">
            <div className="spec-label">Floor & Room</div>
            <div className="spec-value">Lvl {resource.floor}, {resource.roomNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
