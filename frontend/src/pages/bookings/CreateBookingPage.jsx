import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Users, Calendar, Clock, 
  ChevronLeft, Info, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2, FileText, RotateCcw
} from 'lucide-react';
import '../../styles/booking-form.css';

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

export default function CreateBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authFetch, API } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
  };

  const initialDate = queryParams.get('date') || getLocalDate();

  const [resource, setResource] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: initialDate,
    startTime: '09:00',
    endTime: '11:00',
    purpose: '',
    expectedAttendees: 1,
    additionalRequirements: ''
  });

  useEffect(() => {
    if (id) {
       fetchResource(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && formData.date) {
      fetchExistingBookings(id, formData.date);
    }
  }, [id, formData.date]);

  const fetchResource = async (resId) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/resources/${resId}`);
      if (!res.ok) throw new Error('Resource not found');
      const data = await res.json();
      setResource(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingBookings = async (resId, date) => {
    setCheckingAvailability(true);
    try {
      const res = await authFetch(`${API}/api/bookings/resource/${resId}?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        // Filter for active bookings (PENDING or APPROVED)
        setExistingBookings(data.filter(b => b.status === 'PENDING' || b.status === 'APPROVED'));
      }
    } catch (err) {
      console.error("Failed to fetch existing bookings:", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!resource) return "No resource selected.";
    if (resource.status !== 'ACTIVE') return `This resource is currently ${resource.status.replace('_', ' ')} and cannot be booked.`;
    if (!formData.purpose.trim()) return "Please state the purpose of the booking.";
    if (formData.startTime >= formData.endTime) return "Start time must be before end time.";
    if (parseInt(formData.expectedAttendees) > resource.capacity) return `The expected attendees exceed the resource capacity (${resource.capacity}).`;

    const dayName = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short' });
    const dayAvail = resource.availability?.find(a => a.day === dayName);
    
    if (!dayAvail || !dayAvail.isAvailable) {
      return "The facility is closed on the selected date.";
    }

    // 1. Check if within operational hours
    const isWithinSlots = dayAvail.slots?.some(slot => 
      formData.startTime >= slot.startTime && formData.endTime <= slot.endTime
    );

    if (!isWithinSlots) {
      return "The selected time duration is outside the facility's operational hours.";
    }

    // 2. CONFLICT CHECK: (existing.start < new.end) AND (existing.end > new.start)
    const hasConflict = existingBookings.some(eb => {
      // Overlap logic: [eb.start, eb.end] overlaps [new.start, new.end]
      return (eb.startTime < formData.endTime) && (eb.endTime > formData.startTime);
    });

    if (hasConflict) {
      return "The selected time overlaps with an existing reservation. Please check the availability log above.";
    }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceIds: [resource.id],
          userId: user.id,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          purpose: formData.purpose,
          expectedAttendees: parseInt(formData.expectedAttendees),
          additionalRequirements: formData.additionalRequirements,
          isExternalUser: false,
          requiresCatering: false,
          totalFee: 0
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Booking submission failed');
      }

      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
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
        <h1 className="gradient-text">Booking Submitted!</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Your campus reservation has been received. Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div className="booking-form-container animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: '32px' }}>
        <Link to={`/resources/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Resource
        </Link>
      </div>

      <div className="glass-card booking-form-card">
        <header className="form-header" style={{ marginBottom: '32px' }}>
          <h1 className="gradient-text">Campus Facility Reservation</h1>
          <p style={{ color: '#94a3b8' }}>Internal Booking System (Students & Staff)</p>
          
          {resource && (
            <div className="resource-summary-box" style={{ marginTop: '32px' }}>
              <div className="resource-summary-thumb" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
                 <span>{CATEGORY_MAP[resource.type]?.icon || '📍'}</span>
              </div>
              <div style={{ flex: 1 }}>
                 <h3 style={{ margin: 0, color: 'white' }}>{resource.name}</h3>
                 <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{resource.building} • Floor {resource.floor} • Capacity: {resource.capacity}</p>
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
          <div className="form-section-title"><Calendar size={20} /> Schedule & Attendees</div>
          
          <div className="form-grid">
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
                <label><Users size={16} /> Attendees</label>
                <input 
                    type="number" 
                    name="expectedAttendees"
                    className="form-input"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    min="1"
                    required
                />
            </div>

            </div>

          {/* AVAILABILITY & CONFLICT DISPLAY */}
          {resource && (
            <div className="availability-display-box" style={{ 
              marginBottom: '24px', 
              padding: '24px', 
              background: 'rgba(15, 23, 42, 0.4)', 
              borderRadius: '20px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Clock size={16} /> Real-Time Availability for {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <button 
                  type="button" 
                  onClick={() => fetchExistingBookings(id, formData.date)}
                  className="check-availability-mini-btn"
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {checkingAvailability ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Refresh
                </button>
              </div>
              
              <div className="availability-segments-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {(() => {
                  const dayShort = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short' });
                  const dayData = resource.availability?.find(a => a.day === dayShort);
                  
                  if (!dayData || !dayData.isAvailable) {
                    return <div style={{ color: '#f87171', fontWeight: '700' }}>🔒 Facility is closed on this day.</div>;
                  }

                  return (
                    <>
                      {/* Operational Slots with Smart Overlap Detection */}
                      {dayData.slots?.map((slot, idx) => {
                        const slotStart = slot.startTime;
                        const slotEnd = slot.endTime;

                        // Find all bookings that fall within or overlap this specific slot
                        const bookingsInSlot = existingBookings.filter(eb => 
                          (eb.startTime < slotEnd) && (eb.endTime > slotStart)
                        );

                        const isTotalConflict = bookingsInSlot.some(b => b.startTime <= slotStart && b.endTime >= slotEnd);
                        const isPartialConflict = !isTotalConflict && bookingsInSlot.length > 0;
                        
                        let statusText = 'Available';
                        let statusColor = '#4ade80';
                        let bgColor = 'rgba(34, 197, 94, 0.05)';
                        let borderColor = 'rgba(34, 197, 94, 0.2)';

                        if (isTotalConflict) {
                           statusText = 'Fully Booked';
                           statusColor = '#f87171';
                           bgColor = 'rgba(239, 68, 68, 0.1)';
                           borderColor = 'rgba(239, 68, 68, 0.3)';
                        } else if (isPartialConflict) {
                           statusText = 'Partially Occupied';
                           statusColor = '#fbbf24';
                           bgColor = 'rgba(245, 158, 11, 0.08)';
                           borderColor = 'rgba(245, 158, 11, 0.3)';
                        }

                        return (
                          <div key={`slot-${idx}`} style={{ 
                            padding: '16px 20px', 
                            background: bgColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: '16px',
                            minWidth: '200px',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: '900', color: 'white' }}>{slotStart} — {slotEnd}</span>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', color: statusColor, letterSpacing: '0.05em' }}>
                              {statusText}
                            </span>
                            
                            {isPartialConflict && (
                              <div style={{ marginTop: '10px', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                <strong>Occupied Segments:</strong>
                                {bookingsInSlot.map((b, i) => (
                                  <div key={i} style={{ color: '#fbbf24', marginTop: '2px' }}>• {b.startTime} - {b.endTime}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {dayData.slots?.length === 0 && <div style={{ color: '#94a3b8' }}>No operational slots defined for this day.</div>}
                    </>
                  );
                })()}
              </div>

              {/* Status & Capacity Check Footer */}
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '8px', borderRadius: '10px', background: resource.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                      <CheckCircle2 size={16} color={resource.status === 'ACTIVE' ? '#4ade80' : '#ef4444'} />
                   </div>
                   <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Facility Status</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'white' }}>{resource.status}</div>
                   </div>
                </div>
                
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '8px', borderRadius: '10px', background: parseInt(formData.expectedAttendees) > resource.capacity ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}>
                      <Users size={16} color={parseInt(formData.expectedAttendees) > resource.capacity ? '#ef4444' : '#818cf8'} />
                   </div>
                   <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Occupancy Headcount</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '900', color: parseInt(formData.expectedAttendees) > resource.capacity ? '#ef4444' : 'white' }}>
                        {formData.expectedAttendees} / {resource.capacity} Seats
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-grid">
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
          </div>

          <div className="form-section-title" style={{marginTop:'24px'}}><FileText size={20} /> Booking Details</div>
          
          <div className="form-group full-width">
            <label>Purpose of Booking</label>
            <input 
                type="text"
                name="purpose"
                className="form-input"
                placeholder="e.g., Weekly Seminar, Society Workshop"
                value={formData.purpose}
                onChange={handleInputChange}
                required
            />
          </div>

          <div className="form-group full-width">
            <label>Additional Requirements / Comments</label>
            <textarea 
                name="additionalRequirements"
                className="form-input"
                style={{ minHeight: '100px' }}
                placeholder="List any equipment needs or specific room setup requests..."
                value={formData.additionalRequirements}
                onChange={handleInputChange}
            />
          </div>

          <div className="policy-box">
             <Info size={18} />
             <div>
                <strong>Important Policy</strong>
                <p>Campus bookings are free for sanctioned academic and student activities. No catering permitted in teaching venues. Please vacate 10 minutes prior to end time.</p>
             </div>
          </div>

          <div className="form-actions" style={{marginTop: '32px'}}>
            <Link to={`/resources/${id}`} className="btn-cancel-booking" style={{textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'}}>
              Discard
            </Link>
            <button 
              type="submit" 
              className="btn-submit-booking"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Reservation'} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
