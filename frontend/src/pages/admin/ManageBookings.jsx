import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Search, Filter, CheckCircle, XCircle, 
  Eye, Loader2, ArrowRight, Building, Users 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManageBookings() {
  const { authFetch } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await authFetch('http://localhost:8081/api/bookings/all');
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
      const res = await authFetch(`http://localhost:8081/api/bookings/${id}/status`, {
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
      case 'APPROVED':  return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Authorized' };
      case 'REJECTED':  return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Declined' };
      case 'CANCELLED': return { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', label: 'Withdrawn' };
      default:          return { bg: 'rgba(234, 179, 8, 0.1)', color: '#f59e0b', label: 'Pending' };
    }
  };

  const filtered = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const matchesSearch = b.id?.includes(search) || b.userId?.includes(search) || b.resourceId?.includes(search);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 20px' }} />
      <p style={{ letterSpacing: '2px' }}>RETRIEVING RESERVATION LEDGER...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
            Manage <span style={{ color: '#6366f1' }}>Reservations</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Administrative moderation of campus facility access and resource scheduling.</p>
        </div>
        <Link to="/admin/bookings/calendar" style={{ 
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 24px', borderRadius: '12px', color: '#fff', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
        }}>
          <Calendar size={18} /> View Visual Schedule
        </Link>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input 
            placeholder="Search by ID, User, or Resource..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0 20px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Authorized</option>
          <option value="REJECTED">Declined</option>
        </select>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Request Info</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Requester</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Resource</th>
              <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const status = getStatusStyle(b.status);
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>#{b.id?.slice(-8)}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontWeight: '500' }}>
                      <Users size={16} color="#6366f1" /> {b.requesterName}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{b.resourceName}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                      {b.date} • {b.startTime?.slice(0,5)} - {b.endTime?.slice(0,5)}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 'bold',
                      background: status.bg, color: status.color, border: `1px solid ${status.color}30`,
                      textTransform: 'uppercase'
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link 
                        to={`/admin/bookings/${b.id}`}
                        style={{ padding: '8px', borderRadius: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <Eye size={18} />
                      </Link>
                      {b.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => updateStatus(b.id, 'APPROVED')}
                            style={{ padding: '8px', borderRadius: '10px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.1)', cursor: 'pointer' }}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt('Please provide reason for rejection:');
                              if (reason) updateStatus(b.id, 'REJECTED', reason);
                            }}
                            style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.1)', cursor: 'pointer' }}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>
            No reservations match the current system filters.
          </div>
        )}
      </div>
    </div>
  );
}
