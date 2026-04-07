import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Tag, 
  AlertTriangle,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import '../../styles/tickets.css';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getTicketById(id);
      setTicket(response.data);
    } catch (err) {
      setError('Could not find this ticket. It may have been deleted.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await ticketApi.updateTicketStatus(id, newStatus, user.id);
      await fetchTicketDetails(); // Refresh data
      setShowStatusModal(false);
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update status: ${msg} (Status: ${err.response?.status})`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <AlertCircle size={14} /> },
      IN_PROGRESS: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <Clock size={14} /> },
      RESOLVED: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle2 size={14} /> }
    };
    const s = styles[status] || styles.OPEN;
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        padding: '6px 16px', 
        borderRadius: '20px', 
        fontSize: '0.8rem', 
        fontWeight: '700',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`
      }}>
        {s.icon} {status}
      </span>
    );
  };

  if (loading) return (
    <div className="tickets-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <p className="animate-pulse">Loading ticket information...</p>
    </div>
  );

  if (error || !ticket) return (
    <div className="tickets-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div className="glass-card" style={{ padding: '40px' }}>
        <AlertCircle size={48} className="text-rose-500" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '12px' }}>Oops! Ticket Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate('/tickets')} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="tickets-container">
      <button onClick={() => navigate('/tickets')} className="btn-secondary" style={{ marginBottom: '32px', padding: '8px 16px' }}>
        <ArrowLeft size={18} /> Back to List
      </button>

      <div className="tickets-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {getStatusBadge(ticket.status)}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {ticket.id.toUpperCase()}</span>
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.8rem', lineHeight: '1.1' }}>{ticket.title}</h1>
        </div>
        
        <div className="glass-card" style={{ padding: '16px 24px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PRIORITY</div>
          <div style={{ fontWeight: '800', color: ticket.priority === 'HIGH' ? '#fb7185' : 'var(--accent-primary)', fontSize: '1.2rem' }}>
            {ticket.priority}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', width: '100%' }}>
        
        {/* Left Side: Main Content */}
        <div className="space-y-6">
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} className="text-indigo-400" />
              Issue Description
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {ticket.description}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>CATEGORY</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Tag size={18} className="text-indigo-400" />
                {ticket.issueType}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>LOCATION</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <MapPin size={18} className="text-indigo-400" />
                {ticket.locationDetail}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Info & Metadata */}
        <div className="space-y-6">
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1rem' }}>SLA Information</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} className="text-slate-500" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>REPORTED ON</div>
                  <div style={{ fontSize: '0.9rem' }}>{new Date(ticket.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} className="text-slate-500" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SUBMITTED BY</div>
                  <div style={{ fontSize: '0.9rem' }}>Campus User ID: {ticket.userId}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Staff Portal Update</h4>
            {isAdmin ? (
              <>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Select the current progress of this maintenance request.
                </p>
                <button 
                  onClick={() => setShowStatusModal(true)} 
                  className="btn-primary" 
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  Update Ticket Status
                </button>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Status updates are managed by the physical facilities department.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay animate-fade-in" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' 
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px' }}>Update Status</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Transitions are logged for audit purposes.
            </p>
            
            <div className="space-y-3">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  disabled={updating || ticket.status === status}
                  onClick={() => handleStatusUpdate(status)}
                  className="btn-secondary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'space-between', 
                    opacity: ticket.status === status ? 0.5 : 1,
                    border: ticket.status === status ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                  }}
                >
                  {status.replace('_', ' ')}
                  {ticket.status === status && <CheckCircle2 size={16} className="text-emerald-400" />}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowStatusModal(false)}
              className="btn-ghost" 
              style={{ width: '100%', marginTop: '24px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
