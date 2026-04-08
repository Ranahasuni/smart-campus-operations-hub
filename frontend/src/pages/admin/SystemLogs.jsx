import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, CheckCircle, Trash2, Search, Filter, Loader2, Info } from 'lucide-react';

/**
 * SystemLogs — ADMIN ONLY viewer for AuditLogs.
 * Retrieves comprehensive history of system events.
 */
export default function SystemLogs() {
  const { authFetch, API } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await authFetch(`${API}/api/logs`);
      if (!res.ok) throw new Error('Failed to fetch system logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data.reverse() : []); // Newest first
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
      return { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' };
    }
    return { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' };
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
      <p>Consulting historical records...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={32} color="#f59e0b" /> Security Audit
          </h1>
          <p style={{ color: '#94a3b8' }}>Comprehensive chronological history of system activities and security events</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search action or user ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 12px 12px 40px',
              color: '#fff',
              width: '300px',
              outline: 'none'
            }}
          />
        </div>
      </header>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ 
        background: 'rgba(15, 23, 42, 0.5)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>User ID</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const styles = getActionStyles(log.action);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 24px', color: '#94a3b8', fontSize: '0.875rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold',
                      background: styles.bg, color: styles.color, border: `1px solid ${styles.color}40`
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', color: '#cbd5e1', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {log.userId?.slice(-8)}
                  </td>
                  <td style={{ padding: '14px 24px', color: '#94a3b8', fontSize: '0.875rem' }}>
                    {log.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
