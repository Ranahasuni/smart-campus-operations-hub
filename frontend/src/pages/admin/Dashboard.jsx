import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldAlert, Activity, TrendingUp, Clock,
  ShieldCheck, MailWarning, Ticket, Hammer, ArrowRight,
  LayoutDashboard, PieChart
} from 'lucide-react';
import ticketApi from '../../api/ticketApi';

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

// Sub-components
import SummaryCards from './DashboardComponents/SummaryCards';
import ResourcesByBuildingChart from './DashboardComponents/ResourcesByBuildingChart';
import PeakBookingHoursChart from './DashboardComponents/PeakBookingHoursChart';
import MostBookedTable from './DashboardComponents/MostBookedTable';
import ResourceAnalyticsPage from './DashboardComponents/ResourceAnalyticsPage';

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

  // Logic for switching tabs removed - now handled natively within the component

  const fetchDashData = async () => {
    if (!user) return;
    if (!['ADMIN', 'LECTURER'].includes(user?.role)) {
      setLoading(false);
      return;
    }

    const loadMetric = async (url, updater) => {
      try {
        const res = await authFetch(url);
        if (res.ok) {
          const data = await res.json();
          updater(data);
        }
      } catch (err) {
        console.warn(`Dashboard metric failed: ${url}`, err);
      }
    };

    // ⚡ PERFORMANCE FIX: Load basic stats first, analytics in background
    // Kick off all requests in parallel
    const basicStatsPromises = [
      loadMetric(`${API}/api/users/stats`, (d) => {
        setStats(prev => ({ ...prev, totalUsers: d?.total || 0, activeUsers: d?.active || 0, lockedUsers: d?.locked || 0 }));
      }),
      loadMetric(`${API}/api/tickets/stats/global`, (d) => {
        setStats(prev => ({ ...prev, openTickets: d?.open || 0, allTickets: d?.total || 0 }));
      }),
      loadMetric(`${API}/api/logs?limit=6`, (d) => {
        setStats(prev => ({ ...prev, recentLogs: Array.isArray(d) ? d : [] }));
      })
    ];

    // Clear loading screen after basic stats load (800ms timeout)
    // This gives users immediate feedback while analytics loads in background
    setTimeout(() => setLoading(false), 800);

    // Load analytics separately in background - don't block UI
    // This endpoint now runs in parallel (previously sequential) with 5-min cache
    loadMetric(`${API}/api/resources/analytics/summary`, (d) => {
      setStats(prev => ({ ...prev, resourceStats: d }));
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        height: '90vh', background: '#FFFFFF', color: 'var(--text-secondary)' 
      }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p style={{ fontWeight: '800', letterSpacing: '2px', fontSize: '0.9rem' }}>SYNCHRONIZING COMMAND CENTER...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Unified Multi-View Header */}
      <Reveal>
        <header style={{
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          padding: '24px 32px',
          borderRadius: '32px',
          border: '1px solid rgba(192, 128, 128, 0.1)',
          boxShadow: '0 4px 30px rgba(140, 0, 0, 0.05)'
        }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px' }}>
              System <span style={{ color: '#8b0000' }}>Overview</span>
            </h1>
            <p style={{ color: '#6B7281', marginTop: '4px', fontWeight: '500' }}>
              High-level system health and security metrics
            </p>
          </div>

          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.03)',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px',
                background: activeTab === 'OVERVIEW' ? '#1F2937' : 'transparent',
                color: activeTab === 'OVERVIEW' ? '#fff' : '#64748b',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === 'OVERVIEW' ? '0 10px 20px -5px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px',
                background: activeTab === 'ANALYTICS' ? '#10b981' : 'transparent',
                color: activeTab === 'ANALYTICS' ? '#fff' : '#64748b',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === 'ANALYTICS' ? '0 10px 20px -5px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <TrendingUp size={18} /> Analytics
            </button>
          </div>
        </header>
      </Reveal>

      {/* VIEW 1: SYSTEM OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="fade-in anim-dash">
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <StatCard icon={<Users color="#C08080" />} label="Total Registered" value={stats.totalUsers} />
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
          </Reveal>

          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              {/* Activity Feed */}
              <div className="glass-panel" style={{ borderRadius: '32px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', color: '#1F1F1F', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#C08080" /> Recent Activity
                  </h2>
                  <a href="/admin/logs" style={{ fontSize: '0.875rem', color: '#C08080', textDecoration: 'none', fontWeight: 'bold' }}>View All</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.recentLogs.map((log) => (
                    <div key={log.id || log.timestamp} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid rgba(192, 128, 128, 0.06)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(192, 128, 128, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={16} color="#64748b" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#4B5563', fontWeight: '500', fontSize: '0.875rem' }}>{log.action}</div>
                        <div style={{ color: '#6B7281', fontSize: '0.75rem' }}>{log.details}</div>
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.75rem' }}>
                        {(() => {
                          const ts = log.timestamp;
                          if (!ts) return 'Unknown';
                          const date = Array.isArray(ts) 
                            ? new Date(ts[0], ts[1]-1, ts[2], ts[3] || 0, ts[4] || 0, ts[5] || 0)
                            : new Date(ts);
                          return isNaN(date.getTime()) ? 'Invalid' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Maintenance Hub */}
                <div style={{ background: 'rgba(192, 128, 128, 0.05)', borderRadius: '24px', border: '1px solid rgba(192, 128, 128, 0.1)', padding: '30px' }}>
                  <h2 style={{ fontSize: '1.2rem', color: '#1F1F1F', fontWeight: 'bold', marginBottom: '15px' }}>Quick Shortcuts</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <DashboardLink to="/admin/bookings" label="Manage Bookings" />
                    <DashboardLink to="/admin/users" label="Account Security" />
                    <DashboardLink to="/admin/tickets" label="Maintenance Tickets" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* VIEW 2: RESOURCE ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="fade-in anim-dash">
           <ResourceAnalyticsPage embedMode={true} />
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, valueColor = '#1F1F1F' }) {
  return (
    <div style={{ background: 'rgba(245, 230, 230, 0.5)', border: '1px solid rgba(185, 122, 122, 0.15)', padding: '24px', borderRadius: '24px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(192, 128, 128, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ color: '#6B7281', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color: valueColor, fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>{value}</div>
    </div>
  );
}

function DashboardLink({ to, label }) {
  return (
    <a href={to} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderRadius: '12px', background: 'rgba(192, 128, 128, 0.06)',
      textDecoration: 'none', color: '#4B5563', fontSize: '0.9rem', fontWeight: '500',
      border: '1px solid rgba(192, 128, 128, 0.06)'
    }}>
      {label} <ArrowRight size={16} color="#C08080" />
    </a>
  );
}
