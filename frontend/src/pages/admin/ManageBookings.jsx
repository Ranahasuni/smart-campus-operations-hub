import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, Search, CheckCircle, XCircle,
  Loader2, Users, ChevronLeft, Clock, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Shared Animation Hooks ─────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
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
  return <div ref={ref} className={`hp-reveal ${className}`}>{children}</div>;
}

export default function ManageBookings() {
  const { authFetch, API } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ id: null, reason: '', role: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await authFetch(`${API}/api/bookings/all?size=100`);
      if (!res.ok) throw new Error('System failed to retrieve reservation records');
      const data = await res.json();
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setBookings(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    setProcessingId(id);
    try {
      const res = await authFetch(`${API}/api/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (status === 'REJECTED') setShowModal(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Action refused by security gateway');
      }
    } catch (err) {
      alert('Network communication failure');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineClick = (b) => {
    const defaultReason = b.requesterRole === 'STUDENT' 
      ? 'High-priority faculty override: This slot is required for institutional activities. Please reschedule for an alternative time.'
      : '';
    setModalData({ id: b.id, reason: defaultReason, role: b.requesterRole });
    setShowModal(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Authorized' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Declined' };
      case 'CANCELLED': return { bg: 'rgba(100, 116, 139, 0.1)', color: '#6B7281', label: 'Withdrawn' };
      case 'CHECKED_IN': return { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', label: 'In Use' };
      case 'CHECKED_OUT': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Completed' };
      case 'NO_SHOW': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'No Show' };
      default: return { bg: 'rgba(234, 179, 8, 0.1)', color: '#f59e0b', label: 'Pending Review' };
    }
  };

  const filtered = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const term = search.toLowerCase();
    const matchesSearch = b.bookingCode?.toLowerCase().includes(term) ||
      b.requesterName?.toLowerCase().includes(term) ||
      b.resourceName?.toLowerCase().includes(term);
    return matchesSearch && (statusFilter === 'ALL' || b.status === statusFilter) && (roleFilter === 'ALL' || b.requesterRole === roleFilter);
  });

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
      <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 20px', color: '#C08080' }} />
      <p style={{ letterSpacing: '2px', fontWeight: 'bold' }}>RETRIEVING RESERVATION LEDGER...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Reveal>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px' }}>
              Manage <span style={{ color: '#C08080' }}>Reservations</span>
            </h1>
            <p style={{ color: '#6B7281', marginTop: '8px', fontWeight: '500' }}>Administrative moderation of campus facility access and resource scheduling.</p>
          </div>
          <Link to="/admin/bookings/calendar" style={{
            background: 'rgba(192, 128, 128, 0.08)', border: '1px solid rgba(192, 128, 128, 0.15)',
            padding: '14px 28px', borderRadius: '16px', color: 'var(--accent-primary)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s', fontWeight: '900'
          }}>
            <CalendarIcon size={18} /> View Visual Schedule
          </Link>
        </header>
      </Reveal>

      {/* Filters */}
      <Reveal>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              placeholder="Search by Code, User, or Resource..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '500' }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '0 20px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '700' }}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="LECTURER">Lecturers</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0 20px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '700' }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Authorized</option>
            <option value="REJECTED">Declined</option>
            <option value="CHECKED_IN">In Use</option>
            <option value="CHECKED_OUT">Completed</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </Reveal>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>{error}</div>}

      <Reveal>
        <div style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', border: '1px solid rgba(192, 128, 128, 0.1)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(140, 0, 0, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(192, 128, 128, 0.06)', borderBottom: '1px solid rgba(192, 128, 128, 0.08)' }}>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Request Info</th>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Requester</th>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Facility / Asset</th>
                <th style={{ padding: '24px', textAlign: 'center', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Status</th>
                <th style={{ padding: '24px', textAlign: 'right', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const status = getStatusStyle(b.status);
                const isProcessing = processingId === b.id;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ color: '#1F1F1F', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        {b.bookingCode || `RSV-${b.id?.slice(-5).toUpperCase()}`}
                      </div>
                      <div style={{ color: '#6B7281', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1F1F1F', fontWeight: '800' }}>
                        <Users size={16} color="var(--accent-primary)" /> {b.requesterName}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                         <span style={{ 
                            fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', 
                            background: b.requesterRole === 'LECTURER' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: b.requesterRole === 'LECTURER' ? '#3b82f6' : '#6b7280',
                            fontWeight: '800', letterSpacing: '0.5px'
                         }}>
                            {b.requesterRole}
                         </span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ color: '#1F1F1F', fontSize: '0.95rem', fontWeight: '800' }}>{b.resourceName}</div>
                      <div style={{ color: '#6B7281', fontSize: '0.8rem', marginTop: '4px', fontWeight: '600' }}>
                        {b.date} • {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 14px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: '900',
                        background: status.bg, color: status.color, border: `1px solid ${status.color}30`,
                        textTransform: 'uppercase'
                      }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {b.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 'APPROVED')}
                              disabled={isProcessing}
                              style={{ padding: '10px', borderRadius: '12px', color: '#22c55e', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)', cursor: isProcessing ? 'default' : 'pointer', opacity: isProcessing ? 0.5 : 1 }}
                              title="Authorize"
                            >
                              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeclineClick(b)}
                              disabled={isProcessing}
                              style={{ padding: '10px', borderRadius: '12px', color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', cursor: isProcessing ? 'default' : 'pointer', opacity: isProcessing ? 0.5 : 1 }}
                              title="Decline"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        ) : (
                          <div style={{ color: '#6B7281', fontSize: '0.75rem', fontStyle: 'italic', fontWeight: '500' }}>Decision Logged</div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* Decision Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1F1F1F', marginBottom: '8px' }}>Decline Reservation</h2>
            <p style={{ color: '#6B7281', fontSize: '0.9rem', marginBottom: '24px' }}>Provide a reason for declining this request. The user will be notified immediately.</p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#C08080', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Rejection Reason</label>
              <textarea 
                value={modalData.reason}
                onChange={e => setModalData(prev => ({ ...prev, reason: e.target.value }))}
                style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '16px', background: 'rgba(245, 230, 230, 0.4)', border: '1px solid rgba(192, 128, 128, 0.2)', color: '#1F1F1F', outline: 'none', resize: 'vertical', fontSize: '0.9rem', lineHeight: '1.5' }}
                placeholder="Enter justification..."
              />
              {modalData.role === 'STUDENT' && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: '600' }}>
                  <ShieldAlert size={14} /> Priority notice applied for Student request.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e1e1e1', background: '#fff', color: '#6B7281', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={!modalData.reason.trim() || processingId}
                onClick={() => updateStatus(modalData.id, 'REJECTED', modalData.reason)}
                style={{ flex: 1.5, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.3)', opacity: (!modalData.reason.trim() || processingId) ? 0.5 : 1 }}
              >
                {processingId ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
