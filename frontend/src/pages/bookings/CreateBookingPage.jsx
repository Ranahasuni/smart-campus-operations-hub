import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Users, Calendar, Clock, 
  ChevronLeft, Info, AlertCircle, CheckCircle2, 
  ArrowRight, Loader2, FileText
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
  const [loading, setLoading] = useState(true);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!resource) return "No resource selected.";
    if (!formData.purpose.trim()) return "Please state the purpose of the booking.";
    if (formData.startTime >= formData.endTime) return "Start time must be before end time.";
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
