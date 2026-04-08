import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Clock, Users, History,
  Search, Loader2, CheckCircle2, XCircle, Clock4, Filter
} from 'lucide-react';
import '../../styles/my-bookings.css'; // Reusing established styles

const CATEGORY_MAP = {
  LAB: { name: 'Lab', icon: '🧪' },
  LECTURE_HALL: { name: 'Lecture Hall', icon: '🏛️' },
  MEETING_ROOM: { name: 'Meeting Room', icon: '🤝' },
  AUDITORIUM: { name: 'Auditorium', icon: '🎭' },
  SPORTS_FACILITY: { name: 'Sports Facility', icon: '篮球' },
  EQUIPMENT: { name: 'Equipment', icon: '📽️' },
};

export default function BookingHistoryPage() {
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

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
        
        // Filter for history: REJECTED, CANCELLED, or APPROVED in the past
        const historyData = data.filter(b => 
          b.status === 'REJECTED' || 
          b.status === 'CANCELLED' || 
          (b.status === 'APPROVED' && b.date < today)
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
    const matchesSearch = b.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
    const matchesType = typeFilter === 'ALL' ? true : b.resourceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) return (
    <div className="my-bookings-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div className="my-bookings-container animate-fade-in">
      <header className="bookings-dashboard-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Booking History</h1>
          <p style={{ color: '#94a3b8' }}>Review your past and processed reservations.</p>
        </div>

        {/* Filters Row */}
        <div className="glass-card" style={{ width: '100%', padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
            <input 
              type="text"
              placeholder="Search by resource or purpose..."
              className="glass-input"
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Filter size={16} /> Filter:
            </div>
            
            <select 
              className="glass-input" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Completed (Approved)</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select 
              className="glass-input" 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="ALL">All Resource Types</option>
              {Object.keys(CATEGORY_MAP).map(type => (
                <option key={type} value={type}>{CATEGORY_MAP[type].name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="bookings-grid" style={{ marginTop: '24px' }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="glass-card booking-card" style={{ opacity: 0.85 }}>
              <div className="resource-icon-box">
                {CATEGORY_MAP[booking.resourceType]?.icon || '📍'}
              </div>

              <div className="booking-info-main">
                <div className="resource-name-row">
                  <h3>{booking.resourceName}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    {booking.resourceType}
                  </span>
                </div>
                
                <div className="booking-meta-row">
                  <div className="meta-item"><Calendar size={14} /> {booking.date}</div>
                  <div className="meta-item"><Clock size={14} /> {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</div>
                  <div className="meta-item"><Users size={14} /> {booking.expectedAttendees} Attendees</div>
                </div>

                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  <strong>Purpose:</strong> {booking.purpose}
                </div>

                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div className="rejection-reason-box">
                    <strong>Rejection Reason:</strong> {booking.rejectionReason}
                  </div>
                )}
              </div>

              <div className="booking-status-box" style={{ justifyContent: 'center' }}>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status === 'APPROVED' ? 'COMPLETED' : booking.status}
                </span>
                
                {/* Visual indicator of flow */}
                <div style={{ marginTop: '12px', color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {booking.status === 'APPROVED' ? <CheckCircle2 size={12} color="#22c55e" /> : <XCircle size={12} color="#ef4444" />}
                  {booking.status === 'APPROVED' ? 'Admin Approved' : 'Request Terminated'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card empty-state">
            <History size={64} className="empty-state-icon" />
            <h3>No history records</h3>
            <p>Your previous reservation records will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
