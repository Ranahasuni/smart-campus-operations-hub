import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, ShieldAlert, Activity, BellRing, TrendingUp, Clock, ShieldCheck, MailWarning } from 'lucide-react';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    lockedUsers: 0,
    activeUsers: 0,
    recentLogs: []
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
      const userRes = await authFetch('http://localhost:8081/api/users');
      const users = userRes.ok ? await userRes.json() : [];
      
      // Fetch logs for activity
      const logRes = await authFetch('http://localhost:8081/api/logs');
      const logs = logRes.ok ? await logRes.json() : [];

      const safeUsers = Array.isArray(users) ? users : [];
      const safeLogs = Array.isArray(logs) ? logs : [];

      setStats({
        totalUsers: safeUsers.length,
        lockedUsers: safeUsers.filter(u => u.status === 'LOCKED').length,
        activeUsers: safeUsers.filter(u => u.status === 'ACTIVE').length,
        recentLogs: safeLogs.slice(-6).reverse()
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={<Users color="#6366f1" />} label="Total Registered" value={stats.totalUsers} color="bg-indigo" />
        <StatCard icon={<ShieldCheck color="#22c55e" />} label="Active Accounts" value={stats.activeUsers} color="bg-green" />
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

        {/* Quick Actions / Security Tips */}
        <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#fbbf24" /> Security Reminders
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#94a3b8', fontSize: '0.875rem' }}>
            <p>• Review pending reservations daily to avoid scheduling overlaps.</p>
            <p>• Accounts are locked automatically after multiple failed authentication attempts.</p>
            <p>• Audit logs track every administrative action for accountability.</p>
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '8px' }}>Quick Actions</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/admin/bookings" style={{ color: '#818cf8', textDecoration: 'none' }}>→ Moderate Bookings</a>
                  <a href="/admin/users" style={{ color: '#818cf8', textDecoration: 'none' }}>→ Handle Locked Users</a>
               </div>
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
