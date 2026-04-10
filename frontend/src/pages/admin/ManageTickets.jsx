import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Ticket, Clock, CheckCircle, AlertCircle, 
  Search, Filter, Loader2, User, Hammer,
  ArrowUpRight, ChevronRight, Trash2
} from 'lucide-react';

/**
 * ManageTickets — Admin viewer for all campus maintenance tickets.
 * Features: Priority indicators, Tech assignment status, Status filtering.
 */
export default function ManageTickets() {
  const { authFetch } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await authFetch('http://localhost:8082/api/tickets');
      if (!res.ok) throw new Error('Failed to retrieve system tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId, status) => {
    // Safety Lock check
    if (status !== 'RESOLVED' && status !== 'CLOSED') {
      alert("Safety Lock: Only Resolved or Closed tickets can be deleted to maintain system accountability.");
      return;
    }

    if (window.confirm("ARE YOU SURE? This action will permanently remove this ticket from the campus records. This cannot be undone.")) {
      try {
        const res = await authFetch(`http://localhost:8082/api/tickets/${ticketId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          // Refresh local state to reflect deletion
          setTickets(prev => prev.filter(t => t.id !== ticketId));
          alert("Ticket successfully purged from the system.");
        } else {
          throw new Error('Failed to delete ticket. You may not have administrative permissions.');
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN':        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <AlertCircle size={14} /> };
      case 'IN_PROGRESS': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: <Hammer size={14} /> };
      case 'RESOLVED':    return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <CheckCircle size={14} /> };
      default:            return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', icon: <Ticket size={14} /> };
    }
  };

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#6366f1' }} />
      <p style={{ fontSize: '1.1rem' }}>Sychronizing maintenance ledger...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            System <span style={{ color: '#6366f1' }}>Tickets</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Assign technicians and oversee campus infrastructure resolution.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                    type="text" 
                    placeholder="Search by Title or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', width: '280px', outline: 'none'
                    }}
                />
            </div>
            
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '0 16px', color: '#fff', outline: 'none'
                }}
            >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
            </select>
        </div>
      </header>

      {error && <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Ticket size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>No tickets match your current filters.</p>
          </div>
        ) : (
          filteredTickets.map(t => {
            const status = getStatusStyle(t.status);
            return (
              <div 
                key={t.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 180px 100px', alignItems: 'center', gap: '20px',
                  padding: '20px 30px', borderRadius: '20px', background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {t.displayId || t.id?.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{t.title}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.description?.slice(0, 80)}...</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: status.bg, color: status.color, fontSize: '0.75rem', fontWeight: 'bold', width: 'fit-content' }}>
                  {status.icon} {t.status}
                </div>

                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.technicianId ? (
                    <>
                      <User size={14} color="#22c55e" />
                      <span style={{ color: '#cbd5e1' }}>
                        {t.technicianFullName || 'Assigned'} 
                        {t.technicianCampusId && <span style={{ opacity: 0.6, marginLeft: '4px' }}>({t.technicianCampusId})</span>}
                      </span>
                    </>
                  ) : (
                    <>
                      <BadgeHelp size={14} color="#f43f5e" />
                      <span style={{ color: '#f87171' }}>Unassigned</span>
                    </>
                  ) }
                </div>

                <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Link 
                    to={`/admin/tickets/${t.id}`}
                    style={{ 
                      padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)', color: '#fff', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <ChevronRight size={20} />
                  </Link>

                  {/* Safely Guarded Delete Button */}
                  <button
                    onClick={() => handleDelete(t.id, t.status)}
                    title={t.status === 'RESOLVED' || t.status === 'CLOSED' ? "Delete Ticket" : "Cannot delete active tickets"}
                    style={{ 
                      padding: '10px', borderRadius: '12px', 
                      background: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      color: t.status === 'RESOLVED' || t.status === 'CLOSED' ? '#ef4444' : '#475569', 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'pointer' : 'not-allowed',
                      opacity: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 1 : 0.5
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BadgeHelp({ size, color }) {
    return <AlertCircle size={size} color={color} />
}
