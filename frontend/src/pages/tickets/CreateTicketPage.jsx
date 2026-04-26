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

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../../api/ticketApi';
import api from '../../api/axiosInstance';
import '../../styles/tickets.css';
import ImageUpload from '../../components/tickets/ImageUpload';
import { 
  AlertCircle, 
  Send, 
  MapPin, 
  Tag, 
  AlertTriangle, 
  ClipboardList,
  CheckCircle2,
  X,
  Building2,
  Search
} from 'lucide-react';

export default function CreateTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchingResources, setFetchingResources] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLinked, setIsLinked] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationDetail: '',
    issueType: 'OTHER',
    priority: 'MEDIUM',
    resourceId: '',
    userId: user?.id || ''
  });

  useEffect(() => {
    fetchResources();
    
    // Check for resourceId in URL (Linked from Resource Page)
    const rid = searchParams.get('resourceId');
    const rname = searchParams.get('resourceName');
    
    if (rid) {
      setIsLinked(true);
      setFormData(prev => ({
        ...prev,
        resourceId: rid,
        title: rname ? `Issue with ${rname}` : prev.title
      }));
      
      // Also fetch and set location if possible
      api.get(`/resources/${rid}`).then(res => {
        const r = res.data;
        if (r) {
          setFormData(prev => ({
            ...prev,
            locationDetail: `${r.building}, Level ${r.floor}, Room ${r.roomNumber}`
          }));
        }
      }).catch(err => console.error("Failed to pre-fill location", err));
    }
  }, [searchParams]);

  const fetchResources = async () => {
    setFetchingResources(true);
    try {
      const res = await api.get('/resources');
      let data = res.data || [];
      
      // SECURITY: If staff member, restrict to only assigned facilities
      if (user?.role === 'STAFF') {
        data = data.filter(r => {
          const staffIds = r.assignedStaffIds;
          if (!Array.isArray(staffIds)) return false;
          // Check both DB ID and Campus ID for maximum compatibility
          return staffIds.includes(user.id) || staffIds.includes(user.campusId);
        });
      }
      
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setFetchingResources(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If resource is selected from dropdown, update location text automatically
    if (name === 'resourceId' && value !== '') {
      const selected = resources.find(r => r.id === value);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          locationDetail: `${selected.building}, Level ${selected.floor}, Room ${selected.roomNumber}`
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalTicketData = {
        ...formData,
        userId: user?.id || '',
        userFullName: user?.fullName || 'Anonymous User',
        userCampusId: user?.campusId || 'N/A'
      };
      
      const response = await ticketApi.createTicket(finalTicketData);
      const createdTicket = response.data;
      
      // Upload images if any
      if (selectedFiles.length > 0) {
        try {
          await ticketApi.uploadTicketImages(createdTicket.id, selectedFiles, user.id);
        } catch (imgErr) {
          console.error('Image upload failed but ticket was created:', imgErr);
        }
      }

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
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ background: '#FFFFFF', padding: '48px 40px', borderRadius: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Ticket Submitted!</h2>
          <p style={{ color: '#6B7281', fontSize: '1.05rem', fontWeight: '500', marginBottom: '40px', lineHeight: '1.5' }}>Your maintenance request is now in the system. Redirecting you...</p>
          <button onClick={() => navigate('/tickets')} style={{ background: 'none', border: 'none', color: '#111827', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', padding: '10px 20px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-2px' }}>Report <span style={{ color: '#8C0000' }}>Issue</span></h1>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Provide details for our maintenance and technical staff.</p>
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

          {/* TOP MARKS: SMART ASSET SELECTION */}
          <div className="form-group" style={{ 
            background: '#f8fafc', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
          }}>
            <label style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
              <Building2 size={18} /> 
              {isLinked ? 'Linked Asset (Verified)' : 'Target Facility (Optional)'}
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                className="form-control" 
                name="resourceId" 
                value={formData.resourceId} 
                onChange={handleChange}
                disabled={isLinked}
                style={{ 
                  paddingLeft: '44px',
                  background: isLinked ? '#f1f5f9' : '#fff',
                  color: '#1e293b',
                  cursor: isLinked ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  border: '1px solid #e2e8f0',
                }}
              >
                <option value="" style={{ background: '#FFFFFF', color: '#1F1F1F' }}>-- General / Common Area --</option>
                {resources.map(res => (
                  <option key={res.id} value={res.id} style={{ background: '#FFFFFF', color: '#1F1F1F' }}>
                    {res.name} ({res.building})
                  </option>
                ))}
              </select>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#64748b' 
              }} />
            </div>
            {!isLinked && (
              <p style={{ fontSize: '0.75rem', color: '#6B7281', marginTop: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={12} /> Tip: Linking a room directly helps technicians find the issue faster.
              </p>
            )}
          </div>

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
              style={{ 
                background: '#fff',
                color: '#1e293b',
                fontWeight: '600',
                border: '1px solid #e2e8f0'
              }}
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


          {/* Image Upload Section */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 size={16} /> Attach Photos (Maximum 3)
            </label>
            <ImageUpload onFilesSelected={setSelectedFiles} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
            <button 
              disabled={loading} 
              type="submit" 
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #8C0000 0%, #5A0000 100%)',
                padding: '16px 40px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '800',
                boxShadow: '0 10px 25px rgba(140, 0, 0, 0.2)',
                border: 'none',
                color: '#fff'
              }}
            >
              {loading ? 'Authenticating Request...' : 'Submit Maintenance Request'}
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

