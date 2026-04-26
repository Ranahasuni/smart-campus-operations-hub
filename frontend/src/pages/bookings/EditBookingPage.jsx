import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Users, Calendar, Clock, 
  ChevronLeft, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2, FileText, RotateCcw,
  ShieldCheck, ShieldAlert, Timer
} from 'lucide-react';
import '../../styles/booking-form.css';
import { getLocalDateString } from '../../utils/dateUtils';

const CATEGORY_MAP = {
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference', icon: '🎥' },
  LAB: { name: 'Lab', icon: '🧪' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀' },
};

export default function EditBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authFetch, API } = useAuth();

  const [booking, setBooking] = useState(null);
  const [resource, setResource] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
    additionalRequirements: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (id) fetchInitialData();
  }, [id]);

  useEffect(() => {
    const resId = booking?.resourceIds?.[0];
    if (resId && formData.date && user) {
      fetchExistingBookings(resId, formData.date);
    }
  }, [booking, formData.date, user]);

  useEffect(() => {
    let interval;
    if (lockTimer > 0) {
      interval = setInterval(() => setLockTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [lockTimer]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch the original booking
      const bRes = await authFetch(`${API}/api/bookings/${id}`);
      if (!bRes.ok) throw new Error('Booking not found or inaccessible.');
      const bData = await bRes.json();
      
      if (bData.status !== 'PENDING') {
        throw new Error('Only PENDING reservations can be modified. This booking is already processed.');
      }

      setBooking(bData);
      setFormData({
        date: bData.date,
        startTime: bData.startTime.substring(0, 5),
        endTime: bData.endTime.substring(0, 5),
        purpose: bData.purpose,
        expectedAttendees: bData.expectedAttendees || 1,
        additionalRequirements: bData.additionalRequirements || ''
      });

      // 2. Fetch resource details
      const resId = bData.resourceIds?.[0];
      if (resId) {
        const rRes = await authFetch(`${API}/api/resources/${resId}`);
        if (rRes.ok) setResource(await rRes.json());
      }
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
        // Exclude CURRENT booking being edited from the conflict list
        setExistingBookings(data.filter(b => b.id !== id && (b.status === 'PENDING' || b.status === 'APPROVED')));
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
    if (name === 'startTime' || name === 'endTime') setLockTimer(60);
  };

  const validateForm = () => {
    if (!resource) return "Facility data not loaded.";
    if (!formData.purpose.trim()) return "Please state your purpose.";
    if (formData.purpose.length < 5) return "Purpose must be at least 5 characters long.";

    // Explicit Capacity Validation
    if (parseInt(formData.expectedAttendees) > resource.capacity) {
        return `Capacity Exceeded: This facility (${resource.name}) only supports a maximum of ${resource.capacity} seats.`;
    }

    if (formData.startTime >= formData.endTime) return "Invalid duration: End time must be after start time.";
    
    // Temporal
    const todayStr = getLocalDateString();
    if (formData.date < todayStr) return "Temporal Error: Reservations must be for current or future dates.";

    // Operating Hours
    if (resource.availability) {
        const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        const dayAvail = resource.availability.find(a => a.day?.toLowerCase().startsWith(dayName.substring(0, 3)));
        if (!dayAvail || !dayAvail.isAvailable) return "Closed: Facility is not operational on this date.";
        
        const withinHours = dayAvail.slots?.some(s => formData.startTime >= s.startTime && formData.endTime <= s.endTime);
        if (!withinHours) return "Operational Error: Selected time is outside campus hours.";
    }

    // Role-Priority check against OTHERS
    const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';

    for (const eb of existingBookings) {
      const overlaps = (formData.startTime < eb.endTime && formData.endTime > eb.startTime);
      if (!overlaps) continue;

      if (eb.status === 'APPROVED') return "Conflict: Slot already fully occupied.";
      const eIsPriority = eb.requesterRole === 'LECTURER' || eb.requesterRole === 'ADMIN';
      if (eIsPriority) return "Conflict: A faculty member has senior priority.";
      if (!isLecturer) return "Conflict: Another student has a pending request for this slot.";
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
      const res = await authFetch(`${API}/api/bookings/${id}`, {
        method: 'PUT',
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
        const firstErr = errorData.validationErrors ? Object.values(errorData.validationErrors)[0] : errorData.message;
        throw new Error(firstErr || 'Update failed');
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

  if (success) return (
    <div className="booking-form-container animate-fade-in">
       <div className="glass-card success-card" style={{padding: '60px', textAlign: 'center'}}>
          <CheckCircle2 size={64} color="#22c55e" style={{marginBottom: '24px'}} />
          <h1 className="gradient-text">Changes Applied</h1>
          <p>Your reservation update has been verified. Returning to dashboard...</p>
       </div>
    </div>
  );

  return (
    <div className="booking-form-container animate-fade-in">
      <div className="breadcrumb">
        <Link to="/my-bookings" className="back-link"><ChevronLeft size={18} /> Cancel Changes</Link>
      </div>

      <div className="glass-card booking-main-card">
        <header className="form-header">
          <h1 className="gradient-text">Edit Reservation</h1>
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
          <div className="lock-timer-toast">
            <Timer size={14} className="animate-pulse" /> Conflict buffer active: {lockTimer}s
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-grid-form">
          <div className="form-left-col">
             <section className="booking-section">
                <label><Calendar size={18} /> Reschedule Date</label>
                <input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} min={getLocalDateString()} required />
             </section>

             <section className="booking-section">
                <label><Users size={18} /> Update Attendance</label>
                <input type="number" name="expectedAttendees" className="form-control" value={formData.expectedAttendees} onChange={handleInputChange} min="1" max={resource?.capacity} required />
             </section>

             <div className="time-picker-grid">
                <div className="form-group">
                   <label><Clock size={16} /> New Start</label>
                   <input type="time" name="startTime" className="form-control" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                   <label><Clock size={16} /> New End</label>
                   <input type="time" name="endTime" className="form-control" value={formData.endTime} onChange={handleInputChange} required />
                </div>
             </div>
          </div>

          <div className="form-right-col">
             <div className="availability-monitor">
                <div className="monitor-header">
                   <span><RotateCcw size={14} /> REAL-TIME VACANCY CHECK</span>
                   {checkingAvailability && <Loader2 size={14} className="animate-spin" />}
                </div>

                <div className="slot-segments">
                   {(() => {
                      const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                      const dayData = resource?.availability?.find(a => a.day?.toLowerCase().startsWith(dayName.substring(0, 3)));
                      
                      if (!dayData?.isAvailable) return <div className="status-msg closed">🚫 Service Unavailable</div>;

                      return dayData.slots?.map((s, i) => {
                         const state = getSlotState(s);
                         const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';
                         
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
                                  {visualState === 'AVAILABLE' ? 'Open for Selection' : 
                                   visualState === 'STUDENT_PENDING' ? 'Priority Overridable' :
                                   visualState === 'LECTURER_PENDING' ? 'High Priority Review' : 'Reserved / Occupied'}
                               </span>
                            </div>
                         );
                      });
                   })()}
                </div>
             </div>
          </div>

          <div className="form-footer full-width">
             <label><FileText size={18} /> Update Purpose of Visit</label>
             <textarea name="purpose" className="form-control text-area" placeholder="Provide details for the modification..." value={formData.purpose} onChange={handleInputChange} required />
             
             <div className="button-group">
                <button type="submit" disabled={submitting} className={`btn-primary ${submitting ? 'loading' : ''}`}>
                   {submitting ? 'Updating...' : 'Save Reservation Changes'}
                   <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
