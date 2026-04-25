import React, { useState, useEffect } from 'react';
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
      <header className="staff-page-header">
        <div className="header-content">
          <h1>Technician <span className="text-indigo">Maintenance Hub</span></h1>
          <p>Logged in as: <strong>{user?.fullName}</strong>. Operational status is active.</p>
        </div>
        <div className="header-time">
          <Clock size={16} />
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* Summary Statistics */}
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
          color="#8b5cf6"
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
            <div className="recent-tickets-list">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Synchronizing ledger...</div>
              ) : recentTickets.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                   <p className="text-slate-500">No active maintenance tickets found.</p>
                </div>
              ) : recentTickets.map(ticket => (
                <div key={ticket.id} className="mini-ticket-row" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <div className={`priority-indicator ${ticket.priority.toLowerCase()}`} />
                  <div className="row-content">
                    <span className="ticket-title">{ticket.title}</span>
                    <span className="ticket-meta">{ticket.building} • {ticket.category || 'Maintenance'}</span>
                  </div>
                  <div className={`status-badge ${ticket.status.toLowerCase().replace('_', '-')}`}>
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
