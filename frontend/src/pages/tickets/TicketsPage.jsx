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

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import { handleApiError } from '../../utils/apiErrorHandler';
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  X
} from 'lucide-react';
import '../../styles/tickets.css';

export default function TicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
      const response = isAdmin
        ? await ticketApi.getAllTickets()
        : await ticketApi.getTicketsByUser(user?.id);

      setTickets(response.data || []);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load tickets. Please try again.');
      setError(errorMessage);
      console.error('Failed to fetch tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    statusFilter === 'ALL' || t.status === statusFilter
  );

  const getTechnicianDisplay = (fullName, campusId) => {
    if (!fullName) return null;
    const isStaff = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
    return isStaff ? `${fullName} (${campusId || 'Staff'})` : `${fullName} (Technician)`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', icon: <AlertCircle size={14} /> },
      IN_PROGRESS: { bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', icon: <Clock size={14} /> },
      RESOLVED: { bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', icon: <CheckCircle2 size={14} /> },
      CLOSED: { bg: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', color: '#ec4899', icon: <CheckCircle2 size={14} /> },
      REJECTED: { bg: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.2)', color: '#fb7185', icon: <X size={14} /> }
    };
    const s = styles[status] || styles.OPEN;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: s.bg,
        border: s.border,
        color: s.color
      }}>
        {s.icon} {status === 'REJECTED' ? 'CANCELLED' : status}
      </span>
    );
  };

  return (
    <div className="tickets-container">
      {/* Header Section */}
      <div className="tickets-header">
        <div>
          <h1 className="gradient-text">Maintenance Tickets</h1>
          <p>{user?.role === 'ADMIN' ? 'Managing all campus issues' : 'Track your reported issues and view their status updates.'}</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1.5px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.5)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={() => navigate('/tickets/new')}
            className="btn-primary"
          >
            <PlusCircle size={20} />
            Report Issue
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p className="animate-pulse">Loading your tickets...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderColor: '#ef4444' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Failed to Load Tickets</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={fetchTickets}
            className="btn-primary"
            style={{ display: 'inline-block' }}
          >
            Try Again
          </button>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(192, 128, 128, 0.06)', borderBottom: '1px solid var(--glass-border)' }}>
              <tr>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TICKET ID / TITLE</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>LOCATION</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PRIORITY</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontWeight: '600', color: '#1F1F1F', marginBottom: '2px' }}>{ticket.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                      {ticket.userFullName || 'Anonymous'} ({ticket.userCampusId || 'N/A'})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> {ticket.displayId || ticket.id.substring(ticket.id.length - 8).toUpperCase()}
                      </div>
                      {ticket.technicianFullName && (
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <User size={12} /> {getTechnicianDisplay(ticket.technicianFullName, ticket.technicianCampusId)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} className="text-indigo-400" />
                      {ticket.locationDetail}
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td style={{ padding: '24px' }}>
                    <span style={{
                      color: ticket.priority === 'HIGH' ? '#fb7185' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: '24px', textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state animate-fade-in">
          <div className="empty-state-icon">
            <ClipboardList size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {statusFilter === 'ALL' ? 'No Tickets Found' : `No ${statusFilter.replace('_', ' ')} Tickets`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              {statusFilter === 'ALL' 
                ? "It looks like everything is running smoothly. If you spot a problem, report it here."
                : `There are currently no tickets with the status "${statusFilter.replace('_', ' ')}". Check another category or report a new issue.`}
            </p>
          </div>
          {statusFilter !== 'ALL' && (
            <button onClick={() => setStatusFilter('ALL')} className="btn-secondary" style={{ marginTop: '16px', marginRight: '10px' }}>
              Clear Filter
            </button>
          )}
          <button
            onClick={() => navigate('/tickets/new')}
            className="btn-primary"
            style={{ marginTop: '16px' }}
          >
            Report Issue
          </button>
        </div>
      )}
    </div>
  );
}

// Simple internal Tag icon for the table
function Tag({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 13.5 11-4L12 5.5l-11 4 11 4Z" /><path d="m12 22 11-4-11-4-11 4 11 4Z" /><path d="m1 9.5 11 4 11-4" />
    </svg>
  );
}
