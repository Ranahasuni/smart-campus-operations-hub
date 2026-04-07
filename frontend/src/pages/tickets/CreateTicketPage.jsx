import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import '../../styles/tickets.css';
import { 
  AlertCircle, 
  Send, 
  MapPin, 
  Tag, 
  AlertTriangle, 
  ClipboardList,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CreateTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationDetail: '',
    issueType: 'OTHER',
    priority: 'MEDIUM',
    userId: user?.id || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ticketApi.createTicket({
        ...formData,
        userId: user?.id || ''
      });
      setSuccess(true);
      setTimeout(() => navigate('/tickets'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="tickets-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card success-overlay">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '12px' }}>Ticket Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your maintenance request is now in the system. Redirecting you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <div>
          <h1 className="gradient-text">Report an Issue</h1>
          <p>Provide details for our maintenance and technical staff.</p>
        </div>
        <button onClick={() => navigate('/tickets')} className="btn-secondary">
          <X size={18} />
        </button>
      </div>

      <div className="glass-card ticket-form-card animate-fade-in">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '16px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '12px', color: '#fb7185', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label><Tag size={16} /> Issue Title</label>
            <input
              required
              className="form-control"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Broken projector in Lab 1"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label><AlertCircle size={16} /> Category</label>
              <select className="form-control" name="issueType" value={formData.issueType} onChange={handleChange}>
                <option value="ELECTRICAL">Electrical</option>
                <option value="NETWORK">Network/Internet</option>
                <option value="HARDWARE">Hardware/IT</option>
                <option value="OTHER">Other Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label><AlertTriangle size={16} /> Priority</label>
              <select className="form-control" name="priority" value={formData.priority} onChange={handleChange} style={{ color: formData.priority === 'HIGH' ? '#fb7185' : 'inherit' }}>
                <option value="LOW">Low — Normal</option>
                <option value="MEDIUM">Medium — Standard</option>
                <option value="HIGH">High — Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><MapPin size={16} /> Detailed Location</label>
            <input
              required
              className="form-control"
              type="text"
              name="locationDetail"
              value={formData.locationDetail}
              onChange={handleChange}
              placeholder="e.g., Block B, 3rd Floor, Room 304"
            />
          </div>

          <div className="form-group">
            <label><ClipboardList size={16} /> Description</label>
            <textarea
              required
              className="form-control"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What seems to be the problem?"
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button disabled={loading} type="submit" className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Request'}
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
