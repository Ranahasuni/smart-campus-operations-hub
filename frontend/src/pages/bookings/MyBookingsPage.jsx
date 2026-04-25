import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import BookingCard from './components/BookingCard';
import BookingQRModal from './components/BookingQRModal';
import Toast from '../../components/common/Toast';
import { 
  History,
  Loader2, ArrowRight
} from 'lucide-react';
import '../../styles/my-bookings.css';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeQRBooking, setActiveQRBooking] = useState(null);

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

  const handleConfirmArrival = async (id) => {
    // Basic confirmation for "I'm Here"
    try {
      const res = await authFetch(`${API}/api/check-in/${id}`, { method: 'POST' });
      if (res.ok) {
        showToast('Check-in complete! Facility is ready for use.', 'success');
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.error || 'Check-in failed. Please ensure you are at the correct location.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    }
  };

  const handleReportMissingQR = async (id) => {
    if (!window.confirm('No QR Code found? This will notify technical staff and try to verify your arrival manually. Proceed?')) return;
    
    try {
      const res = await authFetch(`${API}/api/check-in/${id}/report-missing-qr`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message || 'Issue reported successfully.');
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to report issue.', 'error');
      }
    } catch (err) {
      showToast('Connection error.', 'error');
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
    <div className="my-bookings-container animate-fade-in">
      <header className="bookings-dashboard-header">
         <LoadingSkeleton width="300px" height="40px" />
         <LoadingSkeleton width="200px" height="20px" className="mt-2" />
      </header>
      <div className="bookings-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card booking-card">
            <LoadingSkeleton height="200px" borderRadius="16px" />
          </div>
        ))}
      </div>
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

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="bookings-grid">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard 
              key={booking.id}
              booking={booking}
              onUpdate={(id) => navigate(`/bookings/edit/${id}`)}
              onCancelAction={handleCancelAction}
              onReportMissingQR={handleReportMissingQR}
              onConfirmArrival={handleConfirmArrival}
              onShowQR={(b) => setActiveQRBooking(b)}

              isBookingActive={isBookingActive}
            />
          ))
        ) : (
          <EmptyState 
            title="No reservations found"
            message="You haven't made any bookings in this category yet."
            actionLabel="Schedule a New Booking"
            actionPath="/bookings"
          />
        )}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />

      {activeQRBooking && (
        <BookingQRModal 
          booking={activeQRBooking} 
          onClose={() => setActiveQRBooking(null)} 
        />
      )}
    </div>
  );
}
