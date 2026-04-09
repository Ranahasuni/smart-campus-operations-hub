import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Loader2, Building2, Clock, AlertCircle, Info,
  FastForward, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingCalendar() {
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update line every minute
    return () => clearInterval(timer);
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      const [bookRes, resRes] = await Promise.all([
        authFetch(`${API}/api/bookings/all`),
        authFetch(`${API}/api/resources`)
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':  return { color: '#22c55e', label: 'Authorized', bg: 'rgba(34, 197, 94, 0.1)' };
      case 'REJECTED':  return { color: '#ef4444', label: 'Declined', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'CANCELLED': return { color: '#94a3b8', label: 'Withdrawn', bg: 'rgba(148, 163, 184, 0.1)' };
      default:          return { color: '#f59e0b', label: 'Pending', bg: 'rgba(245, 158, 11, 0.1)' };
    }
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const getSlotPosition = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const startHour = 8;
    return ((h - startHour) * 60 + m) * (100 / (15 * 60));
  };

  const getSlotWidth = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const durationMins = (eh * 60 + em) - (sh * 60 + sm);
    return durationMins * (100 / (15 * 60));
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const nowPos = isToday ? getSlotPosition(`${currentTime.getHours()}:${currentTime.getMinutes()}`) : null;

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto', color: '#6366f1' }} />
      <p style={{ marginTop: '20px', letterSpacing: '4px', fontWeight: 'bold' }}>SYNCHRONIZING TIMELINE...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1450px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <Link to="/admin/bookings" style={{ color: '#6366f1', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
              <ChevronLeft size={16} /> RETURN TO LEDGER
           </Link>
           <h1 style={{ fontSize: '2.75rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1.5px' }}>
             Visual <span style={{ color: '#6366f1' }}>Schedule Hub</span>
           </h1>
           <p style={{ color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Master timeline of campus facility occupancy and resource utilization.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
             style={{
               background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
               color: '#818cf8', padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
               display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.85rem'
             }}
           >
             <Target size={18} /> TODAY
           </button>
           <div style={{ 
             display: 'flex', alignItems: 'center', gap: '16px', 
             background: 'rgba(15, 23, 42, 0.6)', padding: '12px 20px', 
             borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' 
           }}>
              <CalendarIcon size={20} color="#6366f1" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
              />
           </div>
        </div>
      </header>

      {/* Main Timeline Grid */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.4)', 
        borderRadius: '32px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ minWidth: '1200px' }}>
          {/* Time Header */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '280px', padding: '24px', color: '#64748b', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Campus Facilities</div>
            <div style={{ flex: 1, display: 'flex' }}>
              {hours.map(h => (
                <div key={h} style={{ flex: 1, padding: '24px 0', borderLeft: '1px solid rgba(255,255,255,0.03)', color: '#475569', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                  {h === 12 ? '12 PM' : (h > 12 ? `${h-12} PM` : `${h} AM`)}
                </div>
              ))}
            </div>
          </div>

          {/* Resource Rows */}
          <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {resources.map(res => {
              const dailyBookings = bookings.filter(b => b.resourceId === res.id && b.date === selectedDate);
              return (
                <div key={res.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.03)', height: '110px', position: 'relative' }}>
                   <div style={{ width: '280px', padding: '24px', background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#6366f1" /> {res.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px', fontWeight: '500' }}>
                        {res.building} • Floor {res.floor}
                      </div>
                   </div>

                   <div style={{ flex: 1, position: 'relative', background: 'rgba(255,255,255,0.005)' }}>
                      {/* Grid Background Horizontal Markers */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex' }}>
                         {hours.map(h => <div key={h} style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.02)' }} />)}
                      </div>

                      {/* LIVE TIME INDICATOR */}
                      {nowPos !== null && nowPos >= 0 && nowPos <= 100 && (
                        <div style={{ 
                          position: 'absolute', top: 0, bottom: 0, left: `${nowPos}%`, 
                          width: '2px', background: '#f43f5e', zIndex: 5,
                          boxShadow: '0 0 10px #f43f5e'
                        }}>
                          <div style={{ position: 'absolute', top: '-10px', left: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
                        </div>
                      )}

                      {/* Booking Blocks */}
                      {dailyBookings.map(b => {
                        const left = getSlotPosition(b.startTime);
                        const width = getSlotWidth(b.startTime, b.endTime);
                        const style = getStatusStyle(b.status);
                        
                        return (
                          <Link 
                            key={b.id} 
                            to={`/admin/bookings/${b.id}`}
                            style={{
                              position: 'absolute', top: '15%', height: '70%', background: style.bg,
                              left: `${left}%`, width: `${width}%`, borderRadius: '16px',
                              border: `1.5px solid ${style.color}40`, padding: '12px',
                              display: 'flex', flexDirection: 'column', justifyContent: 'center',
                              textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              zIndex: 1, backdropFilter: 'blur(4px)'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                              e.currentTarget.style.boxShadow = `0 15px 30px ${style.color}30`;
                              e.currentTarget.style.borderColor = style.color;
                              e.currentTarget.style.zIndex = 10;
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.borderColor = `${style.color}40`;
                              e.currentTarget.style.zIndex = 1;
                            }}
                          >
                            <div style={{ color: style.color, fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{style.label}</div>
                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={12} /> {b.startTime?.slice(0,5)}
                            </div>
                          </Link>
                        );
                      })}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Professional Legend */}
      <footer style={{ 
        marginTop: '40px', 
        padding: '30px', 
        background: 'rgba(15, 23, 42, 0.4)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
         <div style={{ display: 'flex', gap: '32px' }}>
           <LegendItem color="#f59e0b" label="PENDING" desc="Awaiting Moderation" />
           <LegendItem color="#22c55e" label="AUTHORIZED" desc="Space Confirmed" />
           <LegendItem color="#ef4444" label="DECLINED" desc="Conflict / Denied" />
           <LegendItem color="#94a3b8" label="WITHDRAWN" desc="Cancelled / Archived" />
         </div>
         <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Info size={16} /> CLICK ANY BLOCK TO REVIEW REQUEST DETAILS
         </div>
      </footer>
    </div>
  );
}

function LegendItem({ color, label, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '16px', height: '16px', background: color, borderRadius: '6px', boxShadow: `0 0 10px ${color}40` }} />
      <div>
        <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>{label}</div>
        <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: '500' }}>{desc}</div>
      </div>
    </div>
  );
}
