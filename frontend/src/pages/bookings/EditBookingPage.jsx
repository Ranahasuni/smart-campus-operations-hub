import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, MapPin, Users, Calendar, Clock, 
  ChevronLeft, Info, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Loader2, RotateCcw
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
  const [checkingAvailability, setCheckingAvailability] = useState(false);
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
    setCheckingAvailability(true);
    try {
      const res = await authFetch(`${API}/api/bookings/resource/${booking.resourceId}?date=${formData.date}`);
      if (res.ok) {
        const data = await res.json();
        // Exclude current booking from conflict checks
        setBookedSlots(data.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setCheckingAvailability(false);
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
    const selectedDateStr = formData.date;
    const selectedDate = new Date(selectedDateStr);
    
    if (selectedDate < now.setHours(0,0,0,0)) return "Date cannot be in the past";
    if (formData.startTime >= formData.endTime) return "Start time must be before end time";
    if (resource && formData.expectedAttendees > resource.capacity) return `Capacity exceeded (Max: ${resource.capacity})`;
    
    if (resource) {
      if (resource.status !== 'ACTIVE') return `Resource is currently ${resource.status.replace(/_/g, ' ')}`;
      
      const dayName = new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const dayAvail = resource.availability?.find(a => a.day?.toLowerCase().startsWith(dayName.substring(0, 3)));
      
      if (!dayAvail && resource.availability?.length > 0) return "The facility is closed on the selected day.";
      if (dayAvail && !dayAvail.isAvailable) return "The facility is closed on the selected date.";

      // 1. Check if within operational slots
      const isWithinSlots = dayAvail.slots?.some(slot => 
        formData.startTime >= slot.startTime && formData.endTime <= slot.endTime
      );
      if (!isWithinSlots) return "Selected time is outside operational hours for this day.";
    }

    // 2. Conflict check (excluding the current booking)
    const hasConflict = bookedSlots.some(b => 
      formData.startTime < b.endTime.substring(0, 5) && 
      formData.endTime > b.startTime.substring(0, 5)
    );
    if (hasConflict) return "Selected time overlaps with another reservation";

    return null;
  };

  const getNoAvailabilityStatus = () => {
    if (!resource || !formData.date) return false;
    const dayShort = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const dayData = resource.availability?.find(a => a.day?.toLowerCase().startsWith(dayShort.substring(0, 3)));
    
    if (!dayData) return resource.availability?.length > 0;
    
    const freeSlots = dayData.slots?.filter(slot => {
        return !bookedSlots.some(eb => 
            (eb.startTime.substring(0, 5) < slot.endTime) && (eb.endTime.substring(0, 5) > slot.startTime)
        );
    }) || [];
    
    return !dayData.isAvailable || freeSlots.length === 0;
  };

  const noAvailability = getNoAvailabilityStatus();

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
        let errorMsg = 'Update failed';
        if (data.message) errorMsg = data.message;
        else if (data.error) errorMsg = data.error;
        else if (data.messages) errorMsg = Object.values(data.messages).join(', ');
        throw new Error(errorMsg);
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

          <div className="availability-display-section" style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            background: 'rgba(15, 23, 42, 0.4)', 
            borderRadius: '20px', 
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Clock size={16} /> Real-Time Availability for {new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <button 
                type="button" 
                onClick={fetchAvailability}
                className="check-availability-mini-btn"
                style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {checkingAvailability ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Refresh
              </button>
            </div>
            
            <div className="availability-segments-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {(() => {
                const dayShort = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                const dayShortLower = dayShort.toLowerCase();
                const dayData = resource?.availability?.find(a => a.day?.toLowerCase().startsWith(dayShortLower.substring(0, 3)));
                
                if (!dayData) {
                  return resource?.availability?.length > 0
                    ? <div style={{ color: '#f87171', fontWeight: '700' }}>🔒 Facility is closed on {dayShort}.</div>
                    : <div style={{ color: '#4ade80', fontWeight: '800' }}>✅ Open for All-Day Booking</div>;
                }

                if (!dayData.isAvailable) {
                  return <div style={{ color: '#f87171', fontWeight: '700' }}>🔒 Facility is closed on this day.</div>;
                }

                return (
                  <>
                    {/* Show only slots that are COMPLETELY free (zero overlap with existing bookings) */}
                    {(() => {
                      const freeSlots = dayData.slots?.filter(slot => {
                        const hasOverlap = bookedSlots.some(eb => 
                          (eb.startTime.substring(0, 5) < slot.endTime) && (eb.endTime.substring(0, 5) > slot.startTime)
                        );
                        return !hasOverlap;
                      });

                      if (!freeSlots || freeSlots.length === 0) {
                        return (
                          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
                            <span style={{ color: '#fca5a5', fontWeight: '800', fontSize: '0.9rem' }}>
                              🚫 No available time slots left for this date.
                            </span>
                          </div>
                        );
                      }

                      return freeSlots.map((slot, idx) => (
                        <div key={`slot-${idx}`} style={{ 
                          padding: '16px 20px', 
                          background: 'rgba(34, 197, 94, 0.05)',
                          border: '2px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '16px',
                          minWidth: '200px',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '950', color: 'white' }}>{slot.startTime} — {slot.endTime}</span>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#22c55e', letterSpacing: '0.1em' }}>
                            Open for Booking
                          </span>
                        </div>
                      ));
                    })()}
                  </>
                );
              })()}
            </div>
            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
              * Note: Your existing time slot is excluded from conflicts for easier modification.
            </p>
          </div>

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
              disabled={submitting || (resource && resource.status !== 'ACTIVE') || noAvailability}
              style={{ 
                opacity: (submitting || (resource && resource.status !== 'ACTIVE') || noAvailability) ? 0.5 : 1,
                cursor: (submitting || (resource && resource.status !== 'ACTIVE') || noAvailability) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Updating...' : noAvailability ? 'Slot Unavailable' : 'Save Changes'} <ArrowRight size={18} />
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
