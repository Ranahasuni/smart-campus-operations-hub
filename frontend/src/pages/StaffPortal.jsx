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

export default function StaffPortal() {
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
      const res = await authFetch(`${API}/api/tickets`);
      if (res.ok) {
        const tickets = await res.json();
        
        // Calculate statistics
        const myTasks = tickets.filter(t => t.technicianId === user.id && t.status !== 'COMPLETED');
        const urgent = tickets.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED');
        const active = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
        const completed = tickets.filter(t => t.status === 'COMPLETED');

        setStats({
          activeTickets: active.length,
          myTickets: myTasks.length,
          urgentTickets: urgent.length,
          completedToday: completed.length
        });

        // Get top 5 recent tickets
        setRecentTickets(tickets.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
          <h1>Staff Portal</h1>
          <p>Welcome back, <strong>{user?.fullName}</strong>. Here is your operational overview.</p>
        </div>
        <div className="header-time">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* Summary Statistics */}
      <section className="staff-stats-grid">
        <SummaryCard 
          title="Active Tickets" 
          value={stats.activeTickets} 
          icon={<ClipboardList size={24} />} 
          color="#3b82f6"
          subtitle="Total campus issues"
        />
        <SummaryCard 
          title="My Tasks" 
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
          subtitle="Requires attention"
        />
        <SummaryCard 
          title="Jobs Completed" 
          value={stats.completedToday} 
          icon={<CheckCircle size={24} />} 
          color="#10b981"
          subtitle="Total resolved"
        />
      </section>

      <div className="staff-dashboard-content">
        {/* Quick Actions */}
        <div className="staff-main-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="q-action-btn" onClick={() => navigate('/tickets')}>
              <div className="qa-icon"><ClipboardList /></div>
              <div className="qa-text">
                <h3>View Tickets</h3>
                <p>Manage and update reported issues</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/resources')}>
              <div className="qa-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><Search /></div>
              <div className="qa-text">
                <h3>Find Resources</h3>
                <p>Locate facilities and equipment</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/tickets/new')}>
              <div className="qa-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><PlusCircle /></div>
              <div className="qa-text">
                <h3>Report Fault</h3>
                <p>Log a new technical issue</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
          </div>

          <div className="recent-activity-section">
            <div className="section-header">
              <h2>Recent Global Activity</h2>
              <button className="text-btn" onClick={() => navigate('/tickets')}>View full board</button>
            </div>
            <div className="recent-tickets-list">
              {loading ? (
                <p>Syncing data...</p>
              ) : recentTickets.map(ticket => (
                <div key={ticket.id} className="mini-ticket-row" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <div className={`priority-indicator ${ticket.priority.toLowerCase()}`} />
                  <div className="row-content">
                    <span className="ticket-title">{ticket.title}</span>
                    <span className="ticket-meta">{ticket.building} • {ticket.category}</span>
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
            <h3>Staff Support</h3>
            <p>Need help with the portal? Contact the IT Service Desk or check the system manual.</p>
            <button className="secondary-btn">System Manual</button>
          </div>
          <div className="sidebar-card maintenance-card">
            <div className="maintenance-icon">⚠️</div>
            <h3>Scheduled Maintenance</h3>
            <p>Database synchronization scheduled for 10:00 PM tonight. Please save all work.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
