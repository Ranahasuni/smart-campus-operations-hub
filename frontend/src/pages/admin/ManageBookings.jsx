import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, Search, CheckCircle, XCircle,
  Loader2, Users, ChevronLeft, Clock
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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await authFetch(`${API}/api/bookings/all`);
      if (!res.ok) throw new Error('System failed to retrieve reservation records');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    try {
      const res = await authFetch(`${API}/api/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        const err = await res.json();
        alert(err.message || 'Action refused by security gateway');
      }
    } catch (err) {
      alert('Network communication failure');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Authorized' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Declined' };
      case 'CANCELLED': return { bg: 'rgba(100, 116, 139, 0.1)', color: '#6B7281', label: 'Withdrawn' };
      default: return { bg: 'rgba(234, 179, 8, 0.1)', color: '#f59e0b', label: 'Pending' };
    }
  };

  const filtered = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const term = search.toLowerCase();
    const matchesSearch = b.id?.toLowerCase().includes(term) ||
      b.requesterName?.toLowerCase().includes(term) ||
      b.resourceName?.toLowerCase().includes(term) ||
      b.bookingCode?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              placeholder="Search by ID, User, or Resource..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '500' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0 24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '700' }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Authorized</option>
            <option value="REJECTED">Declined</option>
            <option value="CANCELLED">Withdrawn</option>
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
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ color: '#1F1F1F', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        {b.bookingCode || `RSV-${new Date(b.date).getFullYear()}-${b.id?.slice(-5).toUpperCase()}`}
                      </div>
                      <div style={{ color: '#6B7281', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1F1F1F', fontWeight: '700' }}>
                        <Users size={16} color="var(--accent-primary)" /> {b.requesterName}
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
                              style={{ padding: '10px', borderRadius: '12px', color: '#22c55e', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)', cursor: 'pointer' }}
                              title="Authorize"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) updateStatus(b.id, 'REJECTED', reason);
                              }}
                              style={{ padding: '10px', borderRadius: '12px', color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', cursor: 'pointer' }}
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
          {filtered.length === 0 && (
            <div style={{ padding: '80px', textAlign: 'center', color: '#6B7281', fontSize: '1rem', fontWeight: '600' }}>
              No reservations match the specified intelligence parameters.
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
