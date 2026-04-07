import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import { 
  PlusCircle, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  User,
  MapPin
} from 'lucide-react';
import '../../styles/tickets.css';

export default function TicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
      const response = isAdmin 
        ? await ticketApi.getAllTickets() 
        : await ticketApi.getTicketsByUser(user?.id);
      
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', icon: <AlertCircle size={14} /> },
      IN_PROGRESS: { bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', icon: <Clock size={14} /> },
      RESOLVED: { bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', icon: <CheckCircle2 size={14} /> }
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
        {s.icon} {status}
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

        <button
          onClick={() => navigate('/tickets/new')}
          className="btn-primary"
        >
          <PlusCircle size={20} />
          Report New Issue
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p className="animate-pulse">Loading your tickets...</p>
        </div>
      ) : tickets.length > 0 ? (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              <tr>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TICKET ID / TITLE</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>LOCATION</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PRIORITY</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>{ticket.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {ticket.id.substring(ticket.id.length - 8).toUpperCase()}
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No Tickets Found</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              It looks like everything is running smoothly. If you spot a problem, report it here.
            </p>
          </div>
          <button 
            onClick={() => navigate('/tickets/new')} 
            className="btn-secondary" 
            style={{ marginTop: '16px' }}
          >
            Submit First Ticket
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
      <path d="m12 13.5 11-4L12 5.5l-11 4 11 4Z"/><path d="m12 22 11-4-11-4-11 4 11 4Z"/><path d="m1 9.5 11 4 11-4"/>
    </svg>
  );
}
