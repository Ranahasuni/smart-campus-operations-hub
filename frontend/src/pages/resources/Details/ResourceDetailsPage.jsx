import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Loader2, Info, ShieldAlert } from 'lucide-react';
import api from '../../../api/axiosInstance';
import ticketApi from '../../../api/ticketApi';
import './ResourceDetails_Final.css';

// Component Imports
import ImageGallery from './components/ImageGallery';
import ResourceInfo from './components/ResourceInfo';
import EquipmentList from './components/EquipmentList';
import AvailabilityInfo from './components/AvailabilityInfo';
import QRCodeDisplay from './components/QRCodeDisplay';
import ActionButton from './components/ActionButton';
import ResourceMaintenanceHistory from './components/ResourceMaintenanceHistory';
import ReservedSlots from './components/ReservedSlots';

export default function ResourceDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResponse, ticketsResponse, bookingsResponse] = await Promise.all([
        api.get(`/resources/${id}`),
        ticketApi.getTicketsByResourceId(id).catch(() => ({ data: [] })),
        api.get(`/bookings/resource/${id}?date=${selectedDate}`).catch(() => ({ data: [] }))
      ]);
      setResource(resResponse.data);
      setTickets(ticketsResponse.data || []);
      setBookings(bookingsResponse.data || []);
    } catch (err) {
      setError('Operational synchronization error.');
    } finally {
      setLoading(false);
    }
  };

  // 🚨 SMART LOGIC (Works with any spelling like 'offline' or 'OFFLINE')
  const activeIssueTicket = tickets.find(t =>
    t.priority === 'HIGH' && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  );

  const status = resource?.status?.toUpperCase() || '';
  const isMaintenance = status.includes('MAINT') || activeIssueTicket;

  // 🔵 OPERATIONAL CHECK: Triggers for 'OFFLINE' or 'OUT_OF_SERVICE'
  const isOffline = (status.includes('OFF') || status.includes('SERVICE')) && !isMaintenance;

  // 📝 SELECT THE CORRECT MESSAGE
  const maintenanceTitle = activeIssueTicket ? "MAINTENANCE ADVISORY" : "SCHEDULED MAINTENANCE";
  const maintenanceDesc = activeIssueTicket
    ? "This facility has a critical issue reported. Booking has been temporarily suspended for safety."
    : "This facility is currently undergoing scheduled maintenance or upgrades by the administration.";

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!resource && loading) return null;

  return (
    <div className="resource-details-container">
      {/* ⬅️ STYLED BACK BUTTON */}
      <Link to="/resources" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
        borderRadius: '12px', border: '1px solid var(--glass-border)',
        textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem',
        marginBottom: '28px', boxShadow: 'var(--shadow-sm)'
      }}>
        <ArrowLeft size={16} /> Back
      </Link>

      {/* 🚨 RED BANNER: MAINTENANCE */}
      {isMaintenance && (
        <div style={{ maxWidth: '1600px', margin: '0 auto 32px' }}>
          <div style={{
            background: '#ef4444', color: 'white', padding: '24px',
            borderRadius: '24px', display: 'flex',
            alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
              <ShieldAlert size={32} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '950', letterSpacing: '0.02em', color: 'white' }}>{maintenanceTitle}</h4>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontWeight: '500', color: 'white' }}>{maintenanceDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 BLUE BANNER: OFFLINE */}
      {isOffline && (
        <div style={{ maxWidth: '1600px', margin: '0 auto 32px' }}>
          <div style={{
            background: '#6366f1', color: 'white', padding: '24px',
            borderRadius: '24px', display: 'flex',
            alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
              <Info size={32} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '950', letterSpacing: '0.02em', color: 'white' }}>OPERATIONAL NOTICE</h4>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontWeight: '500', color: 'white' }}>This facility is currently offline. Please check later for availability or contact administration.</p>
            </div>
          </div>
        </div>
      )}

      {resource && (
        <div className="details-grid">
          <div className="details-main-card">
            <ImageGallery images={resource.imageUrls} name={resource.name} status={resource.status} />
            <ResourceInfo resource={resource} />
            <EquipmentList equipment={resource.equipment} />
            
            {/* 🛠️ TECHNICIAN INTELLIGENCE: Maintenance History Log */}
            {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
              <ResourceMaintenanceHistory tickets={tickets} loading={loading} />
            )}
          </div>

          <div className="details-sidebar">
            <AvailabilityInfo availability={resource.availability} />
            
            <div className="availability-card" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>CHECK AVAILABILITY</span>
                <button 
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  Reset Today
                </button>
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              />
            </div>

            <ReservedSlots bookings={bookings} selectedDate={selectedDate} />
            
            <QRCodeDisplay resourceId={resource.id} />
            <ActionButton 
              status={resource.status} 
              resourceId={resource.id} 
              activeIssueTicket={activeIssueTicket} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
