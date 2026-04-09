import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import userApi from '../../api/userApi';
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
  CheckCircle2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import CommentSection from '../../components/tickets/CommentSection';
import { formatDuration } from '../../utils/TimeUtils';
import '../../styles/tickets.css';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchTicketDetails();
    fetchImages();
    if (user?.role === 'ADMIN') {
      fetchTechnicians();
    }
  }, [id, user]);

  const fetchTechnicians = async () => {
    try {
      const response = await userApi.getUsersByRole('TECHNICIAN');
      setTechnicians(response.data);
    } catch (err) {
      console.error('Failed to fetch technicians', err);
    }
  };

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

  const fetchImages = async () => {
    try {
      const response = await ticketApi.getTicketImages(id);
      setImages(response.data || []);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    }
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    try {
      setUpdating(true);
      await ticketApi.updateTicketStatus(id, selectedStatus, user.id, resolutionNote);
      await fetchTicketDetails(); // Refresh data
      setShowStatusModal(false);
      setSelectedStatus('');
      setResolutionNote('');
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update status: ${msg}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (technicianId) => {
    if (!technicianId) return;
    try {
      setIsAssigning(true);
      await ticketApi.assignTechnician(id, technicianId, user.id);
      await fetchTicketDetails();
      alert('Technician assigned successfully!');
    } catch (err) {
      console.error('Assignment failed:', err);
      alert('Failed to assign technician');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <AlertCircle size={14} /> },
      IN_PROGRESS: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <Clock size={14} /> },
      RESOLVED: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle2 size={14} /> },
      CLOSED: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', icon: <CheckCircle2 size={14} /> }
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

          {ticket.status === 'RESOLVED' && ticket.resolutionNotes && (
            <div className="glass-card animate-slide-up" style={{ 
              padding: '32px', 
              background: 'rgba(16, 185, 129, 0.05)', 
              border: '1px solid rgba(16, 185, 129, 0.2)' 
            }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <CheckCircle2 size={20} />
                Resolution Details
              </h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontStyle: 'italic' }}>
                "{ticket.resolutionNotes}"
              </p>
            </div>
          )}

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

            {/* Maintenance Gallery */}
            {images.length > 0 && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} className="text-indigo-400" />
                  Maintenance Gallery
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '20px' 
                }}>
                  {images.map((img, index) => (
                    <div 
                      key={img.id} 
                      className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl cursor-pointer"
                      onClick={() => window.open(`http://localhost:8082${img.imageUrl}`, '_blank')}
                    >
                      <img 
                        src={`http://localhost:8082${img.imageUrl}`} 
                        alt={img.caption || `Maintenance photo ${index + 1}`} 
                        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                        className="transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[10px] text-zinc-300 font-medium tracking-wider uppercase">View Full Photo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <CommentSection ticketId={id} />
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
                  <div style={{ fontSize: '0.9rem' }}>{ticket.userFullName || 'Anonymous User'} ({ticket.userCampusId || 'N/A'})</div>
                </div>
              </div>

              {ticket.assignedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-fade-in">
                  <Clock size={18} className="text-slate-500" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ASSIGNED ON</div>
                    <div style={{ fontSize: '0.9rem' }}>{new Date(ticket.assignedAt).toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                      Wait time: {formatDuration(ticket.createdAt, ticket.assignedAt)}
                    </div>
                  </div>
                </div>
              )}

              {(ticket.resolvedAt || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-fade-in">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RESOLVED ON</div>
                    <div style={{ fontSize: '0.9rem' }}>{ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'Just now'}</div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#10b981', 
                      marginTop: '6px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      Resolution: {formatDuration(ticket.createdAt, ticket.resolvedAt || new Date())}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Staff Portal Update</h4>
            {isAdmin ? (
              <div className="space-y-4">
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Current Status: <strong className="text-white">{ticket.status.replace('_', ' ')}</strong>
                  </p>
                  <button 
                    onClick={() => setShowStatusModal(true)} 
                    className="btn-primary" 
                    style={{ width: '100%', fontSize: '0.85rem' }}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Ticket Status'}
                  </button>
                </div>

                {user.role === 'ADMIN' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>
                      ASSIGN TECHNICIAN
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        className="glass-input"
                        style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginBottom: '12px' }}
                        value={ticket.technicianId || ''}
                        onChange={(e) => handleAssign(e.target.value)}
                        disabled={isAssigning}
                      >
                        <option value="">Unassigned</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>
                            {tech.fullName} ({tech.campusId})
                          </option>
                        ))}
                      </select>
                      {isAssigning && (
                        <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                          <Loader2 className="animate-spin" size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {ticket.technicianId && user.role !== 'ADMIN' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ASSIGNED TO</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                      Staff Member: {ticket.technicianId}
                    </div>
                  </div>
                )}
              </div>
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
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  disabled={updating || ticket.status === status}
                  onClick={() => setSelectedStatus(status)}
                  className="btn-secondary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'space-between', 
                    opacity: ticket.status === status ? 0.5 : 1,
                    border: selectedStatus === status ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    background: selectedStatus === status ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)'
                  }}
                >
                  {status.replace('_', ' ')}
                  {(selectedStatus === status || ticket.status === status) && <CheckCircle2 size={16} className="text-emerald-400" />}
                </button>
              ))}
            </div>

            {selectedStatus === 'RESOLVED' && (
              <div className="animate-fade-in" style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>
                  RESOLUTION NOTES
                </label>
                <textarea 
                  className="glass-input"
                  placeholder="Describe how the issue was fixed..."
                  style={{ width: '100%', minHeight: '100px', fontSize: '0.9rem', padding: '12px' }}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => { setShowStatusModal(false); setSelectedStatus(''); }}
                className="btn-ghost" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusUpdate}
                disabled={updating || !selectedStatus}
                className="btn-primary" 
                style={{ flex: 1.5 }}
              >
                {updating ? 'Saving...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
