import { useState, useEffect } from 'react';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}

import { useAuth } from '../../context/AuthContext';
import { isPastBooking } from '../../utils/dateUtils';
import { 
  Calendar, Clock, Users, History,
  Search, Loader2, CheckCircle2, XCircle, Clock4, Filter,
  FileText, ArrowDownRight, Tag
} from 'lucide-react';
import '../../styles/my-bookings.css'; 

const CATEGORY_MAP = {
  TEACHING_VENUE: { name: 'Teaching Venue', icon: '📖' },
  LECTURE_THEATRE: { name: 'Lecture Theatre', icon: '🏛️' },
  SEMINAR_ROOM: { name: 'Seminar Room', icon: '🗣️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference', icon: '🎥' },
  LAB: { name: 'Lab', icon: '🧪' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '🏀' },
};

export default function BookingHistoryPage() {
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/bookings/user`);
      if (res.ok) {
        const data = await res.json();
        const today = new Date().toISOString().split('T')[0];
        
        const historyData = data.filter(b => 
          b.status === 'REJECTED' || 
          b.status === 'CANCELLED' || 
          b.status === 'CHECKED_OUT' || 
          b.status === 'NO_SHOW' || 
          isPastBooking(b.date, b.endTime)
        );
        
        setBookings(historyData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (err) {
      setError('Failed to load reservation history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const resourceNamesStr = (b.resourceNames || []).join(', ').toLowerCase();
    const matchesSearch = resourceNamesStr.includes(searchTerm.toLowerCase()) || 
                         b.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="my-bookings-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: '#6B7281' }} />
    </div>
  );

  return (
    <div className="my-bookings-container animate-fade-in" style={{ backgroundColor: '#FFFFFF' }}>
      <header className="bookings-dashboard-header" style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.06)', paddingBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B7281', marginBottom: '8px' }}>
            <History size={20} />
            <span style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Records Archive</span>
          </div>
          <h1 style={{ color: '#1F1F1F', fontSize: '2.5rem', fontWeight: 800 }}>Booking History</h1>
          <p style={{ color: '#6B7281' }}>A complete log of your processed and past reservations.</p>
        </div>

        <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(250, 234, 234, 0.5)' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={16} />
            <input 
              type="text"
              placeholder="Search archive..."
              className="glass-input"
              style={{ paddingLeft: '36px', width: '250px', fontSize: '0.9rem', height: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="glass-input" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0 12px', height: '40px', fontSize: '0.9rem' }}
          >
            <option value="ALL">All Outcomes</option>
            <option value="APPROVED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="history-list" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="glass-card" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr auto', 
              gap: '24px', 
              alignItems: 'center',
              padding: '20px 24px',
              background: 'rgba(250, 234, 234, 0.3)',
              border: '1px solid rgba(192, 128, 128, 0.06)',
              opacity: 0.8
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'rgba(148, 163, 184, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#6B7281'
              }}>
                {CATEGORY_MAP[booking.resourceType]?.icon || '📍'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ color: '#4B5563', fontSize: '1.1rem', margin: 0 }}>{(booking.resourceNames || ['Unnamed Room']).join(', ')}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#C08080', fontWeight: 800 }}>
                    {booking.bookingCode || `RSV-${new Date(booking.date).getFullYear()}-${booking.id?.slice(-5).toUpperCase()}`}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>{booking.resourceType}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', color: '#6B7281', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {booking.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> {booking.expectedAttendees}</span>
                </div>

                <div style={{ color: '#475569', fontSize: '0.8rem', italic: 'true', marginTop: '4px' }}>
                  " {booking.purpose} "
                </div>

                {booking.status === 'REJECTED' && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    borderRadius: '6px',
                    borderLeft: '3px solid #ef4444',
                    fontSize: '0.8rem',
                    color: '#f87171'
                  }}>
                    <strong>Reason for Rejection:</strong> {booking.rejectionReason}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '4px 10px', 
                  borderRadius: '20px',
                  letterSpacing: '0.5px',
                  backgroundColor: booking.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 
                                  booking.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                  color: booking.status === 'APPROVED' ? '#4ade80' : 
                         booking.status === 'REJECTED' ? '#f87171' : '#94a3b8'
                }}>
                  {booking.status === 'APPROVED' ? 'COMPLETED' : booking.status}
                </span>
                <div style={{ color: '#334155', fontSize: '0.7rem' }}>
                  Processed Request
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card empty-state" style={{ padding: '80px 40px', opacity: 0.5 }}>
            <FileText size={64} style={{ color: '#FFFFFF', marginBottom: '20px' }} />
            <h3 style={{ color: '#475569' }}>Archive Empty</h3>
            <p style={{ color: '#334155' }}>No historical records found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
