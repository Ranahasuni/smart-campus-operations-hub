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
  const statusClass = `status-${resource.status.toLowerCase().replace('_', '')}`;

  return (
    <div className="resource-card">
      <div className="card-image-container">
        {imageUrl && !imgError ? (
          <img 
            src={imageUrl} 
            alt={resource.name} 
            className="card-image" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder">No Image Available</div>
        )}
        <div className={`status-badge ${statusClass}`}>
          {resource.status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="card-content">
        <div className="card-type">{resource.type.replace('_', ' ')}</div>
        <h3 className="card-title">{resource.name}</h3>

        <div className="card-details">
          <div className="detail-item">
            <Users size={16} />
            <span>{resource.capacity} Seats</span>
          </div>
          <div className="detail-item" style={{ gridColumn: 'span 2' }}>
            <MapPin size={16} />
            <span>{resource.building}, Floor {resource.floor}, {resource.roomNumber}</span>
          </div>
        </div>

        <Link to={`/resources/${resource.id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}
