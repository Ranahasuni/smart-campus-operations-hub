import React from 'react';
import { Users, Building, Layers, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource }) {
  // CONFIG: Map statuses to UI tokens
  const statusMap = {
    'ACTIVE': { label: 'Fully Operational', class: 'status-active' },
    'MAINTENANCE': { label: 'Under Maintenance', class: 'status-maintenance' },
    'OUT_OF_SERVICE': { label: 'Decommissioned', class: 'status-offline' }
  };

  const statusCfg = statusMap[resource.status] || { label: resource.status, class: 'status-offline' };

  return (
    <div className="info-content">
      <div className="badge-group" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <span className="type-badge" style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {resource.type}
        </span>
        <span className={`status-badge ${statusCfg.class}`} style={{ position: 'static' }}>
          {statusCfg.label}
        </span>
        
        {/* TOP MARKS: SMART TICKET LINK */}
        {resource.status === 'ACTIVE' && (
          <Link 
            to={`/tickets/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`}
            className="report-issue-link"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}
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
