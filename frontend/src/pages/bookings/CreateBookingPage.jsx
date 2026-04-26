import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Users, Calendar, Clock, 
  ChevronLeft, Info, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2, FileText, RotateCcw,
  ShieldCheck, ShieldAlert, Timer
} from 'lucide-react';
import '../../styles/booking-form.css';
import { getLocalDateString } from '../../utils/dateUtils';

// -- Shared Animation Hooks ---------------------------------

const CATEGORY_MAP = {
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
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
  const initialDate = queryParams.get('date') || getLocalDateString();

  const [resource, setResource] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [formData, setFormData] = useState({
    date: initialDate,
    startTime: '09:00',
    endTime: '11:00',
    purpose: '',
    expectedAttendees: 1,
    additionalRequirements: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (id) fetchResource(id);
  }, [id]);

  useEffect(() => {
    if (id && formData.date && user) {
      fetchExistingBookings(id, formData.date);
    }
  }, [id, formData.date, user]);

  // Slot Locking Timer Logic
  useEffect(() => {
    let interval;
    if (lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockTimer]);

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
        setExistingBookings(data.filter(b => b.status === 'PENDING' || b.status === 'APPROVED'));
      }
    } catch (err) {
      console.error("Booking fetch failed", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    // Start session lock timer when time is modified
    if (name === 'startTime' || name === 'endTime') setLockTimer(60);
  };

  const validateForm = () => {
    // 1. Basic Policy Checks
    if (!resource) return "Facility not selected.";
    if (!formData.purpose.trim()) return "Please state your purpose.";
    
    // Explicit Capacity Validation
    if (parseInt(formData.expectedAttendees) > resource.capacity) {
        return `Capacity Exceeded: This facility (${resource.name}) only supports a maximum of ${resource.capacity} seats.`;
    }

    if (formData.startTime >= formData.endTime) return "Invalid duration: End time must be after start time.";
    
    // 2. Temporal Validations
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (formData.date < todayStr) return "Temporal Error: Past dates cannot be reserved.";
    if (formData.date === todayStr) {
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      if (formData.startTime <= currentTime) return "Temporal Error: You cannot book a slot that has already started.";
    }

    // 3. Operating Hours Check
    const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const dayAvail = resource.availability?.find(a => a.day?.toLowerCase().startsWith(dayName.substring(0, 3)));
    if (!dayAvail || !dayAvail.isAvailable) return "Closed: Facility is not operational on this date.";
    
    const withinHours = dayAvail.slots?.some(s => formData.startTime >= s.startTime && formData.endTime <= s.endTime);
    if (!withinHours) return "Operational Error: Selected time is outside campus hours.";

    // 4. Overlap & Priority Matrix
    const requesterRole = user?.role?.toUpperCase();
    const isLecturer = requesterRole === 'LECTURER' || requesterRole === 'ADMIN';

    for (const eb of existingBookings) {
      const overlaps = (formData.startTime < eb.endTime && formData.endTime > eb.startTime);
      if (!overlaps) continue;

      if (eb.status === 'APPROVED') return "Conflict: Slot already fully occupied and verified.";
      
      const existingIsPriority = eb.requesterRole === 'LECTURER' || eb.requesterRole === 'ADMIN';
      if (existingIsPriority) return "Conflict: A faculty member has senior priority on this slot.";
      
      if (!isLecturer) return "Conflict: A pending request exists. Only Faculty can over-request this slot.";
    }

    return null;
  };

  const getSlotState = (slot) => {
    const overlaps = existingBookings.filter(eb => (slot.startTime < eb.endTime && slot.endTime > eb.startTime));
    const approved = overlaps.find(o => o.status === 'APPROVED');
    if (approved) return 'APPROVED';
    
    const lecturerPending = overlaps.find(o => o.requesterRole === 'LECTURER' || o.requesterRole === 'ADMIN');
    if (lecturerPending) return 'LECTURER_PENDING';
    
    const studentPending = overlaps.find(o => o.requesterRole === 'STUDENT');
    if (studentPending) return 'STUDENT_PENDING';
    
    return 'AVAILABLE';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vError = validateForm();
    if (vError) { setError(vError); return; }

    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceIds: [resource.id],
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          purpose: formData.purpose,
          expectedAttendees: parseInt(formData.expectedAttendees),
          additionalRequirements: formData.additionalRequirements
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        // If there are detailed validation errors, pick the first one for the main banner
        if (errorData.validationErrors) {
          const firstErr = Object.values(errorData.validationErrors)[0];
          throw new Error(firstErr || 'Invalid form data');
        }
        throw new Error(errorData.message || 'Submission failed');
      }
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader-overlay"><Loader2 className="animate-spin" size={48} color="#C08080" /></div>;

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ background: '#FFFFFF', padding: '48px 40px', borderRadius: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Reservation Successful</h2>
          <p style={{ color: '#6B7281', fontSize: '1.05rem', fontWeight: '500', marginBottom: '40px', lineHeight: '1.5' }}>Your request has been filed in the campus ledger. Redirecting...</p>
          <button onClick={() => navigate('/my-bookings')} style={{ background: 'none', border: 'none', color: '#111827', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', padding: '10px 20px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container animate-fade-in">
      <div className="breadcrumb">
        <Link to={`/resources/${id}`} className="back-link"><ChevronLeft size={18} /> Facility Specs</Link>
      </div>

      <div className="glass-card booking-main-card">
        <header className="form-header">
          <h1 className="gradient-text">Smart Reservation</h1>
          <div className="resource-header-chip">
             <div className="thumb">{CATEGORY_MAP[resource?.type]?.icon || '📍'}</div>
             <div className="info">
                <h3>{resource?.name}</h3>
                <span>{resource?.building} • Max {resource?.capacity} Seats</span>
             </div>
          </div>
        </header>

        {error && <div className="error-alert"><AlertCircle size={20} /> {error}</div>}

        {lockTimer > 0 && (
          <div className="lock-timer-toast animate-slide-up">
            <Timer size={14} className="animate-pulse" /> Slot availability locked for {lockTimer}s
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-grid-form">
          <div className="form-left-col">
             <section className="booking-section">
                <label><Calendar size={18} /> Reservation Date</label>
                <input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} min={getLocalDateString()} required />
             </section>

             <section className="booking-section">
                <label><Users size={18} /> Occupancy Load</label>
                <input type="number" name="expectedAttendees" className="form-control" value={formData.expectedAttendees} onChange={handleInputChange} min="1" max={resource?.capacity} required />
             </section>

             <div className="time-picker-grid">
                <div className="form-group">
                   <label><Clock size={16} /> Start</label>
                   <input type="time" name="startTime" className="form-control" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                   <label><Clock size={16} /> End</label>
                   <input type="time" name="endTime" className="form-control" value={formData.endTime} onChange={handleInputChange} required />
                </div>
             </div>
          </div>

          <div className="form-right-col">
             <div className="availability-monitor">
                <div className="monitor-header">
                   <span><RotateCcw size={14} /> LIVE AVAILABILITY LOG</span>
                   {checkingAvailability && <Loader2 size={14} className="animate-spin" />}
                </div>

                <div className="slot-segments">
                   {(() => {
                      const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                      const dayData = resource?.availability?.find(a => a.day?.toLowerCase().startsWith(dayName.substring(0, 3)));
                      
                      if (!dayData?.isAvailable) return <div className="status-msg closed">🚫 Closed Service Date</div>;

                      return dayData.slots?.map((s, i) => {
                         const state = getSlotState(s);
                         const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';
                         
                         // Visual override: For standard students, Pending slots look like Occupied slots.
                         // Faculty can still see the priority opportunity.
                         let visualState = state;
                         if (state === 'STUDENT_PENDING' && !isLecturer) visualState = 'APPROVED';

                         return (
                            <div key={i} className={`slot-chip ${visualState.toLowerCase()}`}>
                               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <span className="time">{s.startTime} - {s.endTime}</span>
                                  {visualState === 'AVAILABLE' && <CheckCircle2 size={14} color="#4ade80" />}
                                  {visualState === 'STUDENT_PENDING' && <ShieldAlert size={14} color="#fbbf24" />}
                                  {visualState === 'LECTURER_PENDING' && <ShieldCheck size={14} color="#c08080" />}
                                  {visualState === 'APPROVED' && <div className="dot" />}
                               </div>
                               <span className="label">
                                  {visualState === 'AVAILABLE' ? 'Open for Booking' : 
                                   visualState === 'STUDENT_PENDING' ? 'Priority Overridable' :
                                   visualState === 'LECTURER_PENDING' ? 'High Priority Review' : 'Reserved / In Review'}
                               </span>
                            </div>
                         );
                      });
                   })()}
                </div>
             </div>
          </div>

          <div className="form-footer full-width">
             <label><FileText size={18} /> Purpose of Use</label>
             <textarea name="purpose" className="form-control text-area" placeholder="Briefly describe the university activity..." value={formData.purpose} onChange={handleInputChange} required />
             
             <div className="button-group">
                <button type="submit" disabled={submitting} className={`btn-primary ${submitting ? 'loading' : ''}`}>
                   {submitting ? 'Syncing...' : (getSlotState({startTime: formData.startTime, endTime: formData.endTime}) === 'STUDENT_PENDING' && (user?.role === 'LECTURER' || user?.role === 'ADMIN')) ? 'Request with Priority' : 'Confirm Reservation'}
                   <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
