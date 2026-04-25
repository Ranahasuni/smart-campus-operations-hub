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

import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, Calendar, Home,
  CheckCircle2, AlertTriangle, XCircle, Activity,
  Monitor, Info
} from 'lucide-react';

// Sub-components
import SummaryCards from './SummaryCards';
import ResourcesByBuildingChart from './ResourcesByBuildingChart';
import PeakBookingHoursChart from './PeakBookingHoursChart';
import MostBookedTable from './MostBookedTable';

export default function ResourceAnalyticsPage() {
  const { authFetch, API, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await authFetch(`${API}/api/resources/analytics/summary`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Analytics fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!stats) return <div style={{ padding: '40px', color: '#1F1F1F' }}>No analytics data found.</div>;

  return (
    <div style={{ padding: '40px 24px', minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>

      {/* Master Content Container (Premium Branding) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(30px)',
        borderRadius: '40px',
        padding: '50px',
        boxShadow: '0 30px 60px -15px rgba(140, 0, 0, 0.08)',
        maxWidth: '1450px',
        margin: '0 auto',
        border: '1px solid rgba(192, 128, 128, 0.1)'
      }}>

        {/* Top Header Row inside the Master Box */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '50px',
          paddingBottom: '30px',
          borderBottom: '1px solid rgba(192, 128, 128, 0.06)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
              <Activity size={38} color="#C08080" strokeWidth={2.5} />
              <h1 style={{ fontSize: '3.2rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-2px' }}>
                Resource <span style={{ color: '#C08080' }}>Analytics</span>
              </h1>
            </div>
            <p style={{ fontSize: '1.1rem', color: '#6B7281', margin: 0, fontWeight: '500', maxWidth: '600px' }}>
              High-fidelity evaluations of campus facility utilization and asset performance metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(140, 0, 0, 0.03)', padding: '6px', borderRadius: '18px', border: '1px solid rgba(192, 128, 128, 0.06)' }}>
              <button onClick={() => window.location.href = '/admin'} style={navButtonStyle}>
                <LayoutDashboard size={16} /> Overview
              </button>
              <button style={{ ...navButtonStyle, background: '#10b981', color: '#1F1F1F', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                <TrendingUp size={16} /> Analytics
              </button>
            </div>
            <div style={{
              background: 'rgba(192, 128, 128, 0.1)', color: '#1F1F1F', padding: '15px 25px', borderRadius: '18px',
              border: '1px solid rgba(192, 128, 128, 0.2)',
              fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Calendar size={18} color="#C08080" />
              Sync Period: {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        {/* 1. Summary Block */}
        <div style={{ marginBottom: '50px' }}>
          <SummaryCards stats={stats} />
        </div>

        {/* 2. Visual Intelligence Block (Charts) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px', marginBottom: '40px',
          padding: '40px', background: 'rgba(192, 128, 128, 0.03)', borderRadius: '35px', border: '1px solid rgba(192, 128, 128, 0.06)'
        }}>
          <PeakBookingHoursChart data={stats.peakBookingHours} isDark={false} />
          <ResourcesByBuildingChart data={stats.distributionByBuilding} isDark={false} />
        </div>

        {/* 3. Detailed Data Table Block */}
        <div style={{ marginTop: '40px' }}>
          <MostBookedTable data={stats.mostBooked} isDark={false} />
        </div>

        {/* Unified Footer */}
        <footer style={{
          marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(192, 128, 128, 0.06)',
          textAlign: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px'
        }}>
          DECISION SUPPORT ENGINE | POWERED BY SMART CAMPUS OPERATIONS HUB © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

const navButtonStyle = {
  padding: '12px 22px',
  borderRadius: '14px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '800',
  fontSize: '0.8rem',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'transparent',
  color: '#6B7281',
  transition: 'all 0.3s'
};