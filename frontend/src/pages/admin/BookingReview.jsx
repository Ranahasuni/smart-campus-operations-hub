import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, 
  MapPin, Clock, Calendar, Users, Info, ShieldAlert,
  Loader2, BadgeHelp
} from 'lucide-react';

export default function BookingReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, [id]);

  const fetchReviewData = async () => {
    try {
      const [bookRes, confRes] = await Promise.all([
        authFetch(`http://localhost:8081/api/bookings/${id}`),
        authFetch(`http://localhost:8081/api/bookings/conflicts/${id}`)
      ]);
      
      if (!bookRes.ok) throw new Error('Could not retrieve reservation details');
      
      const bookData = await bookRes.json();
      const confData = confRes.ok ? await confRes.json() : [];
      
      setBooking(bookData);
      setConflicts(confData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (status) => {
    if (status === 'REJECTED' && !reason.trim()) {
      alert('A formal justification is required for declining a campus reservation.');
      return;
    }
    
    if (status === 'APPROVED' && conflicts.length > 0) {
      if (!window.confirm('SECURITY WARNING: Active conflicts detected. Approving this will lead to scheduling overlap. Proceed?')) return;
    }

    setProcessing(true);
    try {
      const res = await authFetch(`http://localhost:8081/api/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        navigate('/admin/bookings');
      } else {
        const data = await res.json();
        alert(data.message || 'Moderation rejected by system policy');
      }
    } catch (err) {
      alert('Network communication interrupted');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
      <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#6366f1' }} />
      <p style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>AUDITING RESERVATION PARAMETERS...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/admin/bookings" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '32px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
        <ArrowLeft size={18} /> BACK TO LISTING
      </Link>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <header style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Review Reservation #{booking.id?.slice(-8)}</h1>
            <p style={{ color: '#64748b' }}>Technical audit and final moderation for facility access request</p>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {booking.status}
          </div>
        </header>

        <main style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginBottom: '48px' }}>
            {/* Requester Info */}
            <section>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} color="#6366f1" /> Requester Profile</h3>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Authorized Requester:</div>
                <div style={{ color: '#fff', fontWeight: '600', marginBottom: '12px' }}>{booking.requesterName}</div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Authorized via Campus Protocol.</div>
              </div>
            </section>

            {/* Resource Info */}
            <section>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={18} color="#6366f1" /> Facility Allocation</h3>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Target Resource:</div>
                <div style={{ color: '#fff', fontWeight: '600', marginBottom: '12px' }}>{booking.resourceName}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px' }}>Asset ID: {booking.resourceId}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {booking.date}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Clock size={14} /> {booking.startTime?.slice(0,5)} - {booking.endTime?.slice(0,5)}
                </div>
              </div>
            </section>
          </div>

          <section style={{ marginBottom: '48px' }}>
             <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><BadgeHelp size={18} color="#6366f1" /> Justification & Attendance</h3>
             <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
               <p style={{ color: '#cbd5e1', fontSize: '1rem', fontStyle: 'italic', margin: 0 }}>"{booking.purpose || 'No formal purpose provided for this reservation.'}"</p>
               <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '0.85rem', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '80px' }}>
                 <Users size={14} /> Expected Occupancy: {booking.expectedAttendees || 'N/A'}
               </div>
             </div>
          </section>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '24px', marginBottom: '48px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontWeight: 'bold', marginBottom: '12px' }}>
                  <ShieldAlert size={20} /> ACTIVE SCHEDULING CONFLICTS DETECTED
               </div>
               <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '12px' }}>This request overlaps with {conflicts.length} existing authorizations for the same facility.</p>
            </div>
          )}

          {/* Decision Controls */}
          {booking.status === 'PENDING' && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Formal Decision Commentary (Required for refusal)</label>
                <textarea 
                  placeholder="Official moderation notes or reason for decline..." 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', minHeight: '100px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <button 
                  onClick={() => handleModeration('APPROVED')}
                  disabled={processing}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#22c55e', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <CheckCircle size={20} /> APPROVE RESERVATION
                </button>
                <button 
                  onClick={() => handleModeration('REJECTED')}
                  disabled={processing}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <XCircle size={20} /> DECLINE REQUEST
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
