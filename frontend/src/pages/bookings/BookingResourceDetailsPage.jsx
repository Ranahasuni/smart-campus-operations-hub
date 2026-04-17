import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, MapPin, Users, Calendar, Clock, 
  ChevronLeft, Info, CheckCircle2, AlertTriangle, 
  XCircle, HardDrive, ArrowRight, Loader2
} from 'lucide-react';
import '../../styles/resource-details.css';

const CATEGORY_MAP = {
  TEACHING_VENUE: { name: 'Teaching Venue', icon: '📖', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️', roles: ['ADMIN', 'LECTURER'] },
  LECTURE_HALL: { name: 'Lecture Hall', icon: '🏛️', roles: ['ADMIN', 'LECTURER'] },
  SEMINAR_ROOM: { name: 'Seminar Room', icon: '🗣️', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝', roles: ['ADMIN', 'STUDENT', 'LECTURER'] },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference Room', icon: '🎥', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  LAB: { name: 'Lab', icon: '🧪', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭', roles: ['ADMIN', 'LECTURER'] },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀', roles: ['ADMIN', 'STUDENT'] },
};

export default function BookingResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authFetch, API } = useAuth();

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
  };

  const [resource, setResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchBookedSlots();
    }
  }, [id, selectedDate]);

  const fetchResourceDetails = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/resources/${id}`);
      if (!res.ok) throw new Error('Resource not found');
      const data = await res.json();
      
      // Role Validation
      const category = CATEGORY_MAP[data.type];
      if (user && category && !category.roles.includes(user.role)) {
        navigate('/bookings');
        return;
      }
      
      setResource(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const res = await authFetch(`${API}/api/bookings/resource/${id}?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const statusInfo = useMemo(() => {
    if (!resource) return null;
    switch (resource.status) {
      case 'ACTIVE': return { class: 'status-active', icon: <CheckCircle2 size={16} />, label: 'Operational' };
      case 'UNDER_MAINTENANCE': return { class: 'status-maintenance', icon: <AlertTriangle size={16} />, label: 'Maintenance' };
      case 'OUT_OF_SERVICE': return { class: 'status-failure', icon: <XCircle size={16} />, label: 'Off-line' };
      default: return { class: '', icon: <Info size={16} />, label: resource.status };
    }
  }, [resource]);

  if (loading) return (
    <div className="booking-details-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1' }} />
    </div>
  );

  if (error || !resource) return (
    <div className="booking-details-container">
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <XCircle size={48} color="#f87171" style={{ marginBottom: '16px' }} />
        <h1>Facility Unreachable</h1>
        <p>{error || 'The requested resource could not be found.'}</p>
        <Link to="/bookings" className="btn-proceed" style={{ marginTop: '24px', width: 'auto', display: 'inline-flex' }}>
          Return to Reservations
        </Link>
      </div>
    </div>
  );

  return (
    <div className="booking-details-container animate-fade-in">
      <div className="breadcrumb" style={{ marginBottom: '32px' }}>
        <Link to={`/bookings/resources/${resource.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="details-layout">
        <main className="details-main">
          <div className="glass-card booking-details-main" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="resource-hero-section">
              {resource.imageUrls && resource.imageUrls.length > 0 ? (
                <div className="hero-image-container">
                  <img src={resource.imageUrls[0]} alt={resource.name} className="hero-main-img" />
                  {resource.imageUrls.length > 1 && (
                    <div className="hero-gallery-preview">
                      {resource.imageUrls.slice(1, 4).map((url, i) => (
                        <img key={i} src={url} alt="Gallery" className="gallery-thumb" />
                      ))}
                      {resource.imageUrls.length > 4 && (
                        <div className="gallery-more">+{resource.imageUrls.length - 4}</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="hero-placeholder">
                  <div className="placeholder-icon">
                    {CATEGORY_MAP[resource.type]?.icon}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '32px' }}>
              <header className="details-header">
              <div className="resource-type-badge">
                {CATEGORY_MAP[resource.type]?.icon} {CATEGORY_MAP[resource.type]?.name || resource.type}
              </div>
              <h1>{resource.name}</h1>
              <div className={`status-indicator ${statusInfo.class}`}>
                <span className="status-dot"></span>
                {statusInfo.label}
              </div>
            </header>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value"><MapPin size={18} /> {resource.building}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '26px' }}>Floor {resource.floor}, Room {resource.roomNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Capacity</span>
                <span className="info-value"><Users size={18} /> {resource.capacity} Seats</span>
              </div>
              <div className="info-item">
                <span className="info-label">Hours</span>
                <span className="info-value"><Clock size={18} /> {resource.availableFrom} - {resource.availableTo}</span>
              </div>
            </div>

            <section className="description-section">
              <h3>About this facility</h3>
              <p>{resource.description || 'No detailed description available for this resource.'}</p>
            </section>

            {resource.equipment && resource.equipment.length > 0 && (
              <section className="equipment-section">
                <h3>Technical Inventory</h3>
                <div className="equipment-grid">
                  {resource.equipment.map((item, idx) => (
                    <div key={idx} className="equipment-pill">
                      <HardDrive size={14} style={{ marginRight: '8px', opacity: 0.5 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}
            </div>
          </div>
        </main>

        <aside className="details-sidebar">
          <div className="glass-card availability-card">
            <h2>Availability</h2>
            
            <div className="date-picker-wrapper">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>Select Booking Date</label>
              <input 
                type="date" 
                className="date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getLocalDate()}
              />
            </div>

            <div className="slots-section">
              <h4>Reserved Time Slots</h4>
              <div className="slots-list">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div key={b.id} className="slot-item slot-booked">
                      <span className="slot-label">Booked</span>
                      <span>{b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)}</span>
                    </div>
                  ))
                ) : (
                  <div className="slot-item slot-available">
                    <span className="slot-label">Open</span>
                    <span>No reservations found for this date.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="book-now-container">
              <button 
                className="btn-proceed" 
                disabled={resource.status !== 'ACTIVE'}
                onClick={() => navigate(`/bookings/create/${resource.id}?date=${selectedDate}`)}
              >
                Proceed to Book <ArrowRight size={20} />
              </button>
              {resource.status !== 'ACTIVE' && (
                <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>
                  This resource is currently unavailable for booking.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
