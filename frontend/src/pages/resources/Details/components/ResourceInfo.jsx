import React from 'react';
import { Users, Building, MapPin, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource }) {
  return (
    <div className="resource-info-container">
      <div className="badge-row-meta">
        <span className="type-badge-premium">
          {resource.type?.replace(/_/g, ' ')?.toUpperCase()}
        </span>
        <Link to={`/tickets/new?resourceId=${resource.id}`} style={{ textDecoration: 'none' }}>
          <div className="report-issue-pill">
            <ShieldAlert size={14} /> Report Issue?
          </div>
        </Link>
      </div>

      <h1 className="resource-title-premium">
        {resource.name}
      </h1>
      <p className="resource-desc-premium">{resource.description}</p>

      {/* 📏 CLEAN GRID USING CSS CLASSES */}
      <div className="resource-stats-grid-premium">

        {/* CAPACITY */}
        <div className="stat-card-premium">
          <div className="stat-icon-wrapper-pro" style={{ color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div className="stat-info-column-pro">
            <span className="stat-label-pro">CAPACITY</span>
            <span className="stat-value-pro">{resource.capacity} Seats</span>
          </div>
        </div>

        {/* BUILDING */}
        <div className="stat-card-premium">
          <div className="stat-icon-wrapper-pro" style={{ color: '#6366f1' }}>
            <Building size={24} />
          </div>
          <div className="stat-info-column-pro">
            <span className="stat-label-pro">BUILDING</span>
            <span className="stat-value-pro">{resource.building}</span>
          </div>
        </div>

        {/* LOCATION */}
        <div className="stat-card-premium">
          <div className="stat-icon-wrapper-pro" style={{ color: '#0d9488' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info-column-pro">
            <span className="stat-label-pro">FLOOR & ROOM</span>
            <span className="stat-value-pro">
              {resource.floor % 10 === 1 ? '1st' : resource.floor % 10 === 2 ? '2nd' : resource.floor % 10 === 3 ? '3rd' : `${resource.floor}th`} Floor, {resource.roomNumber}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
