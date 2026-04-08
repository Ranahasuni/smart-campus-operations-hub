import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LayoutDashboard, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import SummaryCards from './SummaryCards';
import ResourcesByTypeChart from './ResourcesByTypeChart';
import ResourcesByBuildingChart from './ResourcesByBuildingChart';
import MostBookedTable from './MostBookedTable';

export default function ResourceAnalyticsPage() {
  const { authFetch, API } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/api/resources/analytics/summary`);
      if (!res.ok) throw new Error('Could not synchronize analytics engine.');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1', margin: '0 auto 20px' }} />
        <h2 style={{ fontWeight: 800, letterSpacing: '1px' }}>SYNCHRONIZING ANALYTICS ENGINE...</h2>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#0f172a', fontWeight: 900 }}>Analytics Offline</h2>
        <p style={{ color: '#64748b' }}>{error || 'The analytics engine encountered a failure.'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>

      {/* Page Header */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LayoutDashboard size={40} className="text-indigo-600" /> Resource Analytics
          </h1>
          <p style={{ color: '#64748b', fontWeight: '600', fontSize: '1.1rem' }}>
            In-depth evaluation of campus asset performance and occupancy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>
            <Calendar size={18} /> Last Updated: {new Date().toLocaleDateString()}
          </div>
          <div style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
            <TrendingUp size={18} /> System Uptime: 99.9%
          </div>
        </div>
      </header>

      {/* Summary Section */}
      <SummaryCards stats={stats} />

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '30px', marginBottom: '30px' }}>
        <ResourcesByTypeChart data={stats.distributionByType} />
        <ResourcesByBuildingChart data={stats.distributionByBuilding} />
      </div>

      {/* Top Performance Table */}
      <MostBookedTable data={stats.mostBooked} />

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 'bold' }}>
        © 2026 Smart Campus Operations Hub | Admin Decision Support Engine
      </footer>
    </div>
  );
}
