import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import api from '../../../api/axiosInstance';
import ticketApi from '../../../api/ticketApi';
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch resource details first (essential)
      try {
        const resResponse = await api.get(`/resources/${id}`);
        setResource(resResponse.data);
        setError(null);
      } catch (err) {
        console.error('Resource fetch error:', err);
        setError('The requested resource could not be found or connection was lost.');
        setLoading(false);
        return;
      }

      // Fetch tickets separately (optional, don't crash if it fails)
      try {
        const ticketsResponse = await ticketApi.getTicketsByResourceId(id);
        setTickets(ticketsResponse.data || []);
      } catch (err) {
        console.warn('Tickets fetch error (non-critical):', err);
        setTickets([]);
      }
      
    } catch (err) {
      console.error('Unexpected fetch error:', err);
      setError('An unexpected synchronization error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Check if we should show the maintenance banner
  const showMaintenanceBanner = resource?.status === 'MAINTENANCE' || tickets.some(t => 
    t.priority === 'HIGH' && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  );

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
        fontSize: '0.9rem', marginBottom: '24px', padding: '10px 24px',
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
      }} onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
        <ArrowLeft size={16} /> Back
      </Link>

      {/* CRITICAL ISSUE WARNING BANNER */}
      {showMaintenanceBanner && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '20px 24px',
          borderRadius: '16px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '10px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }}>MAINTENANCE ADVISORY</h4>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.9rem', fontWeight: '500' }}>
              This facility has a critical issue reported. Booking has been temporarily suspended for safety.
            </p>
          </div>
        </div>
      )}

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
            availability={resource.availability}
          />

          <QRCodeDisplay resourceId={resource.id} />
          <ActionButton status={resource.status} resourceId={resource.id} />
        </div>
      </div>
    </div>
  );
}

