import React, { useState, useEffect } from 'react';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}

import { Link } from 'react-router-dom';
import { MapPin, Users, CheckCircle, Settings, AlertTriangle } from 'lucide-react';
import api from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import './Catalogue.css';

export default function ResourceCard({ resource }) {
  const { API } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [lazyImageUrl, setLazyImageUrl] = useState(null);

  // Gracefully handle images
  let initialImageUrl = resource.imageUrls && resource.imageUrls.length > 0
    ? resource.imageUrls[0]
    : null;

  // Resolve relative paths to absolute backend URLs
  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/api/uploads')) return `${API}${url}`;
    return url;
  };

  useEffect(() => {
    let mounted = true;
    if (!initialImageUrl && resource.id && !imgError && !lazyImageUrl) {
      api.get(`/resources/${resource.id}/image`)
        .then(res => {
          if (mounted && res.data && res.data.imageUrl) {
            setLazyImageUrl(res.data.imageUrl);
          }
        })
        .catch(() => {
          if (mounted) setImgError(true);
        });
    }
    return () => { mounted = false; };
  }, [resource.id, initialImageUrl, API]);

  // Elite Dynamic fallback images based on type
  const getFallbackImage = (type) => {
    switch (type) {
      case 'LECTURE_HALL': return '/images/campus-lecture.png';
      case 'AUDITORIUM': return '/images/campus-hero.png';
      case 'MEETING_ROOM': return '/images/campus-library.png';
      case 'LAB': return '/images/campus-lecture.png';
      default: return '/images/campus-hero.png';
    }
  };

  const rawUrl = initialImageUrl || lazyImageUrl || getFallbackImage(resource.type);
  const imageUrl = resolveUrl(rawUrl);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE': return { label: 'ONLINE', class: 'st-active', icon: <span className="dot-white pulsing"></span> };
      case 'MAINTENANCE': return { label: 'MAINTENANCE', class: 'st-maint', icon: <Settings size={12} /> };
      case 'OUT_OF_SERVICE': return { label: 'OFFLINE', class: 'st-offline', icon: <AlertTriangle size={12} /> };
      default: return { label: status, class: '', icon: null };
    }
  };

  const status = getStatusConfig(resource.status || 'ACTIVE');

  return (
    <div className="resource-card-final">
      <div className="card-photo-top-full">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={resource.name || 'Resource'}
            className="photo-edge-to-edge"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder-pro">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </div>
        )}
        <div className={`status-pill-final ${status.class}`}>
          {status.icon}
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
            <MapPin size={15} color="#C08080" />
            <span className="location-text">
              {resource.building || 'MAIN BUILDING'} • {resource.floor === 0 ? 'G' : resource.floor}{['st', 'nd', 'rd', 'th'][Math.min((resource.floor - 1), 3)] || 'th'} FLOOR • {resource.roomNumber || 'A405'}
            </span>
          </div>
        </div>

        <Link 
          to={`/resources/${resource.id}`} 
          state={{ resource }} 
          className="view-details-btn-final"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
