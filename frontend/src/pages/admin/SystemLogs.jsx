import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, CheckCircle, Trash2, Search, Filter, Loader2, Info, Activity } from 'lucide-react';

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
      return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    }
    return { bg: 'rgba(192, 128, 128, 0.1)', color: '#C08080' };
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#C08080' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>CONSULTING HISTORICAL RECORDS...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Reveal>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              Security <span style={{ color: '#C08080' }}>Audit Grid</span>
            </h1>
            <p style={{ color: '#6B7281', marginTop: '8px', fontWeight: '500' }}>Comprehensive chronological history of system activities and technical security events.</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Query Action, Target or Details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(192, 128, 128, 0.1)',
                borderRadius: '16px', padding: '14px 14px 14px 52px', color: '#1F1F1F', width: '360px', outline: 'none', fontWeight: '500'
              }}
            />
          </div>
        </header>
      </Reveal>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>{error}</div>}

      <Reveal>
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
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px', color: '#6B7281', fontSize: '0.9rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={14} color="#C08080" /> {new Date(log.timestamp).toLocaleString()}
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
                      {log.userId?.slice(-8).toUpperCase() || 'SYSTEM'}
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
               No audit events recorded for the specified query.
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
