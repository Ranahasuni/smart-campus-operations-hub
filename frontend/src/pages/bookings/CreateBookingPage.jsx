import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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

export default function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authFetch, API } = useAuth();

  // Parse date from URL if passed from Details page
  const queryParams = new URLSearchParams(location.search);
  
  // Get local date in YYYY-MM-DD format
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
  };

  const initialDate = queryParams.get('date') || getLocalDate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Form State
  const [formData, setFormData] = useState({
    date: initialDate,
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: 1
  });

  // Availability State
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (id && formData.date) {
      fetchAvailability();
    }
  }, [id, formData.date]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/resources/${id}`);
      if (!res.ok) throw new Error('Resource not found');
      const data = await res.json();
      setResource(data);
      setFormData(prev => ({ ...prev, expectedAttendees: Math.min(prev.expectedAttendees, data.capacity) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await authFetch(`${API}/api/bookings/resource/${id}?date=${formData.date}`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data);
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

    // Conflict Check (Client Side)
    const hasConflict = bookedSlots.some(b => 
      formData.startTime < b.endTime.substring(0, 5) && 
      formData.endTime > b.startTime.substring(0, 5)
    );
    if (hasConflict) return "Selected time slot overlaps with an existing booking";

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
      const res = await authFetch(`${API}/api/bookings`, {
        method: 'POST',
        body: JSON.stringify({
          resourceId: id,
          ...formData
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Submission failed');
      }

      showToast('Booking submitted successfully!', 'success');
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

  if (success) return (
    <div className="booking-form-container animate-fade-in">
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', margin: '0 auto 24px' }}>
          <CheckCircle2 size={48} />
        </div>
        <h1 className="gradient-text">Reservation Submitted!</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '16px' }}>
          Your booking for <strong>{resource?.name}</strong> is now <strong>PENDING</strong> approval.
        </p>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Redirecting to your bookings...</p>
      </div>
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

  return (
    <div className="booking-form-container animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: '32px' }}>
        <Link to={`/bookings/resource/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Resource
        </Link>
      </div>

      <div className="glass-card booking-form-card">
        <header className="form-header">
          <h1 className="gradient-text">Complete Your Reservation</h1>
          <p style={{ color: '#94a3b8' }}>Please provide the event details to secure your slot.</p>
          
          {resource && (
            <div className="resource-summary-box">
              <div className="resource-summary-icon">
                {CATEGORY_MAP[resource.type]?.icon || '📍'}
              </div>
              <div className="resource-summary-info">
                <h4>{resource.name}</h4>
                <p>{resource.building} • Floor {resource.floor} • Room {resource.roomNumber}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>CAPACITY</span>
                <span style={{ fontWeight: 'bold', color: '#818cf8' }}>{resource.capacity} People</span>
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
          {/* Date Picker */}
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

          {/* Expected Attendees */}
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

          {/* Availability Info */}
          <div className="availability-snapshot">
            <h5><ShieldCheck size={14} style={{ marginRight: '8px' }} /> Availability on {formData.date}</h5>
            {bookedSlots.length > 0 ? (
              <div className="booked-slots-mini">
                {bookedSlots.map(b => (
                  <div key={b.id} className="mini-slot">
                    {b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)} (Booked)
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-bookings-hint">Full day available! All slots are currently open.</p>
            )}
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>
              Resource Hours: {resource?.availableFrom} AM to {resource?.availableTo} PM
            </p>
          </div>

          {/* Time Picker - Start */}
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

          {/* Time Picker - End */}
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

          {/* Purpose */}
          <div className="form-group full-width">
            <label><HelpCircle size={16} /> Purpose of Booking</label>
            <textarea 
              name="purpose"
              className="form-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Briefly describe your event or research session..."
              value={formData.purpose}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link to={`/bookings/resource/${id}`} className="btn-cancel-booking">
              Discard
            </Link>
            <button 
              type="submit" 
              className="btn-submit-booking"
              disabled={submitting || (resource && resource.status !== 'ACTIVE')}
            >
              {submitting ? 'Confirming...' : (resource && resource.status !== 'ACTIVE' ? 'Unavailable' : 'Place Reservation')} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
        <p>By submitting this request, you agree to comply with the Smart Campus Resource Usage Policy.</p>
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
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
