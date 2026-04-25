import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Key, FileText, CheckCircle, Ticket, LogIn, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserActionTimeline() {
  const { id } = useParams();
  const { authFetch, API } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logRes, userRes] = await Promise.all([
        authFetch(`${API}/api/audit?userId=${id}`),
        authFetch(`${API}/api/users/${id}`)
      ]);
      const logData = await logRes.json();
      const userData = await userRes.json();
      setLogs(logData.content || logData);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('LOGIN')) return <LogIn className="log-icon login" size={16} />;
    if (actionType.includes('BOOKING')) return <CheckCircle className="log-icon booking" size={16} />;
    if (actionType.includes('TICKET')) return <Ticket className="log-icon ticket" size={16} />;
    if (actionType.includes('SECURITY') || actionType.includes('ROLE')) return <Shield className="log-icon security" size={16} />;
    return <FileText className="log-icon system" size={16} />;
  };

  if (loading) return <div className="loading-state glass-card">Loading Timeline...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '24px 0' }}>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={() => navigate('/admin/users')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>Security Timeline</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Chronological activity for {user?.fullName || id}</p>
        </div>
      </div>

      <div className="glass-card table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Details</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No recorded activity for this user.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="log-row">
                  <td className="log-time" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div className="log-action">
                      {getActionIcon(log.actionType)}
                      <span className="log-type-badge">{log.actionType}</span>
                    </div>
                  </td>
                  <td className="log-details" style={{ maxWidth: '400px', whiteSpace: 'normal' }}>
                    {log.details.includes('SOURCE: MICROSOFT') ? (
                      <span style={{ color: '#0ea5e9' }}>{log.details}</span>
                    ) : log.details}
                  </td>
                  <td className="log-ip" style={{ fontFamily: 'monospace' }}>
                    {log.ipAddress || 'Internal'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
