import React, { useState, useEffect } from 'react';

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
  const { authFetch, API } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, usersRes] = await Promise.all([
        authFetch(`${API}/api/tickets/${id}`),
        authFetch(`${API}/api/users`) // Filter technicians below
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
      const res = await authFetch(`${API}/api/tickets/${id}/assign?technicianId=${selectedTech}&assignedBy=ADMIN`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        setSuccessMsg('Assignment successful. The technician has been notified.');
        setShowSuccess(true);
      } else {
        throw new Error('Assignment failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: 'auto', color: '#C08080' }} />
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/admin/tickets" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7281', textDecoration: 'none', marginBottom: '32px' }}>
        <ArrowLeft size={18} /> BACK TO LISTING
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* Main Content */}
        <div style={{ background: 'rgba(245, 230, 230, 0.6)', border: '1px solid rgba(192, 128, 128, 0.06)', borderRadius: '32px', overflow: 'hidden' }}>
          <header style={{ padding: '32px', borderBottom: '1px solid rgba(192, 128, 128, 0.06)', background: 'rgba(192, 128, 128, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
               <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F1F1F', margin: 0 }}>Ticket {ticket.displayId || ticket.id?.slice(-8).toUpperCase()}</h1>
               <span style={{ padding: '4px 12px', background: 'rgba(192, 128, 128, 0.1)', color: '#C08080', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                 {ticket.status}
               </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#4B5563', fontWeight: '500' }}>{ticket.title}</h2>
          </header>

          <div style={{ padding: '32px' }}>
            <section style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#6B7281', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Issue Description</h3>
              <p style={{ color: '#1F1F1F', lineHeight: '1.6', fontSize: '1.05rem' }}>{ticket.description}</p>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div style={{ background: 'rgba(192, 128, 128, 0.06)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(192, 128, 128, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7281', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <MapPin size={14} /> Location Details
                  </div>
                  <div style={{ color: '#1F1F1F' }}>{ticket.locationDetail || 'Not specified'}</div>
               </div>
               <div style={{ background: 'rgba(192, 128, 128, 0.06)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(192, 128, 128, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7281', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <ShieldAlert size={14} /> Reported On
                  </div>
                  <div style={{ color: '#1F1F1F' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Assignment */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ background: 'rgba(192, 128, 128, 0.05)', border: '1px solid rgba(192, 128, 128, 0.1)', borderRadius: '32px', padding: '30px' }}>
             <h3 style={{ color: '#1F1F1F', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Hammer size={18} color="#C08080" /> Assign Technician
             </h3>
             
             <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#6B7281', fontSize: '0.8rem', marginBottom: '8px' }}>Select Expert</label>
                <select 
                   value={selectedTech}
                   onChange={e => setSelectedTech(e.target.value)}
                   style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(245, 230, 230, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#1F1F1F', outline: 'none' }}
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
                 background: '#C08080', color: '#1F1F1F', border: 'none', 
                 fontWeight: 'bold', cursor: 'pointer', display: 'flex', 
                 alignItems: 'center', justifyContent: 'center', gap: '8px',
                 opacity: (processing || !selectedTech) ? 0.5 : 1
               }}
             >
               {processing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
               UPDATE ASSIGNMENT
             </button>
          </div>

          <div style={{ background: 'rgba(245, 230, 230, 0.4)', border: '1px solid rgba(192, 128, 128, 0.06)', borderRadius: '32px', padding: '30px' }}>
             <h3 style={{ color: '#1F1F1F', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Info size={16} color="#64748b" /> Resolution Guidelines
             </h3>
             <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#6B7281' }}>
                <li>• Only technicians from the Maintenance Pool can be assigned.</li>
                <li>• Assignment triggers an IN_PROGRESS status update.</li>
                <li>• Technicians will receive internal hub alerts immediately.</li>
             </ul>
          </div>
        </aside>

      </div>
      {/* ═══ MINIMAL SUCCESS MODAL ═══ */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ background: '#FFFFFF', padding: '48px 40px', borderRadius: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Task Assigned</h2>
            <p style={{ color: '#6B7281', fontSize: '1.05rem', fontWeight: '500', marginBottom: '40px', lineHeight: '1.5' }}>{successMsg}</p>
            <button onClick={() => navigate('/admin/tickets')} style={{ background: 'none', border: 'none', color: '#111827', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', padding: '10px 20px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
