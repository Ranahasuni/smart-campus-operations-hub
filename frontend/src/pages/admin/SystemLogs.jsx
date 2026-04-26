import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, Search, Filter, Loader2, Activity, Shield, User, Users, Cpu, AlertTriangle } from 'lucide-react';
import './SystemLogs.css';

/**
 * Security Audit Grid — Premium SOC-Inspired Design
 * 
 * SECURITY PRINCIPAL EXPLAINED:
 * ─────────────────────────────
 * In security auditing, a "Security Principal" is the authenticated identity
 * (user, service, or system process) responsible for an action. In this system:
 *   • principalId  = the campus-wide unique identifier (e.g. lec01, stu05, admin01)
 *   • principalRole = the authorization level at the time of the event (ADMIN, LECTURER, STUDENT, STAFF)
 *   • userId        = internal MongoDB ObjectId (fallback for older records without principalId)
 *   • SYSTEM        = automated/scheduled events with no human actor
 *
 * This is critical for accountability, compliance, and forensic analysis.
 */
export default function SystemLogs() {
  const { authFetch, API } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await authFetch(`${API}/api/logs?limit=1000`);
      if (!res.ok) throw new Error('Failed to fetch system logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Action Severity Classification ──────────────────────────────
  const getActionSeverity = (action) => {
    if (!action) return 'neutral';
    if (action.includes('LOCKED') || action.includes('DELETE') || action.includes('FAILED') || action.includes('BLOCKED') || action.includes('REJECTED')) return 'critical';
    if (action.includes('SUCCESS') || action.includes('REGISTER') || action.includes('APPROVED') || action.includes('CHECK_IN')) return 'success';
    if (action.includes('CANCEL') || action.includes('REOPENED')) return 'warning';
    if (action.includes('CREATE') || action.includes('UPDATE') || action.includes('ASSIGNED') || action.includes('COMMENT') || action.includes('UPLOAD')) return 'info';
    return 'neutral';
  };

  // ── Principal Display Logic ─────────────────────────────────────
  const getPrincipalDisplay = (log) => {
    // New enriched logs have principalId directly
    if (log.principalId) {
      return {
        id: log.principalId.toUpperCase(),
        role: log.principalRole || 'UNKNOWN',
      };
    }
    // Fallback for older logs: derive from userId or details
    if (!log.userId) {
      return { id: 'SYSTEM', role: 'SYSTEM' };
    }
    // Extract campusId from details if possible (e.g., "User lec01 authenticated...")
    const match = log.details?.match(/User\s+(\S+)\s/i);
    if (match) {
      return { id: match[1].toUpperCase(), role: guessRoleFromId(match[1]) };
    }
    // Last resort: show truncated ObjectId
    return { 
      id: log.userId.length > 8 ? log.userId.slice(-8).toUpperCase() : log.userId.toUpperCase(),
      role: 'UNKNOWN'
    };
  };

  const guessRoleFromId = (campusId) => {
    if (!campusId) return 'UNKNOWN';
    const lower = campusId.toLowerCase();
    if (lower.startsWith('admin')) return 'ADMIN';
    if (lower.startsWith('lec')) return 'LECTURER';
    if (lower.startsWith('stu')) return 'STUDENT';
    if (lower.startsWith('staff')) return 'STAFF';
    return 'UNKNOWN';
  };

  const getRoleAvatarClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return 'role-admin';
    if (r === 'LECTURER') return 'role-lecturer';
    if (r === 'STUDENT') return 'role-student';
    if (r === 'STAFF') return 'role-staff';
    return 'role-system';
  };

  const getRoleAvatarInitials = (principal) => {
    const r = (principal.role || '').toUpperCase();
    if (r === 'SYSTEM') return '⚙';
    if (r === 'ADMIN') return 'AD';
    if (r === 'LECTURER') return 'LC';
    if (r === 'STUDENT') return 'ST';
    if (r === 'STAFF') return 'SF';
    // If we have a principalId, use first 2 chars
    if (principal.id && principal.id !== 'SYSTEM') return principal.id.slice(0, 2);
    return '??';
  };

  // ── Timestamp Formatting ────────────────────────────────────────
  const formatTimestamp = (ts) => {
    if (!ts) return { date: '—', time: '' };
    let d;
    if (Array.isArray(ts)) {
      const [y, m, day, hh, mm, ss] = ts;
      d = new Date(y, m - 1, day, hh, mm, ss);
    } else {
      d = new Date(ts);
    }
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    };
  };

  // ── Filtering ───────────────────────────────────────────────────
  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (
      (log.action?.toLowerCase() || "").includes(s) ||
      (log.details?.toLowerCase() || "").includes(s) ||
      (log.userId?.toLowerCase() || "").includes(s) ||
      (log.principalId?.toLowerCase() || "").includes(s) ||
      (log.principalRole?.toLowerCase() || "").includes(s)
    );

    let matchesTime = true;
    if (timeFilter !== 'ALL' && log.timestamp) {
      const logDate = Array.isArray(log.timestamp)
        ? new Date(log.timestamp[0], log.timestamp[1] - 1, log.timestamp[2], log.timestamp[3], log.timestamp[4], log.timestamp[5])
        : new Date(log.timestamp);
      const diffDays = (Date.now() - logDate) / (1000 * 60 * 60 * 24);
      if (timeFilter === 'DAY') matchesTime = diffDays <= 1;
      else if (timeFilter === 'WEEK') matchesTime = diffDays <= 7;
      else if (timeFilter === 'MONTH') matchesTime = diffDays <= 30;
    }

    return matchesSearch && matchesTime;
  });

  // ── Statistics ──────────────────────────────────────────────────
  const totalEvents = filteredLogs.length;
  const criticalCount = filteredLogs.filter(l => getActionSeverity(l.action) === 'critical').length;
  const uniquePrincipals = new Set(filteredLogs.map(l => l.principalId || l.userId || 'SYSTEM')).size;

  // ── Render ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-loading">
          <div className="audit-loading-spinner" />
          <div className="audit-loading-text">Decrypting audit trail...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="audit-container">
        {/* ═══ Header ═══ */}
        <header className="audit-header">
          <div className="audit-header-left">
            <h1 className="audit-title">
              <Shield size={28} style={{ color: '#c08080' }} />
              Security <span className="audit-title-accent">Audit Grid</span>
              <span className="audit-live-badge">
                <span className="audit-live-dot" />
                Live
              </span>
            </h1>
            <p className="audit-subtitle">
              Comprehensive forensic timeline of authenticated actions, security events, and system-level operations.
            </p>
          </div>

          <div className="audit-controls">
            <div className="audit-filter-wrap">
              <Filter size={15} className="audit-filter-icon" />
              <select 
                className="audit-select" 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="ALL">All Time</option>
                <option value="DAY">Last 24 Hours</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>
            </div>
            <div className="audit-filter-wrap">
              <Search size={16} className="audit-filter-icon" />
              <input
                className="audit-search-input"
                type="text"
                placeholder="Search actions, principals, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* ═══ Stats ═══ */}
        <div className="audit-stats">
          <div className="audit-stat-chip">
            <Activity size={14} style={{ color: '#c08080' }} />
            Total Events: <span className="audit-stat-value">{totalEvents.toLocaleString()}</span>
          </div>
          <div className="audit-stat-chip">
            <AlertTriangle size={14} style={{ color: '#f87171' }} />
            Critical: <span className="audit-stat-value" style={{ color: criticalCount > 0 ? '#f87171' : undefined }}>{criticalCount}</span>
          </div>
          <div className="audit-stat-chip">
            <Users size={14} style={{ color: '#60a5fa' }} />
            Unique Principals: <span className="audit-stat-value">{uniquePrincipals}</span>
          </div>
        </div>

        {/* ═══ Error ═══ */}
        {error && (
          <div className="audit-error">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {/* ═══ Data Grid ═══ */}
        <div className="audit-table-wrap" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table className="audit-table">
            <thead className="audit-thead">
              <tr>
                <th className="audit-th">Timestamp</th>
                <th className="audit-th">Event Action</th>
                <th className="audit-th">Security Principal</th>
                <th className="audit-th">Activity Details & Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const severity = getActionSeverity(log.action);
                const principal = getPrincipalDisplay(log);
                const ts = formatTimestamp(log.timestamp);

                return (
                  <tr
                    key={log.id || idx}
                    className="audit-row"
                    style={{ animationDelay: `${Math.min(idx * 20, 600)}ms` }}
                  >
                    {/* Timestamp */}
                    <td className="audit-td">
                      <div className="audit-timestamp">
                        <span className="audit-timestamp-date">{ts.date}</span>
                        <span className="audit-timestamp-time">{ts.time}</span>
                      </div>
                    </td>

                    {/* Event Action */}
                    <td className="audit-td">
                      <span className={`audit-action-badge severity-${severity}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Security Principal */}
                    <td className="audit-td">
                      <div className="audit-principal">
                        <div className={`audit-principal-avatar ${getRoleAvatarClass(principal.role)}`}>
                          {getRoleAvatarInitials(principal)}
                        </div>
                        <div className="audit-principal-info">
                          <span className="audit-principal-id">{principal.id}</span>
                          <span className="audit-principal-role">{principal.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="audit-td">
                      <span className="audit-details">{log.details}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="audit-empty">
              <div className="audit-empty-icon">
                <Shield size={28} />
              </div>
              <div className="audit-empty-text">No audit events match your criteria</div>
              <div className="audit-empty-sub">Try adjusting your time filter or search query</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
