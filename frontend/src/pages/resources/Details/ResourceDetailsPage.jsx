import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../api/axiosInstance';
import './ResourceDetails.css';

// Component Imports
import ImageGallery from './components/ImageGallery';
import ResourceInfo from './components/ResourceInfo';
import EquipmentList from './components/EquipmentList';
import AvailabilityInfo from './components/AvailabilityInfo';
import QRCodeDisplay from './components/QRCodeDisplay';
import ActionButton from './components/ActionButton';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResource();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resources/${id}`);
      setResource(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('The requested resource could not be synchronized. It may have been decommissioned.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#6366f1' }} />
        <p style={{ fontWeight: 'bold', letterSpacing: '1px' }}>SYNCHRONIZING ASSET DETAILS...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 24px' }}>
          <AlertCircle size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>{error}</p>
        <Link to="/resources" style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 'bold' }}>
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="resource-details-container">
      {/* SLEEK VISIBLE BACK BUTTON */}
      <Link to="/resources" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: '#1e293b', textDecoration: 'none', fontWeight: '800',
        fontSize: '0.9rem', marginBottom: '32px', padding: '10px 24px',
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
      }} onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="details-grid">
        {/* LEFT COLUMN: VISUALS AND INFO */}
        <div className="details-main-card">
          <ImageGallery images={resource.imageUrls} name={resource.name} />
          <ResourceInfo resource={resource} />
          <EquipmentList equipment={resource.equipment} />
        </div>

        {/* RIGHT COLUMN: SIDEBAR (ACTION & AVAILABILITY) */}
        <div className="details-sidebar">
          <AvailabilityInfo
            days={resource.availableDays}
            from={resource.availableFrom}
            to={resource.availableTo}
          />
          <QRCodeDisplay resourceId={resource.id} />
          <ActionButton status={resource.status} resourceId={resource.id} />
        </div>
      </div>
    </div>
  );
}
