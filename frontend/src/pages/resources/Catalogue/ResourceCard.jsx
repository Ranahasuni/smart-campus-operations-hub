import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, CheckCircle } from 'lucide-react';
import './Catalogue.css';

export default function ResourceCard({ resource }) {
  const [imgError, setImgError] = useState(false);

  // Gracefully handle images
  const imageUrl = resource.imageUrls && resource.imageUrls.length > 0
    ? resource.imageUrls[0]
    : null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE': return { label: 'ONLINE', class: 'st-active' };
      case 'MAINTENANCE': return { label: 'MAINTENANCE', class: 'st-maint' };
      case 'OUT_OF_SERVICE': return { label: 'OFFLINE', class: 'st-offline' };
      default: return { label: status, class: '' };
    }
  };

  const status = getStatusConfig(resource.status || 'ACTIVE');

  return (
    <div className="resource-card-final">
      <div className="card-photo-top-full">
        {imageUrl && !imgError && (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) ? (
          <img
            src={imageUrl}
            alt={resource.name || 'Resource'}
            className="photo-edge-to-edge"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder-pro">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </div>
        )}
        <div className={`status-pill-final ${status.class}`}>
          <span className="dot-white"></span>
          <CheckCircle size={10} className="check-icon-mini" />
          <span>{status.label}</span>
        </div>
      </div>

      <div className="card-info-section">
        <div className="card-type-mini">{resource.type?.replace(/_/g, ' ')?.toUpperCase() || 'FACILITY'}</div>
        <h3 className="card-name-h3">{resource.name || 'Unnamed Resource'}</h3>

        <div className="card-meta-final-layout">
          <div className="meta-item-orange">
            <Users size={16} color="#f59e0b" />
            <span>{resource.capacity || 0} Seats</span>
          </div>
          <div className="meta-item-blue">
            <MapPin size={15} color="#6366f1" />
            <span className="location-text">
              {resource.building || 'MAIN BUILDING'} • {resource.floor === 0 ? 'G' : resource.floor}{['st', 'nd', 'rd', 'th'][Math.min((resource.floor - 1), 3)] || 'th'} FLOOR • {resource.roomNumber || 'A405'}
            </span>
          </div>
        </div>

        <Link to={`/resources/${resource.id}`} className="view-details-btn-final">
          View Details
        </Link>
      </div>
    </div>
  );
}
