import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, CheckCircle, Trash2, Search, Filter, Loader2, Info, Activity } from 'lucide-react';

export default function SystemLogs() {
  const { authFetch, API } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, DAY, WEEK, MONTH

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Backend already returns DESC (newest first)
      const res = await authFetch(`${API}/api/logs?limit=1000`);
      if (!res.ok) throw new Error('Failed to fetch system logs');
      const data = await res.json();
      console.log('Audit Logs Data:', data);
      setLogs(Array.isArray(data) ? data : []); // Keep backend order (Newest first)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionStyles = (action) => {
    if (action?.includes('LOCKED') || action?.includes('DELETE') || action?.includes('FAILED')) {
      return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    }
    if (action?.includes('SUCCESS') || action?.includes('REGISTER')) {
      return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    }
    return { bg: 'rgba(192, 128, 128, 0.1)', color: '#C08080' };
  };

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    
    // 1. Text Search
    const matchesSearch = (
      (log.action?.toLowerCase() || "").includes(s) ||
      (log.details?.toLowerCase() || "").includes(s) ||
      (log.userId?.toLowerCase() || "").includes(s)
    );

    // 2. Time Filter
    let matchesTime = true;
    if (timeFilter !== 'ALL' && log.timestamp) {
      const logDate = Array.isArray(log.timestamp) 
        ? new Date(log.timestamp[0], log.timestamp[1]-1, log.timestamp[2], log.timestamp[3], log.timestamp[4], log.timestamp[5])
        : new Date(log.timestamp);
      
      const now = new Date();
      const diffMs = now - logDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === 'DAY') matchesTime = diffDays <= 1;
      else if (timeFilter === 'WEEK') matchesTime = diffDays <= 7;
      else if (timeFilter === 'MONTH') matchesTime = diffDays <= 30;
    }

    return matchesSearch && matchesTime;
  });

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#C08080' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>CONSULTING HISTORICAL RECORDS...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            Security <span style={{ color: '#C08080' }}>Audit Grid</span>
          </h1>
          <p style={{ color: '#6B7281', marginTop: '8px', fontWeight: '500' }}>Comprehensive chronological history of system activities and technical security events.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(192, 128, 128, 0.1)',
                borderRadius: '16px', padding: '14px 16px 14px 44px', color: '#1F1F1F', outline: 'none', fontWeight: '600', cursor: 'pointer', appearance: 'none'
              }}
            >
              <option value="ALL">All Time</option>
              <option value="DAY">Last 24 Hours</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Query Action, Principal or Details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(192, 128, 128, 0.1)',
                borderRadius: '16px', padding: '14px 14px 14px 52px', color: '#1F1F1F', width: '300px', outline: 'none', fontWeight: '500'
              }}
            />
          </div>
        </div>
      </header>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>{error}</div>}

      <div style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', border: '1px solid rgba(192, 128, 128, 0.1)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(140, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(192, 128, 128, 0.06)', borderBottom: '1px solid rgba(192, 128, 128, 0.08)' }}>
              <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '950' }}>Precise Timestamp</th>
              <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '950' }}>Event Action</th>
              <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '950' }}>Security Principal</th>
              <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '950' }}>Activity Details & Metadata</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const styles = getActionStyles(log.action);
              
              let timestamp = 'N/A';
              if (log.timestamp) {
                if (Array.isArray(log.timestamp)) {
                  const [y, m, d, hh, mm, ss] = log.timestamp;
                  timestamp = new Date(y, m - 1, d, hh, mm, ss).toLocaleString();
                } else {
                  timestamp = new Date(log.timestamp).toLocaleString();
                }
              }

              return (
                <tr key={log.id || idx} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px', color: '#6B7281', fontSize: '0.9rem', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={14} color="#C08080" /> {timestamp}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      padding: '6px 14px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: '900',
                      background: styles.bg, color: styles.color, border: `1px solid ${styles.color}30`,
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#1F1F1F', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                    {log.userId ? (log.userId.length > 8 ? log.userId.slice(-8).toUpperCase() : log.userId.toUpperCase()) : 'SYSTEM'}
                  </td>
                  <td style={{ padding: '20px 24px', color: '#4B5563', fontSize: '0.9rem', fontWeight: '500' }}>
                    {log.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281', fontSize: '1.1rem', fontWeight: '600' }}>
             No audit events recorded for the specified criteria.
          </div>
        )}
      </div>
    </div>
  );
}
