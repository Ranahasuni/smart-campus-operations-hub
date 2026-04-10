import React, { useState, useEffect } from 'react';
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
  if (!stats) return <div style={{ padding: '40px', color: '#fff' }}>No analytics data found.</div>;

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>

      {/* Master Content Container (The One-Page UI) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '40px',
        padding: '50px',
        boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.4)',
        maxWidth: '1450px',
        margin: '0 auto',
        border: '1px solid #e2e8f0'
      }}>

        {/* Top Header Row inside the Master Box */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '50px',
          paddingBottom: '30px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
              <Activity size={38} color="#6366f1" strokeWidth={2.5} />
              <h1 style={{ fontSize: '3.2rem', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-2px' }}>
                Resource Analytics
              </h1>
            </div>
            <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0, fontWeight: '500', maxWidth: '600px' }}>
              In-depth evaluation of campus asset performance and occupancy metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
              <button onClick={() => window.location.href = '/admin'} style={navButtonStyle}>
                <LayoutDashboard size={16} /> Overview
              </button>
              <button style={{ ...navButtonStyle, background: '#10b981', color: '#fff', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)' }}>
                <TrendingUp size={16} /> Analytics
              </button>
            </div>
            <div style={{
              background: '#0f172a', color: '#fff', padding: '15px 25px', borderRadius: '18px',
              fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Calendar size={18} color="#6366f1" />
              Sync Period: {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        {/* 1. Summary Block */}
        <div style={{ marginBottom: '50px' }}>
          <SummaryCards stats={stats} isDark={false} />
        </div>

        {/* 2. Visual Intelligence Block (Charts) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px', marginBottom: '40px',
          padding: '40px', background: '#f8fafc', borderRadius: '35px', border: '1px solid #f1f5f9'
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
          marginTop: '60px', paddingTop: '30px', borderTop: '2px solid #f1f5f9',
          textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px'
        }}>
          DECISION SUPPORT ENGINE | POWERED BY SMART CAMPUS OPERATIONS HUB © 2026
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
  color: '#64748b',
  transition: 'all 0.3s'
};
