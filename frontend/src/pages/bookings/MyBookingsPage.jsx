import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  FUNCTION_SPACE: { name: 'Function Space', icon: '🎉' },
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
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchBookings();
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

  const filteredBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    const isHistory = b.status === 'REJECTED' || b.status === 'CANCELLED' || (b.status === 'APPROVED' && b.date < today);
    if (isHistory) return false;
    
    return activeTab === 'ALL' ? true : b.status === activeTab;
  });

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
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
                
                <div className="booking-actions">
                  {booking.status === 'PENDING' && (
                    <>
                      <button 
                        className="action-btn btn-update"
                        onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                      >
                        <Pencil size={14} /> Update
                      </button>
                      <button 
                        className="action-btn btn-withdraw"
                        onClick={() => handleCancelAction(booking.id, 'PENDING')}
                      >
                        <Trash2 size={14} /> Withdraw
                      </button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <button 
                      className="action-btn btn-cancel"
                      onClick={() => handleCancelAction(booking.id, 'APPROVED')}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
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
