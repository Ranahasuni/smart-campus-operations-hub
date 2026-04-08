import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import './Catalogue.css';

export default function ResourceCard({ resource }) {
  const [imgError, setImgError] = useState(false);

  // Gracefully handle images
  const imageUrl = resource.imageUrls && resource.imageUrls.length > 0 
    ? resource.imageUrls[0] 
    : null;

  // Converts ACTIVE to status-active
  const statusClass = `status-${(resource.status || 'ACTIVE').toLowerCase().replace('_', '')}`;

  return (
    <div className="resource-card">
      <div className="card-image-container">
        {imageUrl && !imgError && (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) ? (
          <img 
            src={imageUrl} 
            alt={resource.name || 'Resource'} 
            className="card-image" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>No Facility Preview</span>
          </div>
        )}
        <div className={`status-badge ${statusClass}`}>
          {(resource.status || 'ACTIVE').replace(/_/g, ' ')}
        </div>
      </div>

      <div className="card-content">
        <div className="card-type">{(resource.type || 'FACILITY').replace('_', ' ')}</div>
        <h3 className="card-title">{resource.name || 'Unnamed Resource'}</h3>

        <div className="card-details">
          <div className="detail-item">
            <Users size={16} />
            <span>{resource.capacity || 0} Seats</span>
          </div>
          <div className="detail-item" style={{ gridColumn: 'span 2' }}>
            <MapPin size={16} />
            <span>{resource.building || 'N/A'}, Floor {resource.floor || '?'}, {resource.roomNumber || 'N/A'}</span>
          </div>
        </div>

        <Link to={`/resources/${resource.id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}
