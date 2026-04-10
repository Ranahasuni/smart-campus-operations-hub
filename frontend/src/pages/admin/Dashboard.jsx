import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldAlert, Activity, TrendingUp, Clock,
  ShieldCheck, MailWarning, Ticket, Hammer, ArrowRight,
  LayoutDashboard, PieChart
} from 'lucide-react';
import ticketApi from '../../api/ticketApi';

// Sub-components
import SummaryCards from './DashboardComponents/SummaryCards';
import ResourcesByBuildingChart from './DashboardComponents/ResourcesByBuildingChart';
import MostBookedTable from './DashboardComponents/MostBookedTable';

export default function Dashboard() {
  const { authFetch, user, API } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW or ANALYTICS
  const [stats, setStats] = useState({
    totalUsers: 0,
    lockedUsers: 0,
    activeUsers: 0,
    openTickets: 0,
    allTickets: 0,
    recentLogs: [],
    resourceStats: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'ANALYTICS') {
      const timer = setTimeout(() => navigate('/admin/dashboard'), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, navigate]);

  const fetchDashData = async () => {
    if (user?.role !== 'ADMIN') return;

    try {
      // 1. Fetch Users
      const userRes = await authFetch(`${API}/api/users`);
      const users = userRes.ok ? await userRes.json() : [];

      // 2. Fetch Logs
      const logRes = await authFetch(`${API}/api/logs`);
      const logs = logRes.ok ? await logRes.json() : [];

      // 3. Fetch Tickets
      let ticketData = [];
      try {
        const ticketRes = await ticketApi.getAllTickets();
        ticketData = Array.isArray(ticketRes.data) ? ticketRes.data : [];
      } catch (tErr) { console.error(tErr); }

      // 4. Fetch Resource Analytics
      let rStats = null;
      try {
        const analyticsRes = await authFetch(`${API}/api/resources/analytics/summary`);
        if (analyticsRes.ok) rStats = await analyticsRes.json();
      } catch (aErr) { console.error(aErr); }

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        lockedUsers: Array.isArray(users) ? users.filter(u => u.status === 'LOCKED').length : 0,
        activeUsers: Array.isArray(users) ? users.filter(u => u.status === 'ACTIVE').length : 0,
        openTickets: ticketData.filter(t => t.status === 'OPEN').length,
        allTickets: ticketData.length,
        recentLogs: Array.isArray(logs) ? logs.slice(-6).reverse() : [],
        resourceStats: rStats
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Unified Multi-View Header */}
      <header style={{
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
            {activeTab === 'OVERVIEW' ? 'Command Overview' : 'Operational Intelligence'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>
            {activeTab === 'OVERVIEW' ? 'System health and security metrics' : 'In-depth evaluation of campus asset performance'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === 'OVERVIEW' ? '#6366f1' : 'transparent',
              color: activeTab === 'OVERVIEW' ? '#fff' : '#64748b',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === 'ANALYTICS' ? '#10b981' : 'transparent',
              color: activeTab === 'ANALYTICS' ? '#fff' : '#64748b',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <TrendingUp size={18} /> Analytics
          </button>
        </div>
      </header>

      {/* VIEW 1: SYSTEM OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="fade-in anim-dash">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <StatCard icon={<Users color="#6366f1" />} label="Total Registered" value={stats.totalUsers} />
            <StatCard icon={<ShieldCheck color="#22c55e" />} label="Active Accounts" value={stats.activeUsers} />
            <StatCard icon={<Ticket color="#f43f5e" />} label="Open Tickets" value={stats.openTickets} valueColor="#f43f5e" />
            <StatCard icon={<MailWarning color="#f59e0b" />} label="Locked Accounts" value={stats.lockedUsers} valueColor="#f59e0b" />
            <StatCard 
              icon={<Activity color="#10b981" />} 
              label="Resources Active" 
              value={stats.resourceStats && stats.resourceStats.totalResources > 0 
                ? `${Math.round((stats.resourceStats.activeResources / stats.resourceStats.totalResources) * 100)}%`
                : "0%"} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            {/* Activity Feed */}
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#6366f1" /> Recent Activity
                </h2>
                <a href="/admin/logs" style={{ fontSize: '0.875rem', color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>View All</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats.recentLogs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} color="#64748b" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#cbd5e1', fontWeight: '500', fontSize: '0.875rem' }}>{log.action}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{log.details}</div>
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Maintenance Hub */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold', marginBottom: '15px' }}>Quick Shortcuts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DashboardLink to="/admin/bookings" label="Manage Bookings" />
                  <DashboardLink to="/admin/users" label="Account Security" />
                  <DashboardLink to="/admin/tickets" label="Maintenance Tickets" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RESOURCE ANALYTICS - DEPRECATED (LIVE AT /admin/dashboard) */}
      {activeTab === 'ANALYTICS' && (
        <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
          <Activity className="animate-pulse" size={48} style={{ margin: '0 auto 20px' }} />
          <p>Redirecting to dedicated Intelligence engine...</p>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, valueColor = '#fff' }) {
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '24px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color: valueColor, fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>{value}</div>
    </div>
  );
}

function DashboardLink({ to, label }) {
  return (
    <a href={to} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
      textDecoration: 'none', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '500',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {label} <ArrowRight size={16} color="#6366f1" />
    </a>
  );
}
