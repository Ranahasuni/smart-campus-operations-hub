import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from './components/BookingStatusBadge';
import BookingActionButtons from './components/BookingActionButtons';
import { 
  Calendar, Clock, Users, Info, AlertTriangle, 
  Trash2, XCircle, CheckCircle2, History,
  Search, Loader2, ArrowRight, Pencil
} from 'lucide-react';
import '../../styles/my-bookings.css';

const CATEGORY_MAP = {
  TEACHING_VENUE: { name: 'Teaching Venue', icon: '📖' },
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️' },
  SEMINAR_ROOM: { name: 'Seminar Room', icon: '🗣️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference', icon: '🎥' },
  LAB: { name: 'Lab', icon: '🧪' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀' },
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchBookings();
    // Update current time every minute to keep UI buttons in sync
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/bookings/user`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      setError('Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = async (id, status) => {
    const actionLabel = status === 'PENDING' ? 'delete/withdraw' : 'cancel';
    
    // Explicitly check for confirm
    if (!window.confirm(`Are you sure you want to ${actionLabel} this reservation?`)) return;

    try {
      const method = status === 'PENDING' ? 'DELETE' : 'PUT';
      const endpoint = status === 'PENDING' ? `${API}/api/bookings/${id}` : `${API}/api/bookings/${id}/cancel`;
      
      const res = await authFetch(endpoint, { method });
      if (res.ok) {
        showToast(`Booking ${status === 'PENDING' ? 'withdrawn' : 'cancelled'} successfully!`);
        if (status === 'PENDING') setActiveTab('CANCELLED');
        fetchBookings();
      } else {
        showToast('Action failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred.', 'error');
    }
  };

  const handleReportMissingQR = async (id) => {
    if (!window.confirm("Can't find the physical QR code? We can check you in manually and alert the maintenance team to replace it immediately. Proceed?")) return;

    try {
      const res = await authFetch(`${API}/api/check-in/${id}/report-missing-qr`, { method: 'POST' });
      if (res.ok) {
        showToast('Check-in complete. Help is on the way!', 'success');
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.error || 'Verification failed. Please ensure you are at the correct location.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    const isHistory = b.status === 'REJECTED' || b.status === 'CANCELLED' || (b.status === 'APPROVED' && b.date < today);
    if (isHistory) return false;
    
    return activeTab === 'ALL' ? true : b.status === activeTab;
  });

  const isBookingActive = (booking) => {
    if (booking.status !== 'APPROVED' || booking.isCheckedIn) return false;
    
    // 1. Check Date
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) return false;

    // 2. Check Time Window (Starting 10 mins before)
    try {
      const nowTime = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = booking.startTime.split(':').map(Number);
      const [endH, endM] = booking.endTime.split(':').map(Number);

      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;

      // Active from (start - 10) until end
      return nowTime >= (startTime - 10) && nowTime <= endTime;
    } catch (e) {
      return false;
    }
  };

  if (loading) return (
    <div className="my-bookings-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div className="my-bookings-container animate-fade-in">
      <header className="bookings-dashboard-header">
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Active Bookings</h1>
          <p style={{ color: '#94a3b8' }}>Manage and track your upcoming campus reservations.</p>
        </div>

        <div className="bookings-tabs">
          {['ALL', 'PENDING', 'APPROVED'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'APPROVED' ? 'Upcoming' : (tab.charAt(0) + tab.slice(1).toLowerCase())}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="bookings-grid">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="glass-card booking-card">
              <div className="resource-icon-box">
                {CATEGORY_MAP[booking.resourceType]?.icon || '📍'}
              </div>

              <div className="booking-info-main">
                <div className="resource-name-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>{(booking.resourceNames || [booking.resourceName || 'Unnamed Unit']).join(', ')}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 800 }}>
                      {booking.bookingCode || `RSV-${new Date(booking.date).getFullYear()}-${booking.id?.slice(-5).toUpperCase()}`}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>{booking.resourceType}</span>
                  </div>
                </div>
                
                <div className="booking-meta-row">
                  <div className="meta-item"><Calendar size={14} /> {booking.date}</div>
                  <div className="meta-item"><Clock size={14} /> {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</div>
                  <div className="meta-item"><Users size={14} /> {booking.expectedAttendees} Attendees</div>
                </div>

                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  <strong>Purpose:</strong> {booking.purpose}
                </div>

                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div className="rejection-reason-box">
                    <Info size={14} style={{ marginRight: '8px' }} />
                    <strong>Note:</strong> {booking.rejectionReason}
                  </div>
                )}
              </div>

              <div className="booking-status-box">
                <BookingStatusBadge status={booking.status} />
                
                <BookingActionButtons 
                  booking={booking}
                  onUpdate={(id) => navigate(`/bookings/edit/${id}`)}
                  onCancelAction={handleCancelAction}
                  onReportMissingQR={handleReportMissingQR}
                  isBookingActive={isBookingActive}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card empty-state">
            <History size={64} className="empty-state-icon" />
            <h3>No reservations found</h3>
            <p>You haven't made any bookings in this category yet.</p>
            <button 
              className="action-btn btn-update" 
              style={{ marginTop: '20px', width: 'auto', background: '#6366f1', color: 'white' }}
              onClick={() => navigate('/bookings')}
            >
              Schedule a New Booking <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast animate-slide-up ${toast.type}`}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '12px',
            background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
