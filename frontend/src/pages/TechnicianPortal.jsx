import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  AlertCircle, 
  CheckCircle, 
  Wrench, 
  Search, 
  PlusCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import '../styles/staff-portal.css';

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

export default function TechnicianPortal() {
  const { user, authFetch, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTickets: 0,
    myTickets: 0,
    urgentTickets: 0,
    completedToday: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Parallel fetch for stats and recent activity
      const [statsRes, ticketsRes] = await Promise.all([
        authFetch(`${API}/api/tickets/stats/technician/${user.id}`),
        authFetch(`${API}/api/tickets/recent?limit=8`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          activeTickets: statsData.activeTickets || 0,
          myTickets: statsData.myTickets || 0,
          urgentTickets: statsData.urgentTickets || 0,
          completedToday: statsData.completedToday || 0
        });
      }

      if (ticketsRes.ok) {
        const tickets = await ticketsRes.json();
        setRecentTickets(tickets);
      }

    } catch (error) {
      console.error('Error fetching technician data:', error);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, value, icon, color, subtitle }) => (
    <div className="staff-stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-title">{title}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );

  return (
    <div className="staff-portal-container">
      <Reveal>
        <header className="staff-page-header" style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          padding: '32px 40px',
          borderRadius: '32px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="header-content">
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950' }}>Technician <span style={{ color: 'var(--accent-primary)' }}>Terminal</span></h1>
            <p style={{ margin: '8px 0 0', fontWeight: '500', color: 'var(--text-secondary)' }}>System authenticated as: <strong>{user?.fullName}</strong>. Technical status: <strong>Active</strong></p>
          </div>
          <div className="header-time" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </header>
      </Reveal>

      {/* Summary Statistics */}
      <Reveal className="mt-12">
        <section className="staff-stats-grid">
        <SummaryCard 
          title="Active Tickets" 
          value={stats.activeTickets} 
          icon={<ClipboardList size={24} />} 
          color="#3b82f6"
          subtitle="System-wide issues"
        />
        <SummaryCard 
          title="My Assignments" 
          value={stats.myTickets} 
          icon={<Wrench size={24} />} 
          color="#A86A6A"
          subtitle="Assigned to you"
        />
        <SummaryCard 
          title="Urgent Alerts" 
          value={stats.urgentTickets} 
          icon={<AlertCircle size={24} />} 
          color="#ef4444"
          subtitle="Requires immediate attention"
        />
        <SummaryCard 
          title="Jobs Completed" 
          value={stats.completedToday} 
          icon={<CheckCircle size={24} />} 
          color="#10b981"
          subtitle="Total resolved today"
        />
        </section>
      </Reveal>

      <div className="staff-dashboard-content">
        <div className="staff-main-section">
          <h2>Quick Management</h2>
          <div className="quick-actions-grid">
            <button className="q-action-btn" onClick={() => navigate('/tickets')}>
              <div className="qa-icon"><ClipboardList /></div>
              <div className="qa-text">
                <h3>Maintenance Board</h3>
                <p>View all campus reportings</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/resources')}>
              <div className="qa-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><Search /></div>
              <div className="qa-text">
                <h3>Resource Catalog</h3>
                <p>Manage facility status</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/admin/logs')}>
              <div className="qa-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><PlusCircle /></div>
              <div className="qa-text">
                <h3>System Logs</h3>
                <p>Audit infrastructure changes</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
          </div>

          <div className="recent-activity-section">
            <div className="section-header">
              <h2>Recent Global Activity</h2>
              <button className="text-btn" onClick={() => navigate('/tickets')}>Open full board</button>
            </div>
            <div className="recent-tickets-list mt-6">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing ledger...</div>
              ) : recentTickets.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No active maintenance tickets found.</p>
                </div>
              ) : recentTickets.map(ticket => (
                <div key={ticket.id} className="mini-ticket-row" onClick={() => navigate(`/tickets/${ticket.id}`)} 
                     style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div className={`priority-indicator ${ticket.priority.toLowerCase()}`} style={{ width: '8px', height: '36px', borderRadius: '4px', marginRight: '20px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{ticket.title}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{ticket.building} • {ticket.category || 'Maintenance'}</div>
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', fontWeight: '850', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '99px',
                    background: 'rgba(192, 128, 128, 0.1)', color: 'var(--accent-secondary)'
                  }}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <aside className="staff-sidebar">
          <div className="sidebar-card">
            <h3>Technician Support</h3>
            <p>For critical infrastructure failure, use the emergency radio protocol immediately.</p>
            <button className="secondary-btn">Operational Manual</button>
          </div>
          <div className="sidebar-card maintenance-card">
            <div className="maintenance-icon">⚠️</div>
            <h3>System Notice</h3>
            <p>Routine backup initialized. Some telemetry data might be delayed.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
