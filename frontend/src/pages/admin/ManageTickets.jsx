import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Ticket, Clock, CheckCircle, AlertCircle, 
  Search, Filter, Loader2, User, Hammer,
  ArrowUpRight, ChevronRight, Trash2, ShieldAlert
} from 'lucide-react';

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

export default function ManageTickets() {
  const { authFetch, API } = useAuth();
  const navigate = useNavigate();
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
      const res = await authFetch(`${API}/api/tickets`);
      if (!res.ok) throw new Error('Failed to retrieve system tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId, status) => {
    if (status !== 'RESOLVED' && status !== 'CLOSED') {
      alert("Safety Lock: Only Resolved or Closed tickets can be deleted to maintain system accountability.");
      return;
    }

    if (window.confirm("ARE YOU SURE? This action will permanently remove this ticket from the campus records. This cannot be undone.")) {
      try {
        const res = await authFetch(`${API}/api/tickets/${ticketId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          setTickets(prev => prev.filter(t => t.id !== ticketId));
          alert("Ticket successfully purged from the system.");
        } else {
          throw new Error('Failed to delete ticket.');
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.building?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN':        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <AlertCircle size={14} /> };
      case 'IN_PROGRESS': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: <Hammer size={14} /> };
      case 'RESOLVED':    return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <CheckCircle size={14} /> };
      default:            return { color: '#6B7281', bg: 'rgba(148, 163, 184, 0.1)', icon: <Ticket size={14} /> };
    }
  };

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#C08080' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>SYNCHRONIZING MAINTENANCE LEDGER...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Reveal>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px' }}>
              Maintenance <span style={{ color: '#C08080' }}>Tickets</span>
            </h1>
            <p style={{ color: '#6B7281', marginTop: '8px', fontWeight: '500' }}>Administrative oversight of campus infrastructure resolution and technician assignment.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B7281' }} />
              <input 
                type="text" 
                placeholder="Search Title, ID or Building..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(192, 128, 128, 0.1)',
                  borderRadius: '16px', padding: '14px 14px 14px 48px', color: '#1F1F1F', width: '320px', outline: 'none', fontWeight: '500'
                }}
              />
            </div>
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(192, 128, 128, 0.1)',
                borderRadius: '16px', padding: '0 24px', color: '#1F1F1F', outline: 'none', fontWeight: '700'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open / New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </header>
      </Reveal>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTickets.length === 0 ? (
          <Reveal>
            <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '32px', border: '1px dashed rgba(192, 128, 128, 0.2)' }}>
              <ShieldAlert size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--accent-primary)', margin: '0 auto' }} />
              <p style={{ color: '#6B7281', fontSize: '1.1rem', fontWeight: '600' }}>No tickets match the search intelligence.</p>
            </div>
          </Reveal>
        ) : (
          filteredTickets.map((t, idx) => {
            const status = getStatusStyle(t.status);
            return (
              <Reveal key={t.id} className="reveal-ticket">
                <div 
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px 220px 100px', alignItems: 'center', gap: '32px',
                    padding: '24px 40px', borderRadius: '28px', background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)', border: '1px solid rgba(192, 128, 128, 0.1)', cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.005)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(140, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(140, 0, 0, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(192, 128, 128, 0.1)';
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: status.color }} />
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#8C0000', background: 'rgba(140, 0, 0, 0.06)', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                        {t.displayId || t.id?.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ color: '#1F1F1F', fontWeight: '800', fontSize: '1.15rem' }}>{t.title}</span>
                    </div>
                    <div style={{ color: '#6B7281', fontSize: '0.9rem', fontWeight: '500' }}>{t.building} • {t.category || 'Facility Issue'}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: status.bg, color: status.color, fontSize: '0.75rem', fontWeight: '900', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {status.icon} {t.status.replace('_', ' ')}
                  </div>

                  <div style={{ color: '#6B7281', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                    {t.technicianFullName ? (
                      <>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} color="#22c55e" />
                        </div>
                        <span>{t.technicianFullName}</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AlertCircle size={14} color="#ef4444" />
                        </div>
                        <span style={{ color: '#ef4444' }}>Unassigned</span>
                      </>
                    ) }
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         handleDelete(t.id, t.status);
                      }}
                      style={{ 
                        padding: '12px', borderRadius: '14px', 
                        background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        cursor: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'pointer' : 'not-allowed',
                        opacity: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 1 : 0.2
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                    <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(192, 128, 128, 0.05)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F' }}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })
        )}
      </div>
    </div>
  );
}
