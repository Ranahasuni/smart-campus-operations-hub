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
    
    if (resource) {
      if (resource.status !== 'ACTIVE') return `Resource is currently ${resource.status.replace(/_/g, ' ')}`;
      
      // Check if it's TODAY and the current time is already past resource closing hours
      const isToday = formData.date === getLocalDate();
      if (isToday) {
        const [closeH, closeM] = resource.availableTo.split(':').map(Number);
        const closeTime = new Date();
        closeTime.setHours(closeH, closeM, 0, 0);
        
        if (new Date() > closeTime) {
          return `Resource is closed for today (Closed at ${resource.availableTo}). Please select a future date.`;
        }
        
        // Also check if selected start time is in the past
        const [startH, startM] = formData.startTime.split(':').map(Number);
        const selectedStart = new Date();
        selectedStart.setHours(startH, startM, 0, 0);
        
        if (selectedStart < new Date()) {
          return "Start time cannot be in the past for current day bookings";
        }
      }

      if (formData.startTime < resource.availableFrom) return `Starts before opening (${resource.availableFrom})`;
      if (formData.endTime > resource.availableTo) return `Ends after closing (${resource.availableTo})`;
    }

    if (formData.startTime >= formData.endTime) return "Start time must be before end time";
    if (resource && formData.expectedAttendees > resource.capacity) return `Capacity exceeded (Max: ${resource.capacity})`;

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
        let errorMsg = 'Submission failed';
        if (data.message) errorMsg = data.message;
        else if (data.error) errorMsg = data.error;
        else if (data.messages) errorMsg = Object.values(data.messages).join(', ');
        throw new Error(errorMsg);
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
              <div className="resource-summary-thumb">
                {resource.imageUrls && resource.imageUrls.length > 0 ? (
                  <img src={resource.imageUrls[0]} alt={resource.name} />
                ) : (
                  <span>{CATEGORY_MAP[resource.type]?.icon || '📍'}</span>
                )}
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
            
            <div className="availability-info-grid">
               <div className="availability-section">
                  <h6>Operational Hours</h6>
                  {resource?.availability ? (
                    <div className="slots-chips">
                      {resource.availability
                        .find(a => a.day === new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short' }))
                        ?.slots.map((s, idx) => (
                          <span key={idx} className="slot-chip available">{s.startTime} - {s.endTime}</span>
                        )) || <span className="no-slots">Not available today</span>
                      }
                    </div>
                  ) : (
                    <p className="no-bookings-hint">Resource hours not specified.</p>
                  )}
               </div>

               <div className="availability-section">
                  <h6>Current Bookings</h6>
                  {bookedSlots.length > 0 ? (
                    <div className="slots-chips">
                      {bookedSlots.map(b => (
                        <span key={b.id} className="slot-chip booked">
                          {b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-bookings-hint" style={{ color: '#4ade80' }}>No bookings yet!</p>
                  )}
               </div>
            </div>
          </div>

          {/* Time Picker - Start */}
          <div className="form-group">
            <label><Clock size={16} /> Start Time</label>
            <input 
              type="time" 
              name="startTime"
              className={`form-input ${formData.startTime >= formData.endTime ? 'input-error' : ''}`}
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
              className={`form-input ${formData.startTime >= formData.endTime ? 'input-error' : ''}`}
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
            {formData.startTime >= formData.endTime && (
              <span className="input-hint-error">End time must be after start time.</span>
            )}
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
