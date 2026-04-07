import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Loader2, Building2, Clock, AlertCircle, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingCalendar() {
  const { authFetch } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      const [bookRes, resRes] = await Promise.all([
        authFetch('http://localhost:8082/api/bookings'),
        authFetch('http://localhost:8082/api/resources')
      ]);
      
      const [bookData, resData] = await Promise.all([bookRes.json(), resRes.json()]);
      
      setBookings(Array.isArray(bookData) ? bookData : []);
      setResources(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':  return '#22c55e';
      case 'REJECTED':  return '#ef4444';
      case 'CANCELLED': return '#64748b';
      default:          return '#f59e0b';
    }
  };

  // 24-hour slots for the timeline
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const getSlotPosition = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const startHour = 8;
    return ((h - startHour) * 60 + m) * (100 / (15 * 60)); // Percentage across the row
  };

  const getSlotWidth = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const durationMins = (eh * 60 + em) - (sh * 60 + sm);
    return durationMins * (100 / (15 * 60)); // Percentage width
  };

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto' }} />
      <p style={{ marginTop: '20px', letterSpacing: '2px' }}>CONSTRUCTING VISUAL TIMELINE...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <Link to="/admin/bookings" style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ChevronLeft size={16} /> VIEW ALL RESERVATIONS
           </Link>
           <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
             Facility <span style={{ color: '#6366f1' }}>Visual Hub</span>
           </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <CalendarIcon size={20} color="#64748b" />
           <input 
             type="date" 
             value={selectedDate}
             onChange={e => setSelectedDate(e.target.value)}
             style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
           />
        </div>
      </header>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ minWidth: '1000px' }}>
          {/* Time Header */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '250px', padding: '24px', color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Campus Facilities</div>
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              {hours.map(h => (
                <div key={h} style={{ flex: 1, padding: '24px 0', borderLeft: '1px solid rgba(255,255,255,0.03)', color: '#475569', fontSize: '0.75rem', textAlign: 'center', position: 'relative' }}>
                  {h === 12 ? '12:00 PM' : (h > 12 ? `${h-12} PM` : `${h} AM`)}
                </div>
              ))}
            </div>
          </div>

          {/* Resource Rows */}
          {resources.map(res => {
            const dailyBookings = bookings.filter(b => b.resourceId === res.id && b.date === selectedDate);
            return (
              <div key={res.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.03)', height: '100px' }}>
                 <div style={{ width: '250px', padding: '24px', background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{res.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>{res.type} • {res.building}</div>
                 </div>
                 <div style={{ flex: 1, position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
                    {/* Visual Grid Markers */}
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex' }}>
                       {hours.map(h => <div key={h} style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.02)' }} />)}
                    </div>
                    {/* Booking Blocks */}
                    {dailyBookings.map(b => {
                      const left = getSlotPosition(b.startTime);
                      const width = getSlotWidth(b.startTime, b.endTime);
                      const color = getStatusColor(b.status);
                      return (
                        <Link 
                          key={b.id} 
                          to={`/admin/bookings/${b.id}`}
                          title={`Booking ${b.id} - ${b.status}`}
                          style={{
                            position: 'absolute', top: '15%', height: '70%', background: `${color}20`,
                            left: `${left}%`, width: `${width}%`, borderRadius: '12px',
                            border: `1px solid ${color}40`, padding: '8px 12px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                            zIndex: 1
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = `0 10px 20px ${color}20`;
                            e.currentTarget.style.zIndex = 10;
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.zIndex = 1;
                          }}
                        >
                          <div style={{ color, fontSize: '0.65rem', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.status}</div>
                          <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '500' }}>{b.startTime?.slice(0,5)} - {b.endTime?.slice(0,5)}</div>
                        </Link>
                      );
                    })}
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer style={{ marginTop: '32px', display: 'flex', gap: '24px', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '4px' }} /> PENDING
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '4px' }} /> AUTHORIZED
         </div>
      </footer>
    </div>
  );
}
