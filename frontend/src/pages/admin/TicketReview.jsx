import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, CheckCircle, Hammer, Info, 
  MapPin, Clock, Ticket, User, ShieldAlert,
  Loader2, Camera, MessageSquare, Save
} from 'lucide-react';

export default function TicketReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, usersRes] = await Promise.all([
        authFetch(`http://localhost:8081/api/tickets/${id}`),
        authFetch(`http://localhost:8081/api/users`) // Filter technicians below
      ]);
      
      if (!ticketRes.ok) throw new Error('Could not retrieve ticket parameters');
      
      const ticketData = await ticketRes.json();
      const userData = await usersRes.json();
      
      setTicket(ticketData);
      setSelectedTech(ticketData.technicianId || '');
      
      // Filter for list of Technicians
      setTechnicians(Array.isArray(userData) ? userData.filter(u => u.role === 'TECHNICIAN') : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTech) return;
    setProcessing(true);
    try {
      // Endpoint: PATCH /api/tickets/{id}/assign?technicianId=...&assignedBy=...
      const res = await authFetch(`http://localhost:8081/api/tickets/${id}/assign?technicianId=${selectedTech}&assignedBy=ADMIN`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        alert('Assignment successful. The technician has been notified.');
        navigate('/admin/tickets');
      } else {
        throw new Error('Assignment failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: 'auto', color: '#6366f1' }} />
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/admin/tickets" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '32px' }}>
        <ArrowLeft size={18} /> BACK TO LISTING
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* Main Content */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden' }}>
          <header style={{ padding: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
               <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Ticket #{ticket.id?.slice(-8)}</h1>
               <span style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                 {ticket.status}
               </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#cbd5e1', fontWeight: '500' }}>{ticket.title}</h2>
          </header>

          <div style={{ padding: '32px' }}>
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Issue Description</h3>
              <p style={{ color: '#fff', lineHeight: '1.6', fontSize: '1.05rem' }}>{ticket.description}</p>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <MapPin size={14} /> Location Details
                  </div>
                  <div style={{ color: '#fff' }}>{ticket.locationDetail || 'Not specified'}</div>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <ShieldAlert size={14} /> Reported On
                  </div>
                  <div style={{ color: '#fff' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Assignment */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '32px', padding: '30px' }}>
             <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Hammer size={18} color="#818cf8" /> Assign Technician
             </h3>
             
             <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>Select Expert</label>
                <select 
                   value={selectedTech}
                   onChange={e => setSelectedTech(e.target.value)}
                   style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                >
                   <option value="">-- Unassigned --</option>
                   {technicians.map(tech => (
                     <option key={tech.id} value={tech.id}>{tech.fullName} ({tech.campusId})</option>
                   ))}
                </select>
             </div>

             <button 
               onClick={handleAssign}
               disabled={processing || !selectedTech}
               style={{ 
                 width: '100%', padding: '14px', borderRadius: '12px', 
                 background: '#6366f1', color: '#fff', border: 'none', 
                 fontWeight: 'bold', cursor: 'pointer', display: 'flex', 
                 alignItems: 'center', justifyContent: 'center', gap: '8px',
                 opacity: (processing || !selectedTech) ? 0.5 : 1
               }}
             >
               {processing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
               UPDATE ASSIGNMENT
             </button>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '30px' }}>
             <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Info size={16} color="#64748b" /> Resolution Guidelines
             </h3>
             <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                <li>• Only technicians from the Maintenance Pool can be assigned.</li>
                <li>• Assignment triggers an IN_PROGRESS status update.</li>
                <li>• Technicians will receive internal hub alerts immediately.</li>
             </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
