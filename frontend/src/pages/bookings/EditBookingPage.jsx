import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, MapPin, Users, Calendar, Clock, 
  ChevronLeft, Info, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Loader2
} from 'lucide-react';
import '../../styles/booking-form.css';

const CATEGORY_MAP = {
  LAB: { name: 'Lab', icon: '🧪' },
  LECTURE_HALL: { name: 'Lecture Hall', icon: '🏛️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀' },
  EQUIPMENT: { name: 'Equipment', icon: '📽️' },
};

export default function EditBookingPage() {
  const { id } = useParams(); // This is the bookingId
  const navigate = useNavigate();
  const { authFetch, API } = useAuth();

  const [booking, setBooking] = useState(null);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1
  });

  const [bookedSlots, setBookedSlots] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (booking?.resourceId && formData.date) {
      fetchAvailability();
    }
  }, [booking?.resourceId, formData.date]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Booking
      const bRes = await authFetch(`${API}/api/bookings/${id}`);
      if (!bRes.ok) throw new Error('Booking not found');
      const bData = await bRes.json();
      
      if (bData.status !== 'PENDING') {
          throw new Error('Only pending bookings can be edited');
      }

      setBooking(bData);
      setFormData({
        date: bData.date,
        startTime: bData.startTime.substring(0, 5),
        endTime: bData.endTime.substring(0, 5),
        purpose: bData.purpose,
        expectedAttendees: bData.expectedAttendees,
        resourceId: bData.resourceId
      });

      // 2. Fetch Resource
      const rRes = await authFetch(`${API}/api/resources/${bData.resourceId}`);
      if (rRes.ok) {
        setResource(await rRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await authFetch(`${API}/api/bookings/resource/${booking.resourceId}?date=${formData.date}`);
      if (res.ok) {
        const data = await res.json();
        // Exclude current booking from conflict checks
        setBookedSlots(data.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
  };

  const validateForm = () => {
    const now = new Date();
    const selectedDate = new Date(formData.date);
    
    if (selectedDate < now.setHours(0,0,0,0)) return "Date cannot be in the past";
    if (formData.startTime >= formData.endTime) return "Start time must be before end time";
    if (resource && formData.expectedAttendees > resource.capacity) return `Capacity exceeded (Max: ${resource.capacity})`;
    
    if (resource) {
      if (resource.status !== 'ACTIVE') return `Resource is currently ${resource.status.replace(/_/g, ' ')}`;
      if (formData.startTime < resource.availableFrom) return `Starts before opening (${resource.availableFrom})`;
      if (formData.endTime > resource.availableTo) return `Ends after closing (${resource.availableTo})`;
    }

    const hasConflict = bookedSlots.some(b => 
      formData.startTime < b.endTime.substring(0, 5) && 
      formData.endTime > b.startTime.substring(0, 5)
    );
    if (hasConflict) return "Selected time slot overlaps with another reservation";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/api/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }

      showToast('Reservation updated successfully!', 'success');
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="booking-form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1' }} />
    </div>
  );

  if (error && !booking) return (
    <div className="booking-form-container">
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p>{error}</p>
        <Link to="/my-bookings" className="btn-submit-booking" style={{ marginTop: '24px', display: 'inline-flex' }}>
          Back to My Bookings
        </Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="booking-form-container animate-fade-in">
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', margin: '0 auto 24px' }}>
          <CheckCircle2 size={48} />
        </div>
        <h1 className="gradient-text">Reservation Updated!</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '16px' }}>
          Your changes for <strong>{resource?.name}</strong> have been saved.
        </p>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="booking-form-container animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: '32px' }}>
        <Link to="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Cancel Editing
        </Link>
      </div>

      <div className="glass-card booking-form-card">
        <header className="form-header">
          <h1 className="gradient-text">Modify Reservation</h1>
          <p style={{ color: '#94a3b8' }}>Update your booking details while it's still pending.</p>
          
          {resource && (
            <div className="resource-summary-box">
              <div className="resource-summary-thumb">
                {resource.imageUrls && resource.imageUrls.length > 0 ? (
                  <img src={resource.imageUrls[0]} alt={resource.name} />
                ) : (
                  <span>{CATEGORY_MAP[resource.type]?.icon || '📍'}</span>
                )}
              </div>
              <div className="resource-summary-info">
                <h4>{resource.name}</h4>
                <p>{resource.building} • Floor {resource.floor}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span className={`status-badge status-PENDING`}>PENDING</span>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form className="booking-main-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Calendar size={16} /> Booking Date</label>
            <input 
              type="date" 
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleInputChange}
              min={getLocalDate()}
              required
            />
          </div>

          <div className="form-group">
            <label><Users size={16} /> Expected Attendees</label>
            <input 
              type="number" 
              name="expectedAttendees"
              className="form-input"
              value={formData.expectedAttendees}
              onChange={handleInputChange}
              min="1"
              max={resource?.capacity || 100}
              required
            />
          </div>

          <div className="availability-snapshot">
            <h5><ShieldCheck size={14} style={{ marginRight: '8px' }} /> Availability on {formData.date}</h5>
            {bookedSlots.length > 0 ? (
              <div className="booked-slots-mini">
                {bookedSlots.map(b => (
                  <div key={b.id} className="mini-slot">
                    {b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)} (Taken)
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-bookings-hint">No other conflicts found for this day!</p>
            )}
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>
              Note: Your current slot is hidden from this list.
            </p>
          </div>

          <div className="form-group">
            <label><Clock size={16} /> Start Time</label>
            <input 
              type="time" 
              name="startTime"
              className="form-input"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label><Clock size={16} /> End Time</label>
            <input 
              type="time" 
              name="endTime"
              className="form-input"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label><HelpCircle size={16} /> Purpose of Booking</label>
            <textarea 
              name="purpose"
              className="form-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={formData.purpose}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <Link to="/my-bookings" className="btn-cancel-booking">
              Discard Changes
            </Link>
            <button 
              type="submit" 
              className="btn-submit-booking"
              disabled={submitting || (resource && resource.status !== 'ACTIVE')}
            >
              {submitting ? 'Updating...' : (resource && resource.status !== 'ACTIVE' ? 'Unavailable' : 'Save Changes')} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <div 
          className={`toast animate-slide-up ${toast.type}`}
          style={{
            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', borderRadius: '12px', background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
