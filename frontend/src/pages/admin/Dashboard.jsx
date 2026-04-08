import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, ShieldAlert, Activity, BellRing, TrendingUp, Clock, ShieldCheck, MailWarning, Ticket, Hammer, ArrowRight } from 'lucide-react';
import ticketApi from '../../api/ticketApi';

export default function Dashboard() {
  const { authFetch, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    lockedUsers: 0,
    activeUsers: 0,
    openTickets: 0,
    allTickets: 0,
    recentLogs: [],
    resourceStats: null // NEW: For intelligence card
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, [user]);

  const fetchDashData = async () => {
    // SECURITY FIX: Only fetch if user is truly an ADMIN
    if (user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    try {
      // Fetch users for counts (Using synchronized port 8082)
      const userRes = await authFetch('http://localhost:8082/api/users');
      const users = userRes.ok ? await userRes.json() : [];
      
      // Fetch logs for activity
      const logRes = await authFetch('http://localhost:8082/api/logs');
      const logs = logRes.ok ? await logRes.json() : [];

      const safeUsers = Array.isArray(users) ? users : [];
      const safeLogs = Array.isArray(logs) ? logs : [];

      // Fetch tickets for maintenance stats
      let ticketData = [];
      try {
        const ticketRes = await ticketApi.getAllTickets();
        ticketData = Array.isArray(ticketRes.data) ? ticketRes.data : [];
      } catch (tErr) {
        console.error('Ticket Fetch Error:', tErr);
      }

      // NEW: Robust Analytics Fetch
      let rStats = null;
      try {
        const analyticsRes = await authFetch('http://localhost:8081/api/resources/analytics/summary');
        if (analyticsRes.ok) {
          rStats = await analyticsRes.json();
        }
      } catch (aErr) {
        console.error('Analytics Fetch Error:', aErr);
      }
 
      setStats({
        totalUsers: safeUsers.length,
        lockedUsers: safeUsers.filter(u => u.status === 'LOCKED').length,
        activeUsers: safeUsers.filter(u => u.status === 'ACTIVE').length,
        openTickets: ticketData.filter(t => t.status === 'OPEN').length,
        allTickets: ticketData.length,
        recentLogs: safeLogs.slice(-6).reverse(),
        resourceStats: rStats
      });
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#fff' }}>Admin Overview</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>System health and user security metrics</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={<Users color="#6366f1" />} label="Total Registered" value={stats.totalUsers} color="bg-indigo" />
        <StatCard icon={<ShieldCheck color="#22c55e" />} label="Active Accounts" value={stats.activeUsers} color="bg-green" />
        <StatCard icon={<Ticket color="#f43f5e" />} label="Open Tickets" value={stats.openTickets} valueColor="#f43f5e" />
        <StatCard icon={<MailWarning color="#f59e0b" />} label="Locked (Failed)" value={stats.lockedUsers} valueColor="#f59e0b" color="bg-amber" />
        <StatCard icon={<TrendingUp color="#8b5cf6" />} label="System Uptime" value="99.9%" color="bg-purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Activity Feed */}
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#6366f1" /> Recent System Logs
            </h2>
            <a href="/admin/logs" style={{ fontSize: '0.875rem', color: '#6366f1', textDecoration: 'none' }}>View All</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.recentLogs.map((log, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color="#64748b" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#cbd5e1', fontWeight: '500', fontSize: '0.875rem' }}>{log.action}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{log.details || 'No details provided'}</div>
                </div>
                <div style={{ color: '#475569', fontSize: '0.75rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips, Maintenance Management & Booking Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Campus Intelligence Hub */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
            borderRadius: '24px', 
            border: '1px solid rgba(16, 185, 129, 0.2)', 
            padding: '30px',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#10b981" /> Campus Intelligence
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '20px', lineHeight: '1.6' }}>
               {stats.resourceStats ? (
                  <>The analytics engine is monitoring <strong>{stats.resourceStats.activeResources}</strong> active facilities out of <strong>{stats.resourceStats.totalResources}</strong> total assets.</>
               ) : (
                  <>Synchronizing with facility analytics engine...</>
               )}
            </p>
            <button 
                onClick={() => window.location.href = '/admin/dashboard'}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)'
                }}
              >
                Launch Full Analytics <Activity size={16} />
            </button>
          </div>

          {/* Maintenance Hub Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
            borderRadius: '24px', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            padding: '30px',
            position: 'relative'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hammer size={22} className="text-indigo-400" /> Maintenance Hub
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Oversee campus facility issues. Currently managing <strong>{stats.allTickets}</strong> total tickets.
              </p>
              <button 
                onClick={() => window.location.href = '/tickets'}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                }}
              >
                Manage Maintenance <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Actions / Security Tips */}
          <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '30px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#fbbf24" /> Security & Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#94a3b8', fontSize: '0.875rem' }}>
              <p>• Review pending reservations daily to avoid scheduling overlaps.</p>
              <p>• Accounts are locked automatically after multiple failed attempts.</p>
              <div style={{ marginTop: '10px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <h3 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '8px' }}>Admin Shortcuts</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="/admin/bookings" style={{ color: '#818cf8', textDecoration: 'none' }}>→ Moderate Bookings</a>
                    <a href="/admin/users" style={{ color: '#818cf8', textDecoration: 'none' }}>→ Handle Locked Users</a>
                 </div>
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
                Tip: Only Admins can permanently delete user accounts and logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, valueColor = '#fff' }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '24px', borderRadius: '24px',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>{label}</div>
        <div style={{ color: valueColor, fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );
}
